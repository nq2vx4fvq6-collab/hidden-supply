import type { ReactNode } from "react";
import Link from "next/link";

const sidebarLinks = [
  { href: "/admin/accounts", label: "Dashboard" },
  { href: "/admin/accounts/accounts", label: "Accounts" },
  { href: "/admin/accounts/sales", label: "Sales" },
  { href: "/admin/accounts/supply", label: "Supply cross-check" },
];

export default function AccountsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-zinc-800/60 bg-black/40 lg:block">
          <div className="sticky top-0 flex h-screen flex-col py-6">
            <div className="px-4 pb-4">
              <Link
                href="/admin"
                className="text-[11px] text-zinc-500 transition-colors hover:text-accent"
              >
                ← Back to Admin
              </Link>
            </div>
            <div className="px-3">
              <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500">
                Reseller accounts
              </p>
              <nav className="space-y-0.5">
                {sidebarLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block rounded-lg px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-accent"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile top bar with back + menu hint */}
        <div className="flex flex-1 flex-col lg:min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800/60 bg-zinc-950/90 px-4 py-3 backdrop-blur lg:px-8">
            <Link
              href="/admin"
              className="text-[11px] text-zinc-500 transition-colors hover:text-accent lg:hidden"
            >
              ← Admin
            </Link>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 lg:hidden">
              Reseller accounts
            </p>
            <Link
              href="/admin/accounts/accounts"
              className="rounded-full border border-zinc-700 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              Accounts
            </Link>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>

      {/* Mobile nav at bottom */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-zinc-800 bg-zinc-950/95 py-2 lg:hidden">
        <div className="mx-auto flex w-full max-w-md justify-around">
          <Link
            href="/admin/accounts"
            className="px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-500"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/accounts/accounts"
            className="px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-500"
          >
            Accounts
          </Link>
          <Link
            href="/admin/accounts/sales"
            className="px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-500"
          >
            Sales
          </Link>
          <Link
            href="/admin/accounts/supply"
            className="px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-500"
          >
            Supply
          </Link>
        </div>
      </nav>
      <div className="h-14 lg:hidden" aria-hidden />
    </div>
  );
}
