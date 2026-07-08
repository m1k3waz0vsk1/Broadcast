import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { SubscribeButton } from "@/components/subscribe-button";
import { CheckCircle2 } from "lucide-react";

const perks = [
  "Unlimited downloads of every broadcast package",
  "New graphics packages added monthly",
  "Full commercial license",
  "Cancel anytime, no long-term contract",
];

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({ orderBy: { priceCents: "asc" } });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">All-Access Membership</h1>
        <p className="mt-4 text-muted">
          Unlimited access to every webinar, livestream, and conference graphics package —
          instead of paying per package.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {plans.map((plan) => {
          const isYearly = plan.interval === "year";
          return (
            <div
              key={plan.id}
              className={`card-glow relative flex flex-col rounded-2xl bg-surface p-8 ${
                isYearly ? "border border-accent" : ""
              }`}
            >
              {isYearly && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-3 py-1 text-xs font-semibold text-white">
                  Save 40%
                </span>
              )}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
              <div className="mt-6 text-4xl font-semibold">
                {formatPrice(plan.priceCents, plan.currency)}
                <span className="text-base font-normal text-muted">/{plan.interval}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-muted">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-accent-2" /> {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <SubscribeButton planId={plan.id} label={`Subscribe ${plan.interval === "year" ? "yearly" : "monthly"}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
