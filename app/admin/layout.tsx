"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconBox({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconChart({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function IconUsers({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

// ── Nav links ──────────────────────────────────────────────────────────────────

const navLinks = [
  { href: "/admin",               label: "Dashboard" },
  { href: "/admin/items",         label: "Inventory"  },
  { href: "/admin/sales",         label: "Sales"      },
  { href: "/admin/accounts",      label: "Accounts"   },
  { href: "/admin/items/new",     label: "Add Item"   },
  { href: "/admin/sync",          label: "Sync"       },
  { href: "/admin/import-export", label: "Excel"      },
];

const bottomTabs = [
  { href: "/admin",          label: "Home",      icon: IconHome  },
  { href: "/admin/items",    label: "Inventory", icon: IconBox   },
  { href: "/admin/sales",    label: "Sales",     icon: IconChart },
  { href: "/admin/accounts", label: "Accounts",  icon: IconUsers },
  { href: "/admin/sync",     label: "More",      icon: IconMore  },
];

// ── Top nav (desktop) ──────────────────────────────────────────────────────────

function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-0.5 md:flex">
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

// ── Bottom tab bar (mobile) ────────────────────────────────────────────────────

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[rgba(10,10,11,0.96)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {bottomTabs.map((tab) => {
          const isActive =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-150",
                isActive ? "text-[#86C15A]" : "text-zinc-600 active:text-zinc-300",
              ].join(" ")}
            >
              <Icon active={isActive} />
              <span className={`text-[9px] uppercase tracking-[0.15em] ${isActive ? "text-[#86C15A]" : "text-zinc-600"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(10,10,11,0.9)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="group flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center bg-[#86C15A] text-[10px] font-black uppercase tracking-widest text-[#050608] transition-opacity duration-200 group-hover:opacity-80">
                HS
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 transition-colors duration-200 group-hover:text-[#86C15A]">
                Admin
              </span>
            </Link>

            <div className="hidden h-4 w-px bg-white/10 md:block" />
            <AdminNav />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/"
              className="hidden text-[11px] uppercase tracking-[0.2em] text-zinc-600 transition-colors duration-150 hover:text-[#86C15A] md:block"
            >
              ← Catalog
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Page content — extra bottom padding on mobile for the tab bar */}
      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
