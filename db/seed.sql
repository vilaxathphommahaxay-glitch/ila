-- Sample data. Run AFTER schema.sql.

insert into public.categories (name, slug, sort_order)
values
  ('ເສື້ອຢືດ', 'tshirt', 1),
  ('ກະເປົາ', 'bag', 2),
  ('ອຸປະກອນເສີມ', 'accessory', 3);

insert into public.shop_settings (shop_name) values ('ILa');

-- TEST DATA: fake products. DELETE THESE BEFORE LAUNCH.
insert into public.products (category_id, name, slug, sku, description, price_lak, status)
values
  ((select id from public.categories where slug = 'tshirt'),
   'ເສື້ອທົດລອງ 1', 'test-shirt-1', 'TEST-001', 'ສິນຄ້າທົດລອງ', 100000, 'active'),
  ((select id from public.categories where slug = 'tshirt'),
   'ເສື້ອທົດລອງ 2', 'test-shirt-2', 'TEST-002', 'ສິນຄ້າທົດລອງ', 150000, 'active'),
  ((select id from public.categories where slug = 'tshirt'),
   'ເສື້ອທົດລອງ 3 (ຮ່າງ)', 'test-shirt-3', 'TEST-003', 'ສິນຄ້າທົດລອງ', 120000, 'draft');

insert into public.product_variants (product_id, color, size, stock_status)
values
  ((select id from public.products where sku = 'TEST-001'), 'ດຳ', 'M', 'in_stock'),
  ((select id from public.products where sku = 'TEST-001'), 'ດຳ', 'L', 'low'),
  ((select id from public.products where sku = 'TEST-001'), 'ຂາວ', 'M', 'sold_out'),
  ((select id from public.products where sku = 'TEST-002'), 'ດຳ', 'L', 'in_stock'),
  ((select id from public.products where sku = 'TEST-003'), 'ດຳ', 'L', 'in_stock');