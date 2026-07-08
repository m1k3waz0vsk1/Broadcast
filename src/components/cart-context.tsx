"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type CartContextValue = {
  count: number;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue>({ count: 0, refresh: async () => {} });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setCount(0);
      return;
    }
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const data = await res.json();
      setCount(
        (data.items ?? []).reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
      );
    } catch {
      // ignore
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial cart fetch on mount/auth change
    void refresh();
  }, [refresh]);

  return <CartContext.Provider value={{ count, refresh }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
