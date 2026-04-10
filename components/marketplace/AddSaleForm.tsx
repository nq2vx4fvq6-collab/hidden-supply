"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MarketplaceAccount } from "@/lib/types/marketplace";

interface Props {
  accounts: MarketplaceAccount[];
}

export default function AddSaleForm({ accounts }: Props) {
  const router = useRouter();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [soldAt, setSoldAt] = useState(new Date().toISOString().slice(0, 10));
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [pending, setPending] = useState(false);

  const account = accounts.find((a) => a.id === accountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !account) return;
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("accountId", accountId);
      formData.set("platform", account.platform);
      formData.set("title", title.trim() || "Untitled");
      formData.set("amount", amount.trim() || "0");
      formData.set("currency", "USD");
      formData.set("soldAt", soldAt);
      if (sku.trim()) formData.set("sku", sku.trim());
      if (brand.trim()) formData.set("brand", brand.trim());
      if (size.trim()) formData.set("size", size.trim());

      const res = await fetch("/api/marketplace/sales", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        router.push("/admin/accounts/sales");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div>
        <label htmlFor="accountId" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Account
        </label>
        <select
          id="accountId"
          name="accountId"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          required
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
        <label htmlFor="title" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Item title"
          className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
          />
        </div>
        <div>
          <label htmlFor="soldAt" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Sold date
          </label>
          <input
            id="soldAt"
            name="soldAt"
            type="date"
            value={soldAt}
            onChange={(e) => setSoldAt(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="sku" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            SKU (optional)
          </label>
          <input
            id="sku"
            name="sku"
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
          />
        </div>
        <div>
          <label htmlFor="brand" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Brand (optional)
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
          />
        </div>
        <div>
          <label htmlFor="size" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Size (optional)
          </label>
          <input
            id="size"
            name="size"
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add sale"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
