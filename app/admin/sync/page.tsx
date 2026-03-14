import { isSheetsConfigured } from "@/lib/googleSheetsService";
import RefreshSheetsButton from "@/components/RefreshSheetsButton";
import Link from "next/link";

export default async function AdminSyncPage() {
  const configured = isSheetsConfigured();

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sync & connection</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Google Sheets connection status and cache refresh
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">Google Sheets</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {configured
                ? "Connected. Catalog and admin read inventory from your sheet (cached 60s)."
                : "Not configured. Set GOOGLE_SHEETS_ID and GOOGLE_CREDENTIALS to pull from a sheet."}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${
              configured
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {configured ? "Connected" : "Not configured"}
          </span>
        </div>
        {configured && (
          <RefreshSheetsButton className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90" />
        )}
      </div>

      <p className="text-xs text-zinc-600">
        Import/export Excel files and column reference:{" "}
        <Link href="/admin/import-export" className="underline hover:text-zinc-400">
          Excel Sync
        </Link>
      </p>
    </div>
  );
}
