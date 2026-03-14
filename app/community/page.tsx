import Link from "next/link";
import Header from "@/components/Header";

/** Barcode-inspired decorative SVG — reused from homepage language */
function BarcodeAccent() {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto opacity-60"
      aria-hidden="true"
    >
      <rect x="0"  y="0"  width="2"  height="200" fill="#C4C4C4" />
      <rect x="5"  y="20" width="3"  height="180" fill="#C4C4C4" />
      <rect x="11" y="0"  width="8"  height="200" fill="#050608" />
      <rect x="22" y="30" width="2"  height="170" fill="#C4C4C4" />
      <rect x="27" y="0"  width="14" height="200" fill="#050608" />
      <rect x="44" y="10" width="2"  height="190" fill="#C4C4C4" />
      {/* Access Green bar */}
      <rect x="49" y="0"  width="4"  height="200" fill="#86C15A" />
      <rect x="56" y="20" width="2"  height="180" fill="#C4C4C4" />
      <rect x="61" y="0"  width="10" height="200" fill="#050608" />
      <rect x="74" y="40" width="3"  height="160" fill="#7A7A7A" />
      <rect x="80" y="0"  width="2"  height="200" fill="#C4C4C4" />
      <rect x="85" y="0"  width="16" height="200" fill="#050608" />
      <rect x="104" y="30" width="2" height="170" fill="#C4C4C4" />
      <rect x="109" y="0"  width="6" height="200" fill="#7A7A7A" />
      <rect x="118" y="10" width="2" height="190" fill="#C4C4C4" />
    </svg>
  );
}

const BENEFITS = [
  {
    code: "01",
    title: "Exclusive Cook Alerts",
    desc: "Real-time notifications on limited drops before they hit public channels. Our network sources directly from verified suppliers.",
  },
  {
    code: "02",
    title: "Bulk Deal Flow",
    desc: "Access to high-volume inventory at structured pricing. Whether you move 5 units or 500 — the network scales with you.",
  },
  {
    code: "03",
    title: "Verified Sourcing",
    desc: "Every piece listed through Hidden Supply passes authentication review. No fakes, no guesswork — just trusted inventory.",
  },
  {
    code: "04",
    title: "Private Channels",
    desc: "Member-only Discord channels segmented by category: footwear, apparel, accessories, and operator-level bulk rooms.",
  },
  {
    code: "05",
    title: "Direct Connections",
    desc: "Bypass the middleman. Connect directly with verified sellers and build lasting sourcing relationships inside the network.",
  },
  {
    code: "06",
    title: "Market Intelligence",
    desc: "Price tracking, StockX comps, and resale data shared in real-time — so you buy at the right number every time.",
  },
];

