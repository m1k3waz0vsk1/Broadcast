import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/products");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-2">Admin</span>
          <h1 className="mt-1 text-2xl font-semibold">Store management</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 text-sm font-semibold text-white"
          >
            + New product
          </Link>
          <Link href="/products" className="text-sm text-muted hover:text-foreground">
            Back to store →
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <AdminNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
