import type { InventoryStatus } from "@/lib/types/inventory";

const config: Record<InventoryStatus, { label: string; classes: string }> = {
  available: {
    label: "Available",
    classes: "border-[rgba(134,193,90,0.35)] text-[#4a7a28] bg-[rgba(134,193,90,0.12)]",
  },
  reserved: {
    label: "Reserved",
    classes: "border-[rgba(180,130,40,0.35)] text-[#8a6010] bg-[rgba(200,150,40,0.1)]",
  },
  sold: {
    label: "Sold",
    classes: "border-[rgba(5,6,8,0.12)] text-[#C4C4C4] bg-[rgba(5,6,8,0.04)]",
  },
  archived: {
    label: "Archived",
    classes: "border-[rgba(5,6,8,0.08)] text-[#C4C4C4] bg-transparent",
  },
  consigned: {
    label: "Consigned",
    classes: "border-[rgba(80,120,200,0.35)] text-[#3a5faa] bg-[rgba(80,120,200,0.1)]",
  },
  in_transit: {
    label: "In Transit",
    classes: "border-[rgba(120,80,200,0.35)] text-[#6040aa] bg-[rgba(120,80,200,0.08)]",
  },
};

export default function StatusBadge({ status }: { status: InventoryStatus }) {
  const { label, classes } = config[status] ?? config.available;
  return (
    <span
      className={`border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] ${classes}`}
    >
      {label}
    </span>
  );
}
