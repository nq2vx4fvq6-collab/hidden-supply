"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

const navLinks = [
  { href: "/admin",              label: "Dashboard" },
  { href: "/admin/items",        label: "Inventory"  },
  { href: "/admin/sales",        label: "Sales"      },
  { href: "/admin/accounts",     label: "Accounts"   },
  { href: "/admin/items/new",    label: "Add Item"   },
  { href: "/admin/sync",         label: "Sync"       },
  { href: "/admin/import-export",label: "Excel"      },
];

function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5">
      {navLinks.map((l) => {
        const isActive =
          l.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={[
              "relative px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-150",
              isActive
                ? "text-[#86C15A]"
                : "text-zinc-500 hover:text-zinc-200",
            ].join(" ")}
          >
            {l.label}
            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-px bg-[#86C15A] opacity-60" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgba(10,10,11,0.9)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-5">
            <Link href="/admin" className="group flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center bg-[#86C15A] text-[10px] font-black uppercase tracking-widest text-[#050608] transition-opacity duration-200 group-hover:opacity-80">
                HS
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 transition-colors duration-200 group-hover:text-[#86C15A]">
                Admin
              </span>
            </Link>

            <div className="h-4 w-px bg-white/10" />

            <AdminNav />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[11px] uppercase tracking-[0.2em] text-zinc-600 transition-colors duration-150 hover:text-[#86C15A]"
            >
              ← Catalog
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
