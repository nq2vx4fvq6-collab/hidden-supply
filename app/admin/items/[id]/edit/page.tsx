import { notFound } from "next/navigation";
import Link from "next/link";
import { getItemById } from "@/lib/inventoryService";
import ItemFormFields from "@/components/ItemFormFields";
import { updateItemAction } from "@/app/actions/items";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditItemPage({ params }: Props) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) notFound();

  const action = updateItemAction.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Item</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {item.brand} — {item.name}
          </p>
        </div>
        <Link
          href="/admin/items"
          className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          ← Back to Inventory
        </Link>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          SKU
        </span>
        <span className="font-mono text-xs text-zinc-400">{item.sku}</span>
        <span className="mx-2 text-zinc-800">·</span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          ID
        </span>
        <span className="font-mono text-xs text-zinc-600">{item.id}</span>
      </div>

      <form
        action={action}
        className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6"
      >
        <ItemFormFields item={item} />

        <div className="flex items-center gap-4 border-t border-zinc-800 pt-5">
          <button
            type="submit"
            className="rounded-full bg-zinc-100 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white"
          >
            Save Changes
          </button>
          <Link
            href="/admin/items"
            className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            Cancel
          </Link>
          <Link
            href={`/item/${item.id}`}
            target="_blank"
            className="ml-auto text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            View on catalog ↗
          </Link>
        </div>
      </form>
    </div>
  );
}
