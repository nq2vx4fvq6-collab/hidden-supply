"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteItemAction } from "@/app/actions/items";

export default function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteItemAction(id);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-red-800 transition-colors hover:text-red-500 disabled:opacity-40"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
