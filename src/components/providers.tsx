"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </CartProvider>
    </SessionProvider>
  );
}
