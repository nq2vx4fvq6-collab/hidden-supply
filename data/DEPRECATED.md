# Deprecated: File-Based Data Store

The JSON files in this directory are **legacy remnants** from before Supabase was integrated.

| File | Status |
|------|--------|
| `inventory.json` | Deprecated — Supabase is the source of truth for all inventory |
| `marketplace.json` | Deprecated — Supabase is the source of truth for all marketplace accounts and sales |

**Do not write to or read from these files in new code.** All data access should go through
`lib/services/inventory.ts` and `lib/services/marketplace.ts`, which use the Supabase client.

These files can be fully deleted once confirmed that no code references them as a fallback path.
