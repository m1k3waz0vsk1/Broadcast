"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ShoppingCart, Menu, X, Radio } from "lucide-react";
import { useCart } from "@/components/cart-context";

export function Header() {
  const { data: session, status } = useSession();
  const { count: cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "Packages" },
    { href: "/pricing", label: "Membership" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent-2">
            <Radio className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg">
            Broadcast<span className="gradient-text">GFX</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-accent hover:text-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-live px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {status === "authenticated" ? (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="text-sm text-muted transition hover:text-foreground"
              >
                {session.user?.name || session.user?.email}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-accent"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-muted transition hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/cart" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
              Cart ({cartCount})
            </Link>
            {status === "authenticated" ? (
              <>
                <Link href="/account" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
                  Account
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left text-sm text-muted"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
                <Link href="/register" className="text-sm text-accent-2" onClick={() => setMenuOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
