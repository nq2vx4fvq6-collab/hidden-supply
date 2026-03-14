"use client";

import { useState } from "react";
import type { MarketplaceAccount } from "@/lib/marketplaceModels";

interface Props {
  account: MarketplaceAccount;
}

export default function CredentialsForm({ account }: Props) {
  const [username, setUsername] = useState(account.loginUsername ?? "");
  const [password, setPassword] = useState(account.loginPassword ?? "");
  const [notes, setNotes] = useState(account.loginNotes ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/marketplace/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginUsername: username, loginPassword: password, loginNotes: notes }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save credentials.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
          Username / Seller ID
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your-username"
          autoComplete="off"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 pr-12 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
          Notes
          <span className="ml-2 normal-case tracking-normal text-zinc-600">(2FA codes, recovery email, etc.)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="2FA backup code: XXXX&#10;Recovery email: backup@example.com"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors resize-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save credentials"}
        </button>
        {saved && (
          <span className="text-xs text-emerald-400">Saved</span>
        )}
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>

      <p className="text-[11px] text-zinc-600">
        Credentials are stored in your private Vercel Blob — accessible only through this admin panel.
      </p>
    </form>
  );
}
