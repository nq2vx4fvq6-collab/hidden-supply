import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold tracking-[0.2em] text-zinc-100">
            US
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-300">
              Urban Supply
            </p>
            <p className="text-[11px] text-zinc-600">
              Supreme · BAPE · Gallery Dept & more
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-[11px] uppercase tracking-[0.3em] text-zinc-500">
          <Link href="/" className="transition-colors hover:text-zinc-200">
            Catalog
          </Link>
          <Link
            href="/login"
            title="Admin"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-800 text-zinc-700 transition-colors hover:border-zinc-600 hover:text-zinc-400"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}
