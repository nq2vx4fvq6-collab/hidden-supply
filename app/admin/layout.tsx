import type { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/items", label: "Inventory" },
  { href: "/admin/sales", label: "Sales" },
  { href: "/admin/items/new", label: "Add Item" },
  { href: "/admin/import-export", label: "Excel" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold tracking-widest text-zinc-200">
                US
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">
                Admin
              </span>
            </Link>
            <nav className="flex items-center">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
            >
              ← View Catalog
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
