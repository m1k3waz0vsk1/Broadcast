import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-semibold">
              Broadcast<span className="gradient-text">GFX</span>
            </span>
            <p className="mt-3 text-sm text-muted">
              Broadcast-quality graphics packages for webinars, livestreams, and conferences.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Shop</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/products" className="hover:text-foreground">All packages</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Membership</Link></li>
              <li><Link href="/products?category=webinar" className="hover:text-foreground">Webinar graphics</Link></li>
              <li><Link href="/products?category=livestream" className="hover:text-foreground">Livestream overlays</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/account" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/account/orders" className="hover:text-foreground">Order history</Link></li>
              <li><Link href="/cart" className="hover:text-foreground">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/license" className="hover:text-foreground">License</Link></li>
              <li><Link href="/support" className="hover:text-foreground">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} BroadcastGFX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
