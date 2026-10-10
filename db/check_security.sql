-- Security report: every table must have RLS on; "admins" and "product_events"
-- must show 0 policies and NULL grants; the rest SELECT only.
select
  c.relname as table_name,
  c.relrowsecurity as rls_on,
  (select count(*)
     from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = c.relname) as policies,
  (select string_agg(distinct g.grantee::text || ':' || g.privilege_type::text, ', ')
     from information_schema.role_table_grants g
    where g.table_schema = 'public'
      and g.table_name = c.relname
      and g.grantee in ('anon', 'authenticated')) as public_grants
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;