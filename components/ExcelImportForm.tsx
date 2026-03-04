"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface ImportResult {
  created: number;
  updated: number;
  total: number;
}

export default function ExcelImportForm() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data as ImportResult);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          Excel File (.xlsx)
        </label>
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          required
          className="block w-full text-sm text-zinc-400 file:mr-4 file:cursor-pointer file:rounded-full file:border file:border-zinc-700 file:bg-zinc-900 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-zinc-300 file:transition-colors hover:file:border-zinc-600 hover:file:text-zinc-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          Import Mode
        </label>
        <select
          name="mode"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
        >
          <option value="merge">
            Merge — update existing SKUs, add new rows
          </option>
          <option value="replace">Replace — overwrite entire inventory</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-zinc-100 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white disabled:opacity-50"
      >
        {loading ? "Importing…" : "Import Inventory"}
      </button>

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-4 py-3">
          <p className="text-sm font-medium text-emerald-400">
            Import complete
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {result.created} items added · {result.updated} items updated ·{" "}
            {result.total} rows processed
          </p>
        </div>
      )}
    </form>
  );
}
