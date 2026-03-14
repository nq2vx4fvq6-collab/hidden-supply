import Header from "@/components/Header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F6F1E6] text-[#050608]">
      <Header />

      {/* Hero skeleton */}
      <section className="border-b border-[rgba(5,6,8,0.08)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid min-h-[520px] grid-cols-1 items-center gap-0 md:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-5 py-16 pr-0 md:pr-20">
              <div className="h-2.5 w-32 animate-pulse rounded-sm bg-[#EDE8DC]" />
              <div className="space-y-3">
                <div className="h-14 w-72 animate-pulse rounded-sm bg-[#EDE8DC]" />
                <div className="h-14 w-56 animate-pulse rounded-sm bg-[#EDE8DC]" />
                <div className="h-14 w-64 animate-pulse rounded-sm bg-[#EDE8DC]" />
              </div>
              <div className="h-4 w-80 animate-pulse rounded-sm bg-[#EDE8DC]" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-36 animate-pulse bg-[#EDE8DC]" />
                <div className="h-10 w-28 animate-pulse bg-[#EDE8DC]" />
              </div>
            </div>
            <div className="hidden h-[420px] w-full animate-pulse bg-[#EDE8DC] md:block" />
          </div>
        </div>
      </section>

      {/* Trust strip skeleton */}
      <section className="bg-[#050608]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-px md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 px-6 py-8 md:px-10">
                <div className="h-2 w-24 animate-pulse rounded-sm bg-[#1a1a1a]" />
                <div className="h-3 w-40 animate-pulse rounded-sm bg-[#1a1a1a]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inventory grid skeleton */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-2 w-24 animate-pulse rounded-sm bg-[#EDE8DC]" />
            <div className="h-8 w-48 animate-pulse rounded-sm bg-[#EDE8DC]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-[rgba(5,6,8,0.08)] sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col bg-[#F6F1E6]" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="h-7 animate-pulse bg-[#EDE8DC]" />
              <div className="aspect-[4/5] animate-pulse bg-[#EDE8DC]" />
              <div className="flex flex-col gap-1.5 px-3 py-3">
                <div className="h-2 w-12 animate-pulse rounded-sm bg-[#EDE8DC]" />
                <div className="h-3 w-3/4 animate-pulse rounded-sm bg-[#EDE8DC]" />
                <div className="h-2.5 w-16 animate-pulse rounded-sm bg-[#EDE8DC]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
