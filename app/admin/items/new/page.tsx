import Link from "next/link";
import ItemFormFields from "@/components/ItemFormFields";
import { createItemAction } from "@/app/actions/items";

export default function NewItemPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Item</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add a new piece to your inventory
          </p>
        </div>
        <Link
          href="/admin/items"
          className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          ← Back to Inventory
        </Link>
      </div>

      <form
        action={createItemAction}
        className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6"
      >
        <ItemFormFields />

        <div className="flex items-center gap-4 border-t border-zinc-800 pt-5">
          <button
            type="submit"
            className="rounded-full bg-zinc-100 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white"
          >
            Add to Inventory
          </button>
          <Link
            href="/admin/items"
            className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
