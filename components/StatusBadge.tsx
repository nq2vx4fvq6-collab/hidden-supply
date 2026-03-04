import type { InventoryStatus } from "@/lib/models";

const config: Record<InventoryStatus, { label: string; classes: string }> = {
  available: {
    label: "Available",
    classes: "border-emerald-800/60 text-emerald-400 bg-emerald-950/30",
  },
  reserved: {
    label: "Reserved",
    classes: "border-amber-800/60 text-amber-400 bg-amber-950/30",
  },
  sold: {
    label: "Sold",
    classes: "border-zinc-700 text-zinc-500 bg-zinc-900/30",
  },
  archived: {
    label: "Archived",
    classes: "border-zinc-800 text-zinc-600 bg-zinc-900/20",
  },
  consigned: {
    label: "Consigned",
    classes: "border-blue-800/60 text-blue-400 bg-blue-950/30",
  },
  in_transit: {
    label: "In Transit",
    classes: "border-purple-800/60 text-purple-400 bg-purple-950/30",
  },
};

export default function StatusBadge({ status }: { status: InventoryStatus }) {
  const { label, classes } = config[status] ?? config.available;
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${classes}`}
    >
      {label}
    </span>
  );
}
