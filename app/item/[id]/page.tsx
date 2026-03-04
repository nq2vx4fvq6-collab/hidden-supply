import { notFound } from "next/navigation";
import Link from "next/link";
import { getItemById } from "@/lib/inventoryService";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) notFound();

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/"
          className="mb-8 inline-block text-[11px] uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          ← Back to Catalog
        </Link>

        <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr]">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950">
              {item.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-zinc-700">
                  Urban Supply
                </div>
              )}
            </div>

            {item.images && item.images.length > 1 && (
              <div className="flex gap-2">
                {item.images.slice(1).map((src, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-16 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${item.name} photo ${i + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {item.brand}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {item.name}
              </h1>
              <p className="text-sm text-zinc-400">
                {item.category} · Size {item.size}
                {item.colorway && ` · ${item.colorway}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {item.listPrice && (
                <p className="text-2xl font-semibold text-zinc-50">
                  ${item.listPrice.toLocaleString()}
                </p>
              )}
              <StatusBadge status={item.status} />
            </div>

            {item.condition && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                  Condition
                </p>
                <p className="mt-1 text-sm text-zinc-200">{item.condition}</p>
              </div>
            )}

            {item.notes && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                  Notes
                </p>
                <p className="mt-1 text-sm text-zinc-300">{item.notes}</p>
              </div>
            )}

            <div className="space-y-3 rounded-2xl border border-zinc-900 bg-zinc-950/60 p-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                Inquire
              </p>
              <p className="text-sm leading-relaxed text-zinc-300">
                Interested in this piece? Reach out with SKU{" "}
                <span className="font-mono text-xs text-zinc-100">
                  {item.sku}
                </span>{" "}
                via Instagram, WhatsApp, or email and we&apos;ll confirm
                availability and pricing.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
