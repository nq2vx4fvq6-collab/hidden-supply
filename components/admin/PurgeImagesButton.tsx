"use client";

import { useState } from "react";
import { purgeInvalidImagesAction } from "@/app/actions/items";

export default function PurgeImagesButton() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [cleaned, setCleaned] = useState(0);

  const run = async () => {
    if (state === "running") return;
    setState("running");
    try {
      const result = await purgeInvalidImagesAction();
      setCleaned(result.cleaned);
      setState("done");
      // Reset label after 4s
      setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  };

  const label = {
    idle:    "Fix Broken Images",
    running: "Cleaning…",
    done:    cleaned > 0 ? `Fixed ${cleaned} item${cleaned !== 1 ? "s" : ""} ✓` : "All clean ✓",
    error:   "Error — retry",
  }[state];

  return (
    <button
      type="button"
      onClick={run}
      disabled={state === "running"}
      className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
    >
      {label}
    </button>
  );
}
