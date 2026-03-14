# Project structure

Corporate-ready layout for the Hidden Supply / Urban Supply UI codebase.

## Root

```
├── app/                 # Next.js App Router (routes, layouts, server components)
├── components/          # React components by domain
├── lib/                 # Shared logic: types, services, config
├── data/                # JSON data stores (inventory, marketplace)
├── public/              # Static assets
├── middleware.ts        # Auth / routing middleware
├── next.config.ts
├── tsconfig.json
└── package.json
```

## `app/`

- **Routes**: File-based routing. No structural changes to URLs.
- **`app/admin/`** — Admin dashboard (layout, dashboard, items, sales, sync, import-export, login).
- **`app/admin/accounts/`** — Reseller accounts panel (dashboard, accounts CRUD, sales monitor, supply cross-check).
- **`app/api/`** — API routes: auth, items, import/export, marketplace (accounts, sales, sync), stockx, upload.
- **`app/actions/`** — Server actions: items, marketplace, sync.
- **Public**: `app/page.tsx`, `app/brand/`, `app/category/`, `app/item/`, `app/community/`, `app/login/`, `app/loading.tsx`, `app/globals.css`, `app/layout.tsx`.

## `components/`

Grouped by domain. Use `@/components/<domain>/<Component>`.

| Folder         | Purpose |
|----------------|---------|
| **admin/**     | Admin UI: filters, tables, item forms, Excel import, charts, status/quick actions, purge images, refresh sheets. |
| **marketplace/** | Reseller accounts: account/sale forms, platform badge, sales filters, supply cross-check list, sync button. |
| **catalog/**   | Public catalog: header, filters, image gallery, StockX badge. |
| **auth/**      | Login form, logout button. |
| **ui/**        | Shared UI: status badge (used in admin and catalog). |

## `lib/`

| Path | Purpose |
|------|---------|
| **lib/models.ts** | Core types: `Item`, `InventoryStatus`, `ItemFilters`, `ExcelColumnMapping`, `PaginatedResult`. |
| **lib/marketplaceModels.ts** | Marketplace types: `Platform`, `MarketplaceAccount`, `PlatformSale`, `MarketplaceStore`. |
| **lib/services/** | Backend and external services. |
| **lib/services/inventoryService.ts** | Item CRUD, getStats, getItemsSource (store + optional Google Sheets). |
| **lib/services/store.ts** | Inventory persistence (file, Vercel Blob, or KV). |
| **lib/services/filters.ts** | `applyItemFilters` for catalog/admin. |
| **lib/services/googleSheetsService.ts** | Google Sheets read/write and cache. |
| **lib/services/excelService.ts** | Excel import/export. |
| **lib/services/marketplaceStore.ts** | Marketplace accounts and platform sales (file-based). |
| **lib/services/ebayService.ts** | eBay OAuth and Fulfillment API helpers. |
| **lib/config/** | Static config and seed data. |
| **lib/config/excelColumnsConfig.ts** | Excel column labels and mapping. |
| **lib/config/mockData.ts** | Optional mock items. |

## `data/`

- **data/inventory.json** — Default inventory store (when not using Blob/KV).
- **data/marketplace.json** — Marketplace accounts and platform sales (created on first write).

## Imports

- **Components**: `@/components/<domain>/<Name>` (e.g. `@/components/admin/AdminFilters`, `@/components/ui/StatusBadge`).
- **Types**: `@/lib/models`, `@/lib/marketplaceModels`.
- **Services**: `@/lib/services/<service>` (e.g. `@/lib/services/inventoryService`, `@/lib/services/marketplaceStore`).
- **Config**: `@/lib/config/excelColumnsConfig`, `@/lib/config/mockData`.

## Conventions

- **Naming**: PascalCase for components and types; camelCase for functions and files under `lib/services` and `lib/config`.
- **Server vs client**: Use `"use client"` only where needed (forms, hooks, browser APIs). Prefer server components and server actions.
- **Env**: Use `.env.local` for secrets; document required vars in README or DEPLOY.md.
