-- Customer insights: richer customer_summary (LTV / AOV / first order) for #11,
-- plus a customer_profiles view that exposes each registered customer's saved
-- profile keyed by email for the admin Customers screen (#4).
-- Run in the Supabase SQL editor.

-- ── #11: add first_order_at + average_order_value to the existing summary ──
-- (last_order_at, order_count, total_spend already present.) days_since_last_order
-- is derived in the API from last_order_at so the view doesn't go stale by the day.
-- New columns are appended AFTER the existing ones: CREATE OR REPLACE VIEW only
-- permits adding columns at the end (it cannot rename/reorder existing ones).
create or replace view customer_summary as
select
  lower(email)                                  as email,
  max(first_name)                               as first_name,
  max(last_name)                                as last_name,
  max(phone)                                    as phone,
  max(city)                                     as city,
  count(*)::int                                 as order_count,
  sum(total)                                    as total_spend,
  max(created_at)                               as last_order_at,
  (sum(total) / nullif(count(*), 0))            as average_order_value,
  min(created_at)                               as first_order_at
from orders
group by lower(email);

grant select on customer_summary to service_role;

-- ── #4: registered customers' saved profile, keyed by email ──
-- profiles.id references auth.users(id); the order/customer key is email, so we
-- join through auth.users to expose email alongside the saved address. Email is
-- lowercased to match customer_summary. Service-role only (reads auth schema).
create or replace view customer_profiles as
select
  lower(u.email)  as email,
  p.full_name     as full_name,
  p.phone         as phone,
  p.address       as address,
  p.city          as city,
  p.province      as province,
  p.postcode      as postcode,
  p.country       as country,
  p.updated_at    as updated_at
from profiles p
join auth.users u on u.id = p.id
where u.email is not null;

grant select on customer_profiles to service_role;
