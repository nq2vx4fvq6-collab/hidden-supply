import { Suspense } from "react";
import Link from "next/link";
import { getAllItems } from "@/lib/inventoryService";
import type { ItemFilters, InventoryStatus } from "@/lib/models";
import Header from "@/components/Header";
import CatalogFilters from "@/components/CatalogFilters";
import StatusBadge from "@/components/StatusBadge";

interface HomeProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

const PUBLIC_STATUSES: InventoryStatus[] = ["available", "reserved"];

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  const sort = params.sort || "newest";

  const filters: ItemFilters = {
    search: params.search || undefined,
    brand: params.brand || undefined,
    category: params.category || undefined,
    size: params.size || undefined,
  };

  const allItems = await getAllItems(filters);
  const visible = allItems.filter((i) => PUBLIC_STATUSES.includes(i.status));

  const items = [...visible].sort((a, b) => {
    if (sort === "price_asc") return (a.listPrice ?? 0) - (b.listPrice ?? 0);
    if (sort === "price_desc") return (b.listPrice ?? 0) - (a.listPrice ?? 0);
    // newest: sort by createdAt descending
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <Header />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Hero + Search */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Current Catalog
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Live inventory from Urban Supply. Filter by brand, category, or
              size to find the right pieces.
            </p>
          </div>
          <form
            method="GET"
            action="/"
            className="flex w-full max-w-sm items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2"
          >
            {/* Preserve active filter + sort params across search submits */}
            {params.brand && (
              <input type="hidden" name="brand" value={params.brand} />
            )}
            {params.category && (
              <input type="hidden" name="category" value={params.category} />
            )}
            {params.size && (
              <input type="hidden" name="size" value={params.size} />
            )}
            {sort && sort !== "newest" && (
              <input type="hidden" name="sort" value={sort} />
            )}
            <input
              type="text"
              name="search"
              defaultValue={params.search ?? ""}
              placeholder="Search brand, piece, colorway…"
              className="flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white"
            >
              Search
            </button>
          </form>
        </section>

        {/* Filters */}
        <Suspense
          fallback={
            <div className="h-8 animate-pulse rounded-full bg-zinc-900" />
          }
        >
          <CatalogFilters total={items.length} sort={sort} />
        </Suspense>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-zinc-600">
              No pieces match your search.
            </p>
            <Link
              href="/"
              className="mt-3 inline-block text-xs text-zinc-500 underline transition-colors hover:text-zinc-300"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/60 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl bg-zinc-900">
                  {item.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.35em] text-zinc-700">
                      Urban Supply
                    </div>
                  )}
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                    {item.brand}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="line-clamp-2 text-sm font-medium text-zinc-50">
                  {item.name}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    {item.category} · Size {item.size}
                  </span>
                  {item.listPrice && (
                    <span className="font-semibold text-zinc-100">
                      ${item.listPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
