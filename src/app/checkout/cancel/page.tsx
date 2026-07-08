import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-live/10">
        <XCircle className="h-8 w-8 text-live" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold">Checkout canceled</h1>
      <p className="mt-3 text-muted">No charge was made. Your cart is still saved.</p>
      <div className="mt-8">
        <Link
          href="/cart"
          className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-white"
        >
          Return to cart
        </Link>
      </div>
    </div>
  );
}
