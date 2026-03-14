import Link from "next/link";
import { redirect } from "next/navigation";

const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<{ refresh_token?: string; error?: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    scope: "Files.Read offline_access",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = (await res.json()) as { refresh_token?: string; error?: string; error_description?: string };
  if (!res.ok) {
    return { error: data.error_description || data.error || res.statusText };
  }
  return { refresh_token: data.refresh_token };
}

export default async function SharePointCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const code = params.code;
  const error = params.error;

  if (error) {
    return (
      <div className="max-w-xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h1 className="text-xl font-semibold text-red-400">SharePoint connection cancelled</h1>
        <p className="text-sm text-zinc-500">{error}</p>
        <Link href="/admin/sync" className="text-sm text-accent hover:underline">
          ← Back to Sync
        </Link>
      </div>
    );
  }

  if (!code) {
    redirect("/admin/sync");
  }

  const clientId = process.env.SHAREPOINT_CLIENT_ID;
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/admin/sharepoint-callback`;

  if (!clientId || !clientSecret) {
    return (
      <div className="max-w-xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h1 className="text-xl font-semibold text-amber-400">Missing config</h1>
        <p className="text-sm text-zinc-500">
          Set SHAREPOINT_CLIENT_ID and SHAREPOINT_CLIENT_SECRET in your environment.
        </p>
        <Link href="/admin/sync" className="text-sm text-accent hover:underline">
          ← Back to Sync
        </Link>
      </div>
    );
  }

  const result = await exchangeCodeForTokens(code, redirectUri, clientId, clientSecret);

  if (result.error) {
    return (
      <div className="max-w-xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h1 className="text-xl font-semibold text-red-400">Token exchange failed</h1>
        <p className="text-sm text-zinc-500">{result.error}</p>
        <Link href="/admin/sync" className="text-sm text-accent hover:underline">
          ← Back to Sync
        </Link>
      </div>
    );
  }

  const refreshToken = result.refresh_token!;

  return (
    <div className="max-w-xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <h1 className="text-xl font-semibold text-emerald-400">SharePoint connected</h1>
      <p className="text-sm text-zinc-500">
        Add this refresh token to your Vercel project as <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs">SHAREPOINT_REFRESH_TOKEN</code>.
        The cron job will use it every 6 hours to sync your Excel file.
      </p>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          SHAREPOINT_REFRESH_TOKEN
        </label>
        <textarea
          readOnly
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs text-zinc-300"
          rows={4}
          value={refreshToken}
        />
      </div>
      <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-500">
        <li>Copy the token above</li>
        <li>Vercel → Project → Settings → Environment Variables</li>
        <li>Add <code className="rounded bg-zinc-800 px-1">SHAREPOINT_REFRESH_TOKEN</code> with the pasted value</li>
        <li>Redeploy so the cron job can use it</li>
      </ol>
      <Link href="/admin/sync" className="inline-block text-sm text-accent hover:underline">
        ← Back to Sync
      </Link>
    </div>
  );
}
