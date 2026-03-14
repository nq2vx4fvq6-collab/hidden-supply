"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MarketplaceAccount } from "@/lib/marketplaceModels";

interface Props {
  accounts: MarketplaceAccount[];
}

export default function SalesImportForm({ accounts }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [defaultAccountId, setDefaultAccountId] = useState(accounts[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || file.size === 0) return;
    setPending(true);
    setResult(null);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      const header = lines[0]?.toLowerCase().split(",").map((h) => h.trim()) ?? [];
      const accountIdIdx = header.indexOf("accountid");
      const titleIdx = header.indexOf("title");
      const amountIdx = header.indexOf("amount");
      const soldAtIdx = header.indexOf("soldat");
      const skuIdx = header.indexOf("sku");
      const brandIdx = header.indexOf("brand");
      const sizeIdx = header.indexOf("size");
      const currencyIdx = header.indexOf("currency");

      const accountIdByPlatform = new Map(accounts.map((a) => [a.platform, a.id]));

      let imported = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(",").map((v) => v.trim());
        const get = (idx: number) => (idx >= 0 ? values[idx] : undefined);
        let accountId = get(accountIdIdx) || defaultAccountId;
        const platform = accounts.find((a) => a.id === accountId)?.platform;
        if (!platform) {
          errors.push(`Row ${i + 1}: invalid accountId`);
          continue;
        }
        const title = get(titleIdx) || "Imported sale";
        const amount = parseFloat(get(amountIdx) ?? "0");
        const soldAt = get(soldAtIdx) || new Date().toISOString().slice(0, 10);
        const sku = get(skuIdx);
        const brand = get(brandIdx);
        const size = get(sizeIdx);
        const currency = get(currencyIdx) || "USD";

        try {
          const res = await fetch("/api/marketplace/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accountId,
              platform,
              title,
              amount: Number.isFinite(amount) ? amount : 0,
              currency,
              soldAt,
              sku: sku || undefined,
              brand: brand || undefined,
              size: size || undefined,
            }),
          });
          if (res.ok) {
            imported++;
          } else {
            const data = await res.json().catch(() => ({}));
            errors.push(`Row ${i + 1}: ${data.error || res.statusText}`);
          }
        } catch (err) {
          errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Failed"}`);
        }
      }

      setResult({ imported, errors });
      if (imported > 0) router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="defaultAccountId" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Default account (if CSV has no accountId)
          </label>
          <select
            id="defaultAccountId"
            value={defaultAccountId}
            onChange={(e) => setDefaultAccountId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName} ({a.platform})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="file" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            CSV file
          </label>
          <input
            id="file"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2 w-full text-sm text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-zinc-200"
          />
        </div>
        {result && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm">
            <p className="text-emerald-400">Imported: {result.imported}</p>
            {result.errors.length > 0 && (
              <ul className="mt-2 max-h-32 overflow-y-auto text-xs text-amber-400">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {result.errors.length > 10 && (
                  <li>… and {result.errors.length - 10} more</li>
                )}
              </ul>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending || !file}
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Importing…" : "Import"}
          </button>
          <Link
            href="/admin/accounts/sales"
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
