/**
 * Microsoft Graph API helpers to fetch an Excel file from SharePoint/OneDrive via sharing link.
 * Uses OAuth 2.0 refresh token (delegated) to get access token, then GET /shares/{encoded}/driveItem/content.
 */

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

/** Encode sharing URL for Graph API (base64url with u! prefix). */
export function encodeSharingUrl(sharingUrl: string): string {
  const base64 = Buffer.from(sharingUrl, "utf-8").toString("base64");
  const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return "u!" + base64url;
}

/** Exchange refresh token for access token. */
export async function getAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    scope: "Files.Read offline_access",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SharePoint token exchange failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("No access_token in response");
  return data.access_token;
}

/**
 * Fetch Excel file content from SharePoint/OneDrive using a sharing link.
 * Returns the file as ArrayBuffer for xlsx parsing.
 */
export async function getExcelContentBySharingUrl(
  accessToken: string,
  sharingUrl: string
): Promise<ArrayBuffer> {
  const encoded = encodeSharingUrl(sharingUrl);
  const url = `${GRAPH_BASE}/shares/${encoded}/driveItem/content`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: "redeemSharingLinkIfNecessary",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SharePoint file fetch failed: ${res.status} ${text}`);
  }

  return res.arrayBuffer();
}

/**
 * Try to fetch the file directly (no auth). Works only if the file is shared
 * "Anyone with the link can view" and the server returns the file. Returns
 * null if the response is not a valid Excel file.
 */
export async function tryDirectFetch(sharingUrl: string): Promise<ArrayBuffer | null> {
  const res = await fetch(sharingUrl, {
    method: "GET",
    headers: {
      "User-Agent": "UrbanSupplySync/1.0",
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*",
    },
    redirect: "follow",
  });

  if (!res.ok) return null;

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const buffer = await res.arrayBuffer();
  // xlsx files are ZIP (PK magic bytes) or check content-type
  const isExcel =
    contentType.includes("spreadsheet") ||
    contentType.includes("vnd.openxmlformats") ||
    (buffer.byteLength >= 4 &&
      new Uint8Array(buffer)[0] === 0x50 &&
      new Uint8Array(buffer)[1] === 0x4b);

  return isExcel ? buffer : null;
}
