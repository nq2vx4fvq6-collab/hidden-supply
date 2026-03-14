"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  accountId: string;
  displayName: string;
}

export default function DeleteAccountButton({ accountId, displayName }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/marketplace/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/accounts/accounts");
        router.refresh();
      }
    });
  };

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
        Danger zone
      </p>
      {!confirm ? (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="mt-2 rounded-full border border-red-900/60 bg-red-950/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-950/50"
        >
          Remove account
        </button>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">
            Remove &quot;{displayName}&quot;? Sales data for this account will remain.
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-full border border-red-900/60 bg-red-950/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-950/70 disabled:opacity-50"
          >
            {pending ? "Removing…" : "Yes, remove"}
          </button>
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
