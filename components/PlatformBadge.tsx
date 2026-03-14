import type { Platform } from "@/lib/marketplaceModels";

const LABELS: Record<Platform, string> = {
  ebay: "eBay",
  poshmark: "Poshmark",
  stockx: "StockX",
  grailed: "Grailed",
  depop: "Depop",
};

interface Props {
  platform: Platform;
  className?: string;
}

export default function PlatformBadge({ platform, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-300 ${className}`}
    >
      {LABELS[platform]}
    </span>
  );
}
