-- ================================================================
-- Hidden Supply — Supabase schema
-- Paste this into the Supabase SQL Editor and click Run.
-- ================================================================

-- ── Items (inventory) ────────────────────────────────────────────

create table if not exists items (
  id                  text primary key,
  sku                 text not null default '',
  brand               text not null default '',
  name                text not null default '',
  category            text not null default '',
  size                text not null default '',
  condition           text not null default '',
  colorway            text,
  cost                numeric(10, 2),
  list_price          numeric(10, 2),
  sale_price          numeric(10, 2),
  status              text not null default 'available',
  images              jsonb not null default '[]'::jsonb,
  acquisition_date    text,
  sold_date           text,
  sold_to             text,
  notes               text,
  listed_on_platforms jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists items_status_idx    on items (status);
create index if not exists items_brand_idx     on items (brand);
create index if not exists items_category_idx  on items (category);
create index if not exists items_created_at_idx on items (created_at desc);

-- ── Marketplace accounts ─────────────────────────────────────────

create table if not exists marketplace_accounts (
  id               text primary key,
  platform         text not null,
  display_name     text not null,
  external_id      text,
  credentials_ref  text,
  login_username   text,
  login_password   text,
  login_notes      text,
  notes            text,
  is_connected     boolean not null default false,
  last_synced_at   timestamptz,
  avatar_url       text,
  email            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists marketplace_accounts_platform_idx on marketplace_accounts (platform);

-- ── Platform sales ───────────────────────────────────────────────

create table if not exists platform_sales (
  id               text primary key,
  account_id       text not null references marketplace_accounts (id) on delete cascade,
  platform         text not null,
  external_sale_id text,
  title            text not null,
  sku              text,
  brand            text,
  size             text,
  amount           numeric(10, 2) not null,
  currency         text not null default 'USD',
  sold_at          timestamptz not null,
  raw_payload      jsonb,
  matched_item_id  text references items (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists platform_sales_account_id_idx      on platform_sales (account_id);
create index if not exists platform_sales_platform_idx        on platform_sales (platform);
create index if not exists platform_sales_sold_at_idx         on platform_sales (sold_at desc);
create index if not exists platform_sales_matched_item_id_idx on platform_sales (matched_item_id);
create unique index if not exists platform_sales_external_id_uidx
  on platform_sales (account_id, external_sale_id)
  where external_sale_id is not null;

-- ── Activity logs ────────────────────────────────────────────────

create table if not exists activity_logs (
  id          text primary key,
  account_id  text not null references marketplace_accounts (id) on delete cascade,
  action      text not null,
  detail      text,
  status      text not null default 'info',
  timestamp   timestamptz not null default now(),
  metadata    jsonb
);

create index if not exists activity_logs_account_id_idx on activity_logs (account_id);
create index if not exists activity_logs_timestamp_idx  on activity_logs (timestamp desc);
