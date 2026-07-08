import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

function mapSubscriptionStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

async function upsertSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  fallbackUserId?: string,
  fallbackPlanId?: string
) {
  const userId = (subscription.metadata?.userId as string | undefined) ?? fallbackUserId;
  const planId = (subscription.metadata?.planId as string | undefined) ?? fallbackPlanId;
  if (!userId || !planId) return;

  const periodEndSeconds = (subscription as unknown as { current_period_end?: number })
    .current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: mapSubscriptionStatus(subscription.status),
      currentPeriodEnd: new Date(periodEndSeconds * 1000),
    },
    create: {
      userId,
      planId,
      stripeSubscriptionId: subscription.id,
      status: mapSubscriptionStatus(subscription.status),
      currentPeriodEnd: new Date(periodEndSeconds * 1000),
    },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (!signature || !webhookSecret) {
      throw new Error("Missing Stripe signature or webhook secret.");
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "payment") {
        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;
        if (orderId) {
          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              stripePaymentIntentId:
                typeof session.payment_intent === "string" ? session.payment_intent : undefined,
            },
            include: { items: true },
          });

          if (userId) {
            await prisma.cartItem.deleteMany({
              where: {
                userId,
                productId: { in: order.items.map((i) => i.productId) },
              },
            });
          }
        }
      }

      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertSubscriptionFromStripe(
          subscription,
          session.metadata?.userId,
          session.metadata?.planId
        );
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripe(subscription);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
