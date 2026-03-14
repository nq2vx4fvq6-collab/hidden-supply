# SharePoint Excel sync (every 6 hours)

The app can sync inventory from your SharePoint/OneDrive Excel file every 6 hours. No manual upload needed.

## What you need

1. **Azure AD app** (for Microsoft Graph)
2. **Environment variables** in Vercel
3. **One-time “Connect SharePoint”** in Admin → Sync to get a refresh token

## 1. Create an Azure AD app

1. Go to [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** (or Azure Active Directory) → **App registrations** → **New registration**.
2. Name it (e.g. “Hidden Supply SharePoint Sync”).
3. **Supported account types**: “Accounts in any organizational directory and personal Microsoft accounts” (so your Baruch/CUNY and personal account work).
4. **Redirect URI**: Web  
   - Production: `https://urban-supply-ui-app.vercel.app/admin/sharepoint-callback`  
   - Local: `http://localhost:3000/admin/sharepoint-callback`  
   Add both if you test locally.
5. Register. Copy the **Application (client) ID**.
6. Go to **Certificates & secrets** → **New client secret** → copy the **Value** (client secret) once; it’s shown only once.
7. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated** → add **Files.Read** and **offline_access**. Grant admin consent if your org requires it.

## 2. Set environment variables in Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Description |
|----------|-------------|
| `SHAREPOINT_CLIENT_ID` | Azure app Application (client) ID |
| `SHAREPOINT_CLIENT_SECRET` | Azure app client secret value |
| `SHAREPOINT_EXCEL_URL` | Your Excel sharing link (the full SharePoint link you use to open the file) |
| `SHAREPOINT_REFRESH_TOKEN` | (After step 3) The refresh token you get from “Connect SharePoint” |
| `CRON_SECRET` | A long random string (e.g. `openssl rand -hex 32`). Used to secure the cron endpoint. |

## 3. Get the refresh token

1. Deploy the app (so the callback URL is live).
2. Log in to **Admin** → **Sync**.
3. Click **Connect SharePoint**.
4. Sign in with the Microsoft account that has access to the Excel file (e.g. your Baruch/CUNY account).
5. After consent, you’ll be redirected to a page showing **SHAREPOINT_REFRESH_TOKEN**. Copy it.
6. In Vercel, add (or update) **SHAREPOINT_REFRESH_TOKEN** with that value.
7. Redeploy so the new env var is used.

## 4. Excel file format

The SharePoint Excel file should use the **same column headers** as the manual Excel import (e.g. SKU, Brand, Item Name, Category, Size, Condition, Status, Cost, List Price, Sale Price, Sold Date, etc.). See **Admin → Excel Sync** for the full column reference.

## 5. Schedule

- A **Vercel Cron** job runs **every 6 hours** (0:00, 6:00, 12:00, 18:00 UTC).
- It calls `/api/cron/sync-sharepoint`, which fetches the Excel from SharePoint and merges rows into inventory (same logic as manual import: match by SKU, update or create).
- You can also trigger a one-off sync by calling:  
  `GET https://your-app.vercel.app/api/cron/sync-sharepoint`  
  with header: `Authorization: Bearer YOUR_CRON_SECRET`.

## Troubleshooting

- **“SharePoint fetch failed”**  
  Check that `SHAREPOINT_REFRESH_TOKEN` is set and not expired. Re-run “Connect SharePoint” to get a new token if needed.
- **“Missing SharePoint config”**  
  Ensure all of `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_EXCEL_URL`, and `SHAREPOINT_REFRESH_TOKEN` are set in Vercel and redeploy.
- **“No rows in sheet”**  
  Confirm the first row of the Excel file contains the expected column headers and that there is at least one data row.
