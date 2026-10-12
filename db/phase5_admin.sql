-- Phase 5.1: admin access.
-- Run once in the Supabase SQL Editor. This file contains no personal data;
-- the admin row itself is added separately (see the end of the chat step).

-- 1) Who is an admin? Anyone whose user id is listed in public.admins.
--    security definer: the function may read the locked admins table for us.
--    set search_path = '': safer, every name inside is fully qualified.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- 2) Admins can read every row (including draft / hidden products).
--    These policies are added next to the public ones; a row is visible
--    if ANY select policy allows it.
create policy "Admin can read all categories"
  on public.categories for select to authenticated
  using (public.is_admin());

create policy "Admin can read all products"
  on public.products for select to authenticated
  using (public.is_admin());

create policy "Admin can read all variants"
  on public.product_variants for select to authenticated
  using (public.is_admin());

create policy "Admin can read all images"
  on public.product_images for select to authenticated
  using (public.is_admin());

-- 3) Admin writes. Door (grant) first, then the room rule (policy).
--    Products and categories are never deleted: archive / deactivate instead.

-- categories: insert + update
grant insert, update on public.categories to authenticated;

create policy "Admin can insert categories"
  on public.categories for insert to authenticated
  with check (public.is_admin());

create policy "Admin can update categories"
  on public.categories for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- products: insert + update
grant insert, update on public.products to authenticated;

create policy "Admin can insert products"
  on public.products for insert to authenticated
  with check (public.is_admin());

create policy "Admin can update products"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- product_variants: insert + update + delete
grant insert, update, delete on public.product_variants to authenticated;

create policy "Admin can insert variants"
  on public.product_variants for insert to authenticated
  with check (public.is_admin());

create policy "Admin can update variants"
  on public.product_variants for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete variants"
  on public.product_variants for delete to authenticated
  using (public.is_admin());

-- product_images: insert + update + delete
grant insert, update, delete on public.product_images to authenticated;

create policy "Admin can insert images"
  on public.product_images for insert to authenticated
  with check (public.is_admin());

create policy "Admin can update images"
  on public.product_images for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete images"
  on public.product_images for delete to authenticated
  using (public.is_admin());

-- shop_settings: update only (a single row, id = 1)
grant update on public.shop_settings to authenticated;

create policy "Admin can update shop settings"
  on public.shop_settings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4) Storage: only admins may add / change / remove / list files in the
--    product-images bucket. Reading stays public because the bucket is public.
create policy "Admin can read product images files"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admin can upload product images files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin can update product images files"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin can delete product images files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- 5) products.updated_at, kept fresh by a trigger.
alter table public.products
  add column updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();