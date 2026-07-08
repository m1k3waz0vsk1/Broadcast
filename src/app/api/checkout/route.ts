import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  if (!isStripeConfigured) {
    return NextResponse.json(
      { error: "Payments aren't configured yet. Add STRIPE_SECRET_KEY to your .env file." },
      { status: 503 }
    );
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const totalCents = cartItems.reduce((sum, i) => sum + i.product.priceCents, 0);
  const currency = cartItems[0].product.currency;

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      status: "PENDING",
      totalCents,
      currency,
      items: {
        create: cartItems.map((i) => ({
          productId: i.productId,
          priceCents: i.product.priceCents,
          quantity: i.quantity,
        })),
      },
    },
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  let customerId = user?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email ?? undefined,
      name: user?.name ?? undefined,
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: session.user.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: cartItems.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: i.product.currency,
          unit_amount: i.product.priceCents,
          product_data: {
            name: i.product.title,
            description: i.product.tagline,
          },
        },
      })),
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      metadata: { orderId: order.id, userId: session.user.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    const message = err instanceof Error ? err.message : "Unknown Stripe error.";
    return NextResponse.json({ error: `Stripe error: ${message}` }, { status: 502 });
  }
}