const ACCESS_STEPS = [
  {
    step: "01",
    action: "Request Access",
    detail: "Fill out a short application. We review every request — this is a curated network, not an open marketplace.",
  },
  {
    step: "02",
    action: "Get Vetted",
    detail: "Our team reviews your profile and resell experience. We're selective because the network's value depends on who's in it.",
  },
  {
    step: "03",
    action: "Join the Network",
    detail: "Once approved, you receive a private Discord invite. Full access to cook alerts, bulk listings, and the operator community.",
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#F6F1E6] text-[#050608]">
      <Header />

      <main className="page-enter">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-[rgba(5,6,8,0.08)]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid min-h-[480px] grid-cols-1 items-center gap-0 md:grid-cols-[1fr_200px]">

              <div className="flex flex-col justify-center py-16 pr-0 md:pr-20">
                <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-[#7A7A7A]">
                  Exclusive Access
                </p>
                <h1 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-[#050608] sm:text-6xl md:text-7xl">
                  The<br />Hidden<br />Supply<br />Network
                </h1>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-[#7A7A7A]">
                  A private Discord community for serious resellers. Cook alerts, bulk deal flow,
                  and a trusted network of operators — all behind a vetted-access wall.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="https://discord.gg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 bg-[#050608] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#F6F1E6] transition-all duration-200 hover:bg-[#86C15A] hover:text-[#050608] active:scale-[0.97]"
                  >
                    Request Access
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <Link
                    href="/#inventory"
                    className="flex items-center gap-2.5 border border-[rgba(5,6,8,0.18)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#050608] transition-all duration-200 hover:border-[#050608] hover:bg-[#050608] hover:text-[#F6F1E6] active:scale-[0.97]"
                  >
                    Browse Inventory
                  </Link>
                </div>
              </div>

              {/* Right — barcode accent */}
              <div className="hidden h-64 items-center justify-end md:flex">
                <BarcodeAccent />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TRUST STRIP
        ══════════════════════════════════════ */}
        <section className="bg-[#050608]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 divide-x divide-[rgba(246,241,230,0.07)] md:grid-cols-4">
              {[
                { label: "Vetted Members",   desc: "Every applicant reviewed before access is granted"      },
                { label: "Cook Alerts",      desc: "First-access notifications on limited, exclusive drops"  },
                { label: "Bulk Listings",    desc: "High-volume deals unavailable on public platforms"       },
                { label: "Private Network",  desc: "Discord-based, structured, and operator-focused"         },
              ].map(({ label, desc }) => (
                <div key={label} className="flex flex-col gap-2 px-6 py-8 md:px-10">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#86C15A]" />
                    <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#86C15A]">
                      {label}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-[#C4C4C4]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            MEMBER BENEFITS
        ══════════════════════════════════════ */}
        <section className="border-b border-[rgba(5,6,8,0.08)]">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-14">
              <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#7A7A7A]">
                What You Get
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#050608] md:text-4xl">
                Member Benefits
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px bg-[rgba(5,6,8,0.08)] sm:grid-cols-2 md:grid-cols-3">
              {BENEFITS.map(({ code, title, desc }) => (
                <div key={code} className="flex flex-col gap-3 bg-[#F6F1E6] px-8 py-10">
                  <p className="font-mono text-[10px] font-semibold tracking-[0.3em] text-[#86C15A]">
                    {code}
                  </p>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#050608]">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#7A7A7A]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            HOW TO GET IN
        ══════════════════════════════════════ */}
        <section className="border-b border-[rgba(5,6,8,0.08)] bg-[#050608]">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-14 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#86C15A]">
                Gated Access
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#F6F1E6] md:text-4xl">
                How to Get In
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#7A7A7A]">
                Hidden Supply is not an open platform. Access is granted through a
                manual review process — we keep the network small and trusted on purpose.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-0 divide-y divide-[rgba(246,241,230,0.07)] md:grid-cols-3 md:divide-x md:divide-y-0">
              {ACCESS_STEPS.map(({ step, action, detail }) => (
                <div key={step} className="flex flex-col px-10 py-12 md:px-12">
                  <p className="font-mono text-[10px] font-semibold tracking-[0.3em] text-[#86C15A]">
                    {step}
                  </p>
                  <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-[#F6F1E6] md:text-3xl">
                    {action}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#7A7A7A]">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 flex justify-center">
              <a
                href="https://discord.gg/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-[#86C15A] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#050608] transition-all duration-200 hover:opacity-85 active:scale-[0.97]"
              >
                Request Access on Discord
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            WHAT THE NETWORK LOOKS LIKE
        ══════════════════════════════════════ */}
        <section className="border-b border-[rgba(5,6,8,0.08)]">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-center">

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#7A7A7A]">
                  Inside the Network
                </p>
                <h2 className="mt-5 text-3xl font-black uppercase leading-[0.95] tracking-tight text-[#050608] md:text-4xl">
                  Built for<br />operators
                </h2>
                <p className="mt-6 text-sm leading-relaxed text-[#7A7A7A]">
                  Hidden Supply isn't a general resell group. It's a structured Discord server
                  built around how serious operators actually work — channel-by-channel,
                  category by category, with deal flow that moves fast and sourcing
                  relationships that compound over time.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[#7A7A7A]">
                  Whether you're moving singular pieces or clearing bulk stock,
                  the network has a channel for it. And because every member is vetted,
                  trust is already built in.
                </p>
              </div>

              {/* Channel breakdown */}
              <div className="flex flex-col gap-px">
                {[
                  { channel: "#cook-alerts",      desc: "First-access drop notifications"         },
                  { channel: "#bulk-listings",    desc: "High-volume inventory boards"             },
                  { channel: "#footwear",         desc: "Sneaker-specific sourcing and comps"      },
                  { channel: "#apparel",          desc: "Streetwear, vintage, and archive pieces"  },
                  { channel: "#market-intel",     desc: "Price tracking and StockX data"           },
                  { channel: "#verified-sellers", desc: "Direct connections to vetted sources"     },
                ].map(({ channel, desc }) => (
                  <div
                    key={channel}
                    className="flex items-center justify-between border border-[rgba(5,6,8,0.08)] bg-[#F6F1E6] px-5 py-4 transition-colors duration-150 hover:bg-[#EDE8DC]"
                  >
                    <p className="font-mono text-[10px] font-semibold text-[#050608]">{channel}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#7A7A7A]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════ */}
        <section className="bg-[#050608]">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-[#86C15A]">
              Private Reseller Network
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-black uppercase leading-[0.9] tracking-tight text-[#F6F1E6] md:text-5xl lg:text-6xl">
              You either know,<br />or you don't
            </h2>
            <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-[#7A7A7A]">
              Hidden Supply is invite-screened. Apply through Discord and our team will
              review your request within 24–48 hours.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://discord.gg/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-[#86C15A] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#050608] transition-all duration-200 hover:opacity-85 active:scale-[0.97]"
              >
                Request Access
              </a>
              <Link
                href="/#inventory"
                className="flex items-center gap-2.5 border border-[rgba(246,241,230,0.15)] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#F6F1E6] transition-all duration-200 hover:border-[#F6F1E6] active:scale-[0.97]"
              >
                Browse Inventory
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#050608] border-t border-[rgba(246,241,230,0.07)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#F6F1E6]">
                Hidden Supply
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#7A7A7A]">
                Private Reseller Network
              </p>
            </div>
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
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#3A3A3A]">
              © {new Date().getFullYear()} Hidden Supply. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
