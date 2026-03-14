"use client";

import { useEffect, useRef, useState } from "react";

interface Props { brand: string; name: string; size: string; category: string; }

type BadgeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "link"; url: string }
  | { status: "price"; price: number; url: string };

const FOOTWEAR_CATEGORIES = new Set(["Footwear", "Shoes", "Sneakers"]);

function buildQuery(brand: string, name: string, size: string, category: string) {
  const base = `${brand} ${name}`;
  return (FOOTWEAR_CATEGORIES.has(category) ? `${base} ${size}` : base).slice(0, 100).trim();
}

export default function StockXBadge({ brand, name, size, category }: Props) {
  const [state, setState] = useState<BadgeState>({ status: "idle" });
  const ref   = useRef<HTMLDivElement>(null);
  const query = buildQuery(brand, name, size, category);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      setState({ status: "loading" });
      fetch(`/api/stockx?q=${encodeURIComponent(query)}`)
        .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<{ price: number | null; url: string | null }>; })
        .then(({ price, url }) => {
          const href = url ?? `https://stockx.com/search?s=${encodeURIComponent(query)}`;
          setState(price != null ? { status: "price", price, url: href } : { status: "link", url: href });
        })
        .catch(() => setState({ status: "link", url: `https://stockx.com/search?s=${encodeURIComponent(query)}` }));
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pill = "group/sx flex items-center gap-1 border border-[rgba(134,193,90,0.5)] bg-[#F6F1E6]/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-[#4a7a28] backdrop-blur-sm transition-colors hover:border-[#86C15A] hover:bg-[#F6F1E6] whitespace-nowrap";

  const Arrow = () => (
    <svg className="h-2.5 w-2.5 shrink-0" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 10L10 2m0 0H5m5 0v5" />
    </svg>
  );

  return (
    <div ref={ref} className="absolute bottom-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
      {state.status === "loading" && (
        <div className="h-5 w-10 animate-pulse bg-[#EDE8DC]/80 backdrop-blur-sm" />
      )}
      {state.status === "link" && (
        <button type="button" onClick={(e) => { e.stopPropagation(); window.open(state.url, "_blank", "noopener,noreferrer"); }} className={[pill, "cursor-pointer opacity-80 hover:opacity-100"].join(" ")}>
          <span>SX</span><Arrow />
        </button>
      )}
      {state.status === "price" && (
        <button type="button" onClick={(e) => { e.stopPropagation(); window.open(state.url, "_blank", "noopener,noreferrer"); }} className={[pill, "max-w-[5.5rem] overflow-hidden transition-all duration-300 hover:max-w-[12rem] cursor-pointer"].join(" ")}>
          <span className="shrink-0">SX ${state.price.toLocaleString()}</span>
          <span className="opacity-0 transition-opacity duration-200 group-hover/sx:opacity-100">· Sell</span>
          <span className="opacity-0 transition-opacity duration-200 group-hover/sx:opacity-100"><Arrow /></span>
        </button>
      )}
    </div>
  );
}
