import { Suspense } from "react";
import Link from "next/link";
import { getAllItems } from "@/lib/services/inventoryService";
import type { ItemFilters, InventoryStatus } from "@/lib/models";
import Header from "@/components/catalog/Header";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import StatusBadge from "@/components/ui/StatusBadge";
import StockXBadge from "@/components/catalog/StockXBadge";

interface HomeProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

const PUBLIC_STATUSES: InventoryStatus[] = ["available", "reserved"];


/** Small barcode-pattern divider */
function BarcodeDivider() {
  return (
    <div className="flex items-center gap-[2px] opacity-20" aria-hidden="true">
      {[2, 5, 2, 10, 2, 4, 2, 18, 2, 8, 2, 4, 2, 3, 2, 14, 2, 6, 10, 2, 4, 2, 18, 2, 3, 2].map((w, i) => (
        <div
          key={i}
          className="bg-[#050608]"
          style={{ width: `${w}px`, height: "12px" }}
        />
      ))}
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const sort = params.sort || "newest";

  const filters: ItemFilters = {
    search: params.search || undefined,
    brand:    params.brand    || undefined,
    category: params.category || undefined,
    size:     params.size     || undefined,
  };

  const allItems = await getAllItems(filters);
  const visible  = allItems.filter((i) => PUBLIC_STATUSES.includes(i.status));

  const items = [...visible].sort((a, b) => {
    if (sort === "price_asc")  return (a.listPrice ?? 0) - (b.listPrice ?? 0);
    if (sort === "price_desc") return (b.listPrice ?? 0) - (a.listPrice ?? 0);
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  const hasFilters = !!(params.search || params.brand || params.category || params.size);

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-[#050608]">
      <Header />

      {/* ════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[rgba(5,6,8,0.08)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid min-h-[520px] grid-cols-1 items-center gap-0 md:grid-cols-[1fr_320px]">

            {/* Left — copy */}
            <div className="flex flex-col justify-center py-16 pr-0 md:pr-20">
              <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-[#7A7A7A]">
                Private Reseller Network
              </p>

              <h1 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-[#050608] sm:text-6xl md:text-7xl lg:text-8xl">
                Private<br />access to<br />trusted<br />inventory
              </h1>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-[#7A7A7A]">
                Hidden Supply is a private reseller platform connecting verified
                sellers with curated bulk inventory, exclusive cooks, and a trusted
                network built for serious operators.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="#inventory"
                  className="flex items-center gap-2.5 bg-[#050608] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#F6F1E6] transition-all duration-200 hover:bg-[#86C15A] hover:text-[#050608] active:scale-[0.97]"
                >
                  Browse Inventory
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/community"
                  className="flex items-center gap-2.5 border border-[rgba(5,6,8,0.18)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#050608] transition-all duration-200 hover:border-[#050608] hover:bg-[#050608] hover:text-[#F6F1E6] active:scale-[0.97]"
                >
                  Join Discord
                </Link>
              </div>

              <div className="mt-10">
                <BarcodeDivider />
              </div>
            </div>

            {/* Right — 2 featured product cards (overlapping, hover-forward, no jitter) */}
            {/* Container = card(220×290) + spread(80px) = 300×370 */}
            <div className="hidden md:flex self-stretch items-center justify-center">
              <div className="relative w-[300px] h-[370px]">

                {/* ── BACK CARD (items[1]) ──
                    The outer <a> is the static hover zone that never moves —
                    only the inner visual div translates, so the cursor stays
                    inside the trigger element throughout and there's no jitter. */}
                {items[1] && (
                  <a
                    href={`/item/${items[1].id}`}
                    className="group/back absolute right-0 bottom-0 z-[5] block w-[220px] h-[290px] rounded-2xl"
                    aria-label={`${items[1].brand} – ${items[1].name}`}
                  >
                    {/* Visual card — translates on hover of the static outer <a> */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-md ring-1 ring-[rgba(5,6,8,0.08)] transition-all duration-700 ease-out group-hover/back:-translate-x-[56px] group-hover/back:-translate-y-[56px] group-hover/back:shadow-2xl">
                      {items[1].images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={items[1].images[0]}
                          alt=""
                          draggable={false}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover/back:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#EDE8DC]">
                          <p className="text-[8px] uppercase tracking-[0.4em] text-[#C4C4C4]">No Image</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,6,8,0.85)] via-[rgba(5,6,8,0.25)] to-transparent opacity-0 transition-opacity duration-500 group-hover/back:opacity-100">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#86C15A]">{items[1].brand}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-bold leading-tight text-[#F6F1E6]">{items[1].name}</p>
                          {items[1].listPrice && (
                            <p className="mt-1.5 text-sm font-black text-[#F6F1E6]">${items[1].listPrice.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                )}

                {/* ── FRONT CARD (items[0]) — standard hover, no movement needed ── */}
                {items[0] && (
                  <Link
                    href={`/item/${items[0].id}`}
                    className="group absolute left-0 top-0 z-10 block w-[220px] h-[290px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-[rgba(5,6,8,0.08)]"
                  >
                    {items[0].images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={items[0].images[0]}
                        alt={items[0].name}
                        draggable={false}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#EDE8DC]">
                        <p className="text-[8px] uppercase tracking-[0.4em] text-[#C4C4C4]">No Image</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,6,8,0.85)] via-[rgba(5,6,8,0.25)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#86C15A]">{items[0].brand}</p>
                        <p className="mt-1 line-clamp-2 text-xs font-bold leading-tight text-[#F6F1E6]">{items[0].name}</p>
                        {items[0].listPrice && (
                          <p className="mt-1.5 text-sm font-black text-[#F6F1E6]">${items[0].listPrice.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          2. FEATURED INVENTORY
      ════════════════════════════════════════ */}
      <section id="inventory" className="border-b border-[rgba(5,6,8,0.08)]">
        <div className="mx-auto max-w-7xl px-6 py-16">

          {/* Section header */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#7A7A7A]">
                Featured Cooks
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#050608] md:text-4xl">
                Active Inventory
                <span className="ml-3 text-base font-normal text-[#C4C4C4]">({items.length})</span>
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              {/* Search */}
              <form method="GET" action="/" className="flex items-center gap-0 border-b border-[rgba(5,6,8,0.18)] pb-1">
                {params.brand    && <input type="hidden" name="brand"    value={params.brand}    />}
                {params.category && <input type="hidden" name="category" value={params.category} />}
                {params.size     && <input type="hidden" name="size"     value={params.size}     />}
                {sort !== "newest" && <input type="hidden" name="sort"   value={sort}            />}
                <input
                  type="text"
                  name="search"
                  defaultValue={params.search ?? ""}
                  placeholder="Search brand, style, colorway…"
                  className="w-52 bg-transparent text-xs text-[#050608] outline-none placeholder:text-[#C4C4C4]"
                />
                <button type="submit" className="text-xs font-bold text-[#050608] hover:text-[#86C15A] transition-colors">
                  →
                </button>
              </form>

              {/* Filters */}
              <Suspense fallback={<div className="h-7 w-64 animate-pulse bg-[#EDE8DC]" />}>
                <CatalogFilters total={items.length} sort={sort} />
              </Suspense>
            </div>
          </div>

          {/* Inventory grid */}
          {items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-[#7A7A7A]">No inventory matching that filter.</p>
              {hasFilters && (
                <Link href="/" className="mt-3 inline-block text-[10px] uppercase tracking-[0.2em] text-[#86C15A] hover:opacity-70">
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-px bg-[rgba(5,6,8,0.08)] sm:grid-cols-3 md:grid-cols-4">
              {items.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="stagger-item group flex flex-col bg-[#F6F1E6] transition-colors duration-200 hover:bg-[#EDE8DC]"
                  style={{ ["--delay" as string]: `${i * 25}ms` }}
                >
                  {/* Label header */}
                  <div className="flex items-center justify-between border-b border-[rgba(5,6,8,0.07)] px-3 py-1.5">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#7A7A7A]">
                      {item.category}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE8DC]">
                    {item.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-[8px] uppercase tracking-[0.4em] text-[#C4C4C4]">No Image</p>
                      </div>
                    )}
                    <StockXBadge
                      brand={item.brand}
                      name={item.name}
                      size={item.size}
                      category={item.category}
                    />
                  </div>

                  {/* Inventory label metadata */}
                  <div className="flex flex-col gap-1 px-3 py-3">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#7A7A7A] md:text-[9px]">
                      {item.brand}
                    </p>
                    <p className="line-clamp-2 text-[10px] font-semibold leading-snug text-[#050608] md:text-xs">
                      {item.name}
                    </p>
                    <div className="mt-1 flex items-center justify-between border-t border-[rgba(5,6,8,0.06)] pt-1.5">
                      <span className="font-mono text-[8px] text-[#7A7A7A] md:text-[9px]">
                        {item.size}{item.condition ? ` · ${item.condition}` : ""}
                      </span>
                      {item.listPrice && (
                        <span className="text-[10px] font-bold text-[#050608] md:text-xs">
                          ${item.listPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. HOW IT WORKS
      ════════════════════════════════════════ */}
      <section id="how-it-works" className="border-b border-[rgba(5,6,8,0.08)]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-14 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#7A7A7A]">Process</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#050608] md:text-4xl">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-0 divide-y divide-[rgba(5,6,8,0.08)] md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              {
                step: "01",
                title: "Apply",
                desc: "Request access through our network. We review every applicant — this isn't a public marketplace.",
              },
              {
                step: "02",
                title: "Access",
                desc: "Once verified, you're in. Full inventory visibility, seller relationships, and bulk pricing unlocked.",
              },
              {
                step: "03",
                title: "Source",
                desc: "Browse curated drops, connect directly with verified sellers, and move inventory at scale.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col px-10 py-12 md:px-12">
                <p className="font-mono text-[10px] font-semibold tracking-[0.3em] text-[#86C15A]">{step}</p>
                <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-[#050608] md:text-3xl">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#7A7A7A]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          5. COMMUNITY
      ════════════════════════════════════════ */}
      <section id="community" className="bg-[#050608]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#86C15A]">
                Private Network
              </p>
              <h2 className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-tight text-[#F6F1E6] md:text-5xl">
                More than<br />a marketplace
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#7A7A7A]">
                Hidden Supply is a Discord-based community of serious resellers.
                Real-time cooks, bulk listings, seller vetting, and deal flow —
                all in one private channel built for operators who move volume.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#"
                  className="flex items-center gap-2.5 bg-[#86C15A] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#050608] transition-all duration-200 hover:opacity-85 active:scale-[0.97]"
                >
                  Join Discord
                </Link>
                <Link
                  href="/#inventory"
                  className="flex items-center gap-2.5 border border-[rgba(246,241,230,0.15)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#F6F1E6] transition-all duration-200 hover:border-[#F6F1E6] active:scale-[0.97]"
                >
                  Browse Inventory
                </Link>
              </div>
            </div>

            {/* Community stats */}
            <div className="grid grid-cols-2 gap-px bg-[rgba(246,241,230,0.07)]">
              {[
                { stat: "Private",  label: "Access only"           },
                { stat: "Verified", label: "Every seller"          },
                { stat: "Bulk",     label: "Move volume"           },
                { stat: "Network",  label: "Trusted connections"   },
              ].map(({ stat, label }) => (
                <div key={stat} className="flex flex-col justify-between bg-[#050608] p-6">
                  <p className="text-2xl font-black uppercase tracking-tight text-[#F6F1E6] md:text-3xl">{stat}</p>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-[#7A7A7A]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          6. FOOTER
      ════════════════════════════════════════ */}
      <footer className="bg-[#050608]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

            {/* Brand */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#F6F1E6]">
                Hidden Supply
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#7A7A7A]">
                Private Reseller Network
              </p>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { label: "Inventory",    href: "/#inventory"    },
                { label: "Community",    href: "/community"     },
                { label: "How It Works", href: "/#how-it-works" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#7A7A7A] transition-colors hover:text-[#F6F1E6]"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Legal */}
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#3A3A3A]">
              © {new Date().getFullYear()} Hidden Supply. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
