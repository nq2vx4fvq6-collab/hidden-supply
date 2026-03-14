import { isSheetsConfigured } from "@/lib/services/googleSheetsService";
import { getAllAccounts, getPlatformSales } from "@/lib/services/marketplaceStore";
import RefreshSheetsButton from "@/components/admin/RefreshSheetsButton";
import SharePointConnectButton from "@/components/admin/SharePointConnectButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MICROSOFT_AUTH_BASE = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";

export default async function AdminSyncPage() {
  const configured = isSheetsConfigured();
  const [accounts, sales] = await Promise.all([getAllAccounts(), getPlatformSales()]);

  const clientId = process.env.SHAREPOINT_CLIENT_ID;
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/admin/sharepoint-callback`;
  const sharePointAuthUrl = clientId
    ? `${MICROSOFT_AUTH_BASE}?${new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: "Files.Read offline_access",
        response_mode: "query",
      })}`
    : "";

  const hasSharePointConfig = Boolean(clientId && process.env.SHAREPOINT_CLIENT_SECRET);
  const sharePointExcelUrl = process.env.SHAREPOINT_EXCEL_URL;
  const sharePointReady = Boolean(process.env.SHAREPOINT_REFRESH_TOKEN && sharePointExcelUrl);

  const connectedCount = accounts.filter((a) => a.isConnected).length;
  const unmatchedCount = sales.filter((s) => !s.matchedItemId).length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount ?? 0), 0);

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sync & connection</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Marketplace accounts, Google Sheets, SharePoint Excel, and cron sync
        </p>
      </div>

      {/* ── Marketplace accounts panel ─────────────────────────────────── */}
      <Link
        href="/admin/accounts"
        className="group block rounded-2xl border border-zinc-700/60 bg-zinc-900/30 p-6 transition-all hover:border-zinc-600 hover:bg-zinc-900/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
              Marketplace Accounts
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Manage eBay, StockX, Poshmark, Grailed &amp; Depop accounts — credentials, sales monitoring, supply cross-check
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-accent/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
            Open →
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Accounts</p>
            <p className="mt-1 text-lg font-bold text-zinc-100">{accounts.length}</p>
            <p className="text-[10px] text-zinc-600">{connectedCount} connected</p>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Total revenue</p>
            <p className="mt-1 text-lg font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-600">{sales.length} sales logged</p>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Unmatched</p>
            <p className="mt-1 text-lg font-bold text-amber-400">{unmatchedCount}</p>
            <p className="text-[10px] text-zinc-600">need supply match</p>
          </div>
        </div>
      </Link>

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

      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">SharePoint Excel (every 6 hours)</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {sharePointReady
                ? "Cron syncs your SharePoint Excel file every 6 hours. Same columns as manual import."
                : sharePointExcelUrl
                  ? "Excel link is set. Cron will try to fetch it (works if file is \"Anyone with the link\") or use POST from Power Automate."
                  : "Set SHAREPOINT_EXCEL_URL (your Excel link) and CRON_SECRET in Vercel. Optionally connect for OAuth or use POST from Power Automate."}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${
              sharePointReady ? "bg-emerald-500/20 text-emerald-400" : sharePointExcelUrl ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {sharePointReady ? "Active" : sharePointExcelUrl ? "Link set" : "Not configured"}
          </span>
        </div>
        <SharePointConnectButton authUrl={sharePointAuthUrl} hasConfig={hasSharePointConfig} />
        {hasSharePointConfig && !sharePointExcelUrl && (
          <p className="text-xs text-amber-500">
            Add SHAREPOINT_EXCEL_URL (your Excel sharing link) and CRON_SECRET in Vercel env.
          </p>
        )}
        <p className="text-xs text-zinc-500">
          Can’t sign in (e.g. school account)? Sync by sending the Excel file from Power Automate or a script — no sign-in. See docs/SHAREPOINT_SYNC.md “Option A: Sync through SharePoint”.
        </p>
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
