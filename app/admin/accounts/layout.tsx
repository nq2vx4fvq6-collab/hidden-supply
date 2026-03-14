import type { ReactNode } from "react";
import Link from "next/link";

const NAV = [
  { href: "/admin/accounts",          label: "Dashboard",      icon: "◈" },
  { href: "/admin/accounts/accounts", label: "Accounts",       icon: "◉" },
  { href: "/admin/accounts/sales",    label: "Sales Monitor",  icon: "◎" },
  { href: "/admin/accounts/supply",   label: "Supply Check",   icon: "◐" },
];

export default function AccountsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex">

        {/* ── Desktop sidebar ────────────────────────────────────────────── */}
        <aside className="hidden w-60 shrink-0 border-r border-zinc-800/50 lg:flex flex-col" style={{ minHeight: "100vh" }}>
          {/* Brand bar */}
          <div className="border-b border-zinc-800/50 px-5 py-4">
            <Link href="/admin" className="group flex items-center gap-2">
              <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">← Admin</span>
            </Link>
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-200">Markets</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Urban Supply</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <p className="px-3 mb-2 text-[9px] font-semibold uppercase tracking-[0.35em] text-zinc-600">Navigation</p>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-zinc-100 group"
              >
                <span className="text-zinc-600 group-hover:text-accent text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom quick action */}
          <div className="border-t border-zinc-800/50 px-3 py-4">
            <Link
              href="/admin/accounts/accounts/new"
              className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 transition-all hover:border-accent/50 hover:bg-accent/5 hover:text-zinc-100"
            >
              <span>+</span> Add account
            </Link>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col min-w-0">

          {/* Mobile header */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800/60 bg-zinc-950/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/admin" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
              ← Admin
            </Link>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-300">Markets</span>
            <Link
              href="/admin/accounts/accounts/new"
              className="rounded-full bg-accent/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground"
            >
              + Add
            </Link>
          </header>

          {/* Desktop top bar */}
          <div className="hidden lg:flex items-center justify-between border-b border-zinc-800/40 bg-zinc-950/60 px-8 py-3">
            <nav className="flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/admin/accounts/accounts/new"
              className="rounded-full bg-accent px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90"
            >
              + Add account
            </Link>
          </div>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-5xl w-full mx-auto">{children}</main>
        </div>
      </div>

      {/* ── Mobile bottom nav ──────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-zinc-800 bg-zinc-950/98 py-2 lg:hidden">
        <div className="mx-auto flex w-full max-w-sm justify-around">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-[9px] uppercase tracking-wider">{item.label.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="h-14 lg:hidden" aria-hidden />
    </div>
  );
}
