"use client";

import { useState, useRef, useCallback } from "react";
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
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const submitFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      try {
        const res = await fetch("/api/import", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Import failed");
        setResult(data as ImportResult);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed");
      } finally {
        setLoading(false);
      }
    },
    [mode, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        submitFile(file);
      } else {
        setError("Please drop an .xlsx or .xls file.");
      }
    },
    [submitFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) submitFile(file);
    },
    [submitFile]
  );

  return (
    <form ref={formRef} className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["merge", "replace"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors ${
              mode === m
                ? "border-zinc-400 bg-zinc-800 text-zinc-100"
                : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
            }`}
          >
            {m === "merge" ? "Merge" : "Replace All"}
          </button>
        ))}
        <span className="ml-1 self-center text-[10px] text-zinc-600">
          {mode === "merge"
            ? "Updates existing SKUs, adds new rows"
            : "Overwrites your entire inventory"}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-12 transition-colors ${
          dragOver
            ? "border-zinc-500 bg-zinc-800/40"
            : "border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="sr-only"
        />

        {loading ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
            <p className="text-xs text-zinc-400">Importing {fileName}…</p>
          </>
        ) : result ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/40 text-emerald-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-400">Import complete</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {result.created} added · {result.updated} updated · {result.total} rows
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setResult(null); setFileName(null); }}
              className="mt-1 text-[11px] text-zinc-600 underline transition-colors hover:text-zinc-400"
            >
              Import another file
            </button>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-300">
                Drop your Excel file here
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">
                or click to browse · .xlsx / .xls
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </form>
  );
}
