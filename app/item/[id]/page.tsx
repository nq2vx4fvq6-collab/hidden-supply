import { notFound } from "next/navigation";
import Link from "next/link";
import { getItemById } from "@/lib/services/inventory";
import Header from "@/components/catalog/Header";
import StatusBadge from "@/components/ui/StatusBadge";
import ImageGallery from "@/components/catalog/ImageGallery";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) notFound();

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-[#050608] grain-overlay">
      <Header />

      <main className="page-enter mx-auto max-w-7xl px-6 py-10 md:py-14">

        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-[9px] uppercase tracking-[0.3em]">
          <Link href="/" className="text-[#7A7A7A] transition-colors hover:text-[#050608]">
            Hidden Supply
          </Link>
          <span className="text-[#C4C4C4]">/</span>
          <Link href="/#inventory" className="text-[#7A7A7A] transition-colors hover:text-[#050608]">
            Inventory
          </Link>
          <span className="text-[#C4C4C4]">/</span>
          <span className="text-[#050608]">{item.brand}</span>
        </nav>

        <div className="grid gap-12 md:grid-cols-[1fr_420px] md:gap-20">

          {/* ── Images ── */}
          <div>
            <ImageGallery images={item.images ?? []} alt={item.name} />
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col gap-7">

            {/* Brand + Status row */}
            <div className="flex items-start justify-between gap-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#7A7A7A]">
                {item.brand}
              </p>
              <StatusBadge status={item.status} />
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black uppercase leading-tight tracking-tight text-[#050608] sm:text-3xl">
              {item.name}
            </h1>

            {/* Price */}
            {item.listPrice && (
              <p className="text-2xl font-semibold text-[#050608]">
                ${item.listPrice.toLocaleString()}
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-[rgba(5,6,8,0.08)]" />

            {/* Inventory metadata */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
              {[
                { label: "Category",  value: item.category                           },
                { label: "Size",      value: item.size                               },
                { label: "Condition", value: item.condition   ?? null                },
                { label: "Colorway",  value: item.colorway    ?? null                },
                { label: "SKU",       value: item.sku,  mono: true                  },
              ]
                .filter((r) => r.value)
                .map(({ label, value, mono }) => (
                  <div key={label}>
                    <dt className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#7A7A7A]">
                      {label}
                    </dt>
                    <dd className={`mt-1 text-sm text-[#050608] ${mono ? "font-mono text-xs" : "font-medium"}`}>
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>

            {/* Divider */}
            <div className="h-px bg-[rgba(5,6,8,0.08)]" />

            {/* Access CTA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#86C15A]" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#7A7A7A]">
                  How to Purchase
                </p>
              </div>
              <p className="text-sm leading-relaxed text-[#7A7A7A]">
                DM us on Instagram or WhatsApp with reference{" "}
                <span className="font-mono text-xs font-medium text-[#050608]">{item.sku}</span>
                {" "}— fast replies and same-day shipping available through the Hidden Supply network.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press flex flex-1 items-center justify-center gap-2 bg-[#050608] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#F6F1E6] transition-colors duration-200 hover:bg-[#86C15A] hover:text-[#050608]"
                >
                  Instagram DM
                </a>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press flex flex-1 items-center justify-center gap-2 border border-[rgba(5,6,8,0.18)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#050608] transition-all duration-200 hover:border-[#050608] hover:bg-[#050608] hover:text-[#F6F1E6]"
                >
                  WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-[rgba(5,6,8,0.08)] bg-[#050608] px-6 py-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#3A3A3A]">
            Hidden Supply · Private Reseller Network
          </p>
          <Link
            href="/#inventory"
            className="text-[9px] uppercase tracking-[0.25em] text-[#7A7A7A] transition-colors hover:text-[#F6F1E6]"
          >
            ← Back to Inventory
          </Link>
        </div>
      </footer>
    </div>
  );
}
