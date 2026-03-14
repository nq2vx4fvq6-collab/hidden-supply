"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Platform } from "@/lib/marketplaceModels";

interface Props {
  accountId: string;
  platform: Platform;
}

export default function SyncAccountButton({ accountId, platform }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSync = () => {
    startTransition(async () => {
      const res = await fetch("/api/marketplace/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (res.ok) router.refresh();
    });
  };

  const supportsSync = platform === "ebay";

  if (!supportsSync) {
    return (
      <span className="rounded-full border border-zinc-700 px-4 py-2 text-[11px] uppercase tracking-wider text-zinc-500">
        Sync coming soon
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={pending}
      className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Syncing…" : "Sync now"}
    </button>
  );
}
