import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllItems } from "@/lib/inventoryService";
import type { ItemFilters, InventoryStatus } from "@/lib/models";
import Header from "@/components/Header";
import CatalogFilters from "@/components/CatalogFilters";
import StatusBadge from "@/components/StatusBadge";
import StockXBadge from "@/components/StockXBadge";

const PUBLIC_STATUSES: InventoryStatus[] = ["available", "reserved"];

interface BrandPageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { brand: brandSlug } = await params;
  const brand = decodeURIComponent(brandSlug.replace(/\+/g, " "));
  const paramsRes = await searchParams;
  const sort = paramsRes.sort || "newest";

  const filters: ItemFilters = {
    brand,
    search: paramsRes.search || undefined,
    category: paramsRes.category || undefined,
    size: paramsRes.size || undefined,
  };

  const allItems = await getAllItems(filters);
  const visible = allItems.filter((i) => PUBLIC_STATUSES.includes(i.status));

  const items = [...visible].sort((a, b) => {
    if (sort === "price_asc") return (a.listPrice ?? 0) - (b.listPrice ?? 0);
    if (sort === "price_desc") return (b.listPrice ?? 0) - (a.listPrice ?? 0);
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  if (items.length === 0 && allItems.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <Header />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-accent"
            >
              ← Catalog
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {brand}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              {items.length} {items.length === 1 ? "piece" : "pieces"} from{" "}
              {brand}
            </p>
          </div>
          <form
            method="GET"
            action={`/brand/${encodeURIComponent(brand)}`}
            className="flex w-full max-w-sm items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2"
          >
            {paramsRes.category && (
              <input type="hidden" name="category" value={paramsRes.category} />
            )}
            {paramsRes.size && (
              <input type="hidden" name="size" value={paramsRes.size} />
            )}
            {sort && sort !== "newest" && (
              <input type="hidden" name="sort" value={sort} />
            )}
            <input
              type="text"
              name="search"
              defaultValue={paramsRes.search ?? ""}
              placeholder="Search within brand…"
              className="flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90"
            >
              Search
            </button>
          </form>
        </section>

        <Suspense
          fallback={
            <div className="h-8 animate-pulse rounded-full bg-zinc-900" />
          }
        >
          <CatalogFilters total={items.length} sort={sort} />
        </Suspense>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-zinc-600">
              No pieces in this brand match your filters.
            </p>
            <Link
              href={`/brand/${encodeURIComponent(brand)}`}
              className="mt-3 inline-block text-xs text-zinc-500 underline hover:text-accent"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 transition-all duration-200 hover:border-accent/40 hover:shadow-xl hover:shadow-black/50"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                  {item.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.35em] text-zinc-700">
                      Urban Supply
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <StatusBadge status={item.status} />
                  </div>
                  <StockXBadge
                    brand={item.brand}
                    name={item.name}
                    size={item.size}
                    category={item.category}
                  />
                </div>
                <div className="px-3 pb-4 pt-3">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                    {item.brand}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-zinc-100">
                    {item.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      {item.category} · {item.size}
                    </span>
                    {item.listPrice && (
                      <span className="text-sm font-semibold text-zinc-100">
                        ${item.listPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
