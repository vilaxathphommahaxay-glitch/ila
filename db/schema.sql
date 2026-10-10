-- ILa catalog: database schema (Supabase / PostgreSQL)
-- Run top to bottom in the SQL Editor on an EMPTY project.
-- Pattern for every table: create -> enable RLS -> revoke everything from the
-- API roles -> grant only what is needed -> add a policy.

-- New tables must not be handed to the API roles automatically.
alter default privileges in schema public
  revoke all on tables from anon, authenticated;

-- categories
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
revoke all on public.categories from anon, authenticated;
grant select on public.categories to anon, authenticated;
create policy "Public can read active categories"
  on public.categories for select to anon, authenticated
  using (is_active = true);

-- products
create table public.products (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  description text,
  price_lak integer not null check (price_lak >= 0),
  compare_at_price_lak integer check (compare_at_price_lak >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'hidden', 'archived')),
  search_keywords text,
  created_at timestamptz not null default now()
);
create index products_category_id_idx on public.products (category_id);
alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
create policy "Public can read active and archived products"
  on public.products for select to anon, authenticated
  using (status in ('active', 'archived'));

-- product_variants (color / size / stock status)
create table public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  color text,
  size text,
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'low', 'sold_out')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique nulls not distinct (product_id, color, size)
);
create index product_variants_product_id_idx on public.product_variants (product_id);
alter table public.product_variants enable row level security;
revoke all on public.product_variants from anon, authenticated;
grant select on public.product_variants to anon, authenticated;
create policy "Public can read variants of visible products"
  on public.product_variants for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and p.status in ('active', 'archived')
    )
  );

-- product_images (storage_path = path inside Supabase Storage, not a full URL)
create table public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_id_idx on public.product_images (product_id);
alter table public.product_images enable row level security;
revoke all on public.product_images from anon, authenticated;
grant select on public.product_images to anon, authenticated;
create policy "Public can read images of visible products"
  on public.product_images for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.status in ('active', 'archived')
    )
  );

-- shop_settings (exactly one row)
create table public.shop_settings (
  id integer primary key default 1 check (id = 1),
  shop_name text not null,
  whatsapp_number text,
  messenger_username text,
  facebook_url text,
  how_to_order text,
  shipping_note text
);
alter table public.shop_settings enable row level security;
revoke all on public.shop_settings from anon, authenticated;
grant select on public.shop_settings to anon, authenticated;
create policy "Public can read shop settings"
  on public.shop_settings for select to anon, authenticated
  using (true);

-- admins (LOCKED: no grant, no policy for the API roles)
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- product_events (LOCKED: written by our own server code, never by visitors)
create table public.product_events (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  event_type text not null check (event_type in ('view', 'order_click')),
  created_at timestamptz not null default now()
);
create index product_events_product_id_idx
  on public.product_events (product_id, created_at);
alter table public.product_events enable row level security;
revoke all on public.product_events from anon, authenticated;