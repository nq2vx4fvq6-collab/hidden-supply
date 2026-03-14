"use client";

import { useTransition } from "react";
import { refreshSheetsCacheAction } from "@/app/actions/sync";
import { useRouter } from "next/navigation";

export default function RefreshSheetsButton({
  className,
}: {
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await refreshSheetsCacheAction();
          router.refresh();
        });
      }}
      disabled={pending}
      className={className}
    >
      {pending ? "Refreshing…" : "Refresh now"}
    </button>
  );
}
