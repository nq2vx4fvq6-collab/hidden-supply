import type { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/items", label: "Inventory" },
  { href: "/admin/sales", label: "Sales" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/items/new", label: "Add Item" },
  { href: "/admin/sync", label: "Sync" },
  { href: "/admin/import-export", label: "Excel" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold tracking-widest text-zinc-200 transition-colors group-hover:ring-2 group-hover:ring-accent/50 group-hover:bg-zinc-700">
                US
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 transition-colors group-hover:text-accent">
                Admin
              </span>
            </Link>
            <nav className="flex items-center">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-zinc-500 transition-all duration-200 hover:bg-zinc-800/60 hover:text-accent active:scale-[0.96]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[11px] text-zinc-600 transition-colors hover:text-accent"
            >
              ← View Catalog
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
