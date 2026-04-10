"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function BarcodeMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-stretch gap-[2px] ${className}`}>
      <div className="w-[2px] bg-current" />
      <div className="w-[5px] bg-current opacity-30" />
      <div className="w-[2px] bg-current" />
      <div className="w-[9px] bg-current" />
      <div className="w-[2px] bg-current opacity-30" />
      <div className="w-[3px] bg-current" />
      <div className="w-[2px] bg-current opacity-20" />
      <div className="w-[3px] bg-[#86C15A]" />
      <div className="w-[2px] bg-current opacity-20" />
      <div className="w-[3px] bg-current" />
      <div className="w-[9px] bg-current" />
      <div className="w-[2px] bg-current opacity-30" />
      <div className="w-[2px] bg-current" />
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(246,241,230,0.88)] backdrop-blur-md shadow-[0_1px_0_0_rgba(5,6,8,0.08)]"
          : "bg-[#F6F1E6] border-b border-[rgba(5,6,8,0.08)]",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <BarcodeMark className="h-5 text-[#050608] transition-opacity duration-200 group-hover:opacity-50" />
          <div className="leading-none">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#050608] transition-opacity duration-200 group-hover:opacity-50">
              Hidden Supply
            </p>
            <p className="mt-0.5 text-[8px] uppercase tracking-[0.22em] text-[#7A7A7A]">
              Private Reseller Network
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 sm:flex">
          {[
            { label: "Inventory", href: "/#inventory" },
            { label: "Community", href: "/community"  },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="group relative text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A] transition-colors duration-200 hover:text-[#050608]"
            >
              {label}
              <span className="absolute -bottom-px left-0 h-px w-0 bg-[#86C15A] transition-[width] duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="hidden text-[10px] uppercase tracking-[0.22em] text-[#7A7A7A] transition-colors duration-200 hover:text-[#050608] sm:block"
          >
            Login
          </Link>

          <a
            href="https://discord.gg/W3WkSyUB"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press flex items-center gap-2 bg-[#050608] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#F6F1E6] transition-colors duration-200 hover:bg-[#86C15A] hover:text-[#050608]"
          >
            Join Network
          </a>

          <Link
            href="/admin"
            title="Admin"
            className="hidden h-7 w-7 items-center justify-center border border-[rgba(5,6,8,0.12)] text-[#C4C4C4] transition-all duration-200 hover:border-[#050608] hover:text-[#050608] active:scale-90 sm:flex"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-7 w-7 items-center justify-center text-[#050608] sm:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <div className="flex flex-col gap-[5px]">
              <span className={`block h-px w-5 bg-current transition-all duration-200 ${mobileOpen ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`block h-px w-5 bg-current transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-px w-5 bg-current transition-all duration-200 ${mobileOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-[rgba(5,6,8,0.08)] bg-[#F6F1E6] transition-all duration-300 sm:hidden ${
          mobileOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-4 px-6 py-5">
          {[
            { label: "Inventory", href: "/#inventory"  },
            { label: "Community", href: "/community"   },
            { label: "Login",     href: "/admin/login" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-[11px] uppercase tracking-[0.25em] text-[#7A7A7A] transition-colors duration-150 hover:text-[#050608]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
