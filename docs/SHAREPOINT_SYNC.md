# SharePoint Excel sync (every 6 hours)

The app can sync inventory from your SharePoint/OneDrive Excel file every 6 hours. No manual upload needed.

You can do this in two ways:

- **Option A: Sync through SharePoint** – You (or Power Automate) send the Excel file to the app. No Microsoft sign-in in the app; works with school/organizational accounts. See below.
- **Option B: App fetches from SharePoint** – The app uses a refresh token to fetch the file from Microsoft. Requires Azure app + “Connect SharePoint” sign-in (can be blocked by school accounts).

---

## Option A: Sync through SharePoint (no sign-in in the app)

Best if you can’t sign in with a school account in the app. Something that **already has access** to the file (e.g. Power Automate, or a script on your PC) sends the Excel to the app.

### What you need

- **CRON_SECRET** in Vercel (you already have this).

No Azure app, no refresh token, no “Connect SharePoint” step.

### Connect your Excel link to the site

In Vercel → **Settings** → **Environment Variables**, set:

- **SHAREPOINT_EXCEL_URL** = your Excel sharing link (e.g. the full `https://...sharepoint.com/:x:/g/...` link).
- **CRON_SECRET** = your secret (you already have this).

The **cron** (every 6 hours) will then try to fetch that URL. If the file is shared **“Anyone with the link can view”**, it may work with no sign-in. If not, use the POST method below.

### How to run the sync (POST)

**POST** the Excel file to:

```
POST https://urban-supply-ui-app.vercel.app/api/cron/sync-sharepoint
Authorization: Bearer YOUR_CRON_SECRET
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

**Body:** raw Excel file bytes, **or** `multipart/form-data` with a field named `file`.

### Schedule it with Power Automate (every 6 hours)

1. Go to [flow.microsoft.com](https://flow.microsoft.com) and create a **Scheduled cloud flow** (e.g. every 6 hours).
2. Add action **“OneDrive for Business – Get file content”** (or **SharePoint – Get file content**). Pick your Excel file. This uses your existing Microsoft connection; no sign-in in the app.
3. Add action **“HTTP – HTTP”**:
   - **Method:** POST  
   - **URI:** `https://urban-supply-ui-app.vercel.app/api/cron/sync-sharepoint`  
   - **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`  
   - **Body:** output from “Get file content” (binary).
4. Save and run. The app will merge rows by SKU (same as manual import).

### One-off from your machine

From a terminal (replace with your secret and path to the Excel):

```bash
curl -X POST "https://urban-supply-ui-app.vercel.app/api/cron/sync-sharepoint" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  --data-binary @/path/to/your/inventory.xlsx
```

---

## Option B: App fetches from SharePoint (needs sign-in once)

The app fetches the Excel from Microsoft using a refresh token. You need to complete “Connect SharePoint” once; school accounts may be blocked by org policy.

### What you need

1. **Azure AD app** (for Microsoft Graph)
2. **Environment variables** in Vercel
3. **One-time “Connect SharePoint”** in Admin → Sync to get a refresh token

### 1. Create an Azure AD app

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

### 2. Set environment variables in Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Description |
|----------|-------------|
| `SHAREPOINT_CLIENT_ID` | Azure app Application (client) ID |
| `SHAREPOINT_CLIENT_SECRET` | Azure app client secret value |
| `SHAREPOINT_EXCEL_URL` | Your Excel sharing link (the full SharePoint link you use to open the file) |
| `SHAREPOINT_REFRESH_TOKEN` | (After step 3) The refresh token you get from “Connect SharePoint” |
| `CRON_SECRET` | A long random string (e.g. `openssl rand -hex 32`). Used to secure the cron endpoint. |

### 3. Get the refresh token

1. Deploy the app (so the callback URL is live).
2. Log in to **Admin** → **Sync**.
3. Click **Connect SharePoint**.
4. Sign in with the Microsoft account that has access to the Excel file (e.g. your Baruch/CUNY account).
5. After consent, you’ll be redirected to a page showing **SHAREPOINT_REFRESH_TOKEN**. Copy it.
6. In Vercel, add (or update) **SHAREPOINT_REFRESH_TOKEN** with that value.
7. Redeploy so the new env var is used.

### 4. Excel file format

The SharePoint Excel file should use the **same column headers** as the manual Excel import (e.g. SKU, Brand, Item Name, Category, Size, Condition, Status, Cost, List Price, Sale Price, Sold Date, etc.). See **Admin → Excel Sync** for the full column reference.

### 5. Schedule

- A **Vercel Cron** job runs **every 6 hours** (0:00, 6:00, 12:00, 18:00 UTC).
- It calls `/api/cron/sync-sharepoint`, which fetches the Excel from SharePoint and merges rows into inventory (same logic as manual import: match by SKU, update or create).
- You can also trigger a one-off sync by calling:  
  `GET https://your-app.vercel.app/api/cron/sync-sharepoint`  
  with header: `Authorization: Bearer YOUR_CRON_SECRET`.

### Troubleshooting (Option B)

- **“SharePoint fetch failed”**  
  Check that `SHAREPOINT_REFRESH_TOKEN` is set and not expired. Re-run “Connect SharePoint” to get a new token if needed.
- **“Missing SharePoint config”**  
  Ensure all of `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_EXCEL_URL`, and `SHAREPOINT_REFRESH_TOKEN` are set in Vercel and redeploy.
- **“No rows in sheet”**  
  Confirm the first row of the Excel file contains the expected column headers and that there is at least one data row.
