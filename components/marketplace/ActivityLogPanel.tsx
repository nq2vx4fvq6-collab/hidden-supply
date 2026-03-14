"use client";

import { useState } from "react";
import type { ActivityLog, LogAction, LogStatus } from "@/lib/marketplaceModels";

const ACTION_LABELS: Record<LogAction, string> = {
  account_created:      "Account created",
  account_updated:      "Account updated",
  credentials_updated:  "Credentials updated",
  sync_started:         "Sync started",
  sync_completed:       "Sync completed",
  sync_failed:          "Sync failed",
  sale_synced:          "Sale synced",
  sale_matched:         "Sale matched",
  manual_note:          "Note",
};

const STATUS_DOT: Record<LogStatus, string> = {
  success: "bg-emerald-400",
  info:    "bg-blue-400",
  warning: "bg-amber-400",
  error:   "bg-red-400",
};

const STATUS_TEXT: Record<LogStatus, string> = {
  success: "text-emerald-400",
  info:    "text-blue-400",
  warning: "text-amber-400",
  error:   "text-red-400",
};

interface Props {
  accountId: string;
  initialLogs: ActivityLog[];
}

export default function ActivityLogPanel({ accountId, initialLogs }: Props) {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [noteText, setNoteText] = useState("");
  const [adding, setAdding] = useState(false);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/marketplace/accounts/${accountId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detail: noteText.trim(), status: "info" }),
      });
      if (res.ok) {
        const log = await res.json();
        setLogs((prev) => [log, ...prev]);
        setNoteText("");
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Add a note */}
      <form onSubmit={addNote} className="flex gap-2">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note…"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors"
        />
        <button
          type="submit"
          disabled={adding || !noteText.trim()}
          className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 disabled:opacity-40 transition-colors"
        >
          {adding ? "…" : "Add"}
        </button>
      </form>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-8 text-center text-sm text-zinc-600">
          No activity yet. Events will appear here as you use this account.
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-4 bottom-4 w-px bg-zinc-800" />
          {logs.map((log, i) => (
            <div key={log.id} className={`relative flex gap-4 pb-5 ${i === logs.length - 1 ? "pb-0" : ""}`}>
              {/* Dot */}
              <div className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-zinc-950 ${STATUS_DOT[log.status]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className={`text-xs font-medium ${STATUS_TEXT[log.status]}`}>
                    {ACTION_LABELS[log.action]}
                  </span>
                  <span className="text-[10px] text-zinc-600 shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                {log.detail && (
                  <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">{log.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
