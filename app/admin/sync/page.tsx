import { isSheetsConfigured } from "@/lib/services/googleSheetsService";
import RefreshSheetsButton from "@/components/admin/RefreshSheetsButton";
import SharePointConnectButton from "@/components/admin/SharePointConnectButton";
import Link from "next/link";

const MICROSOFT_AUTH_BASE = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";

export default async function AdminSyncPage() {
  const configured = isSheetsConfigured();

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

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sync & connection</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Google Sheets, SharePoint Excel, and cron sync
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
