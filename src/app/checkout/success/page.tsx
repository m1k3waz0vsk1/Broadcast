import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <CheckCircle2 className="h-8 w-8 text-accent-2" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold">Payment successful</h1>
      <p className="mt-3 text-muted">
        Your order is confirmed. Your files are ready in your account dashboard — downloads
        unlock as soon as Stripe confirms payment (usually within a few seconds).
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/account/orders"
          className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-white"
        >
          Go to your downloads
        </Link>
        <Link href="/products" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
