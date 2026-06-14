create or replace view customer_summary as
select
  lower(email)                   as email,
  max(first_name)                as first_name,
  max(last_name)                 as last_name,
  max(phone)                     as phone,
  max(city)                      as city,
  count(*)::int                  as order_count,
  sum(total)                     as total_spend,
  max(created_at)                as last_order_at
from orders
group by lower(email);

-- No RLS needed on a view (inherits from orders table)
-- Grant service role read access
grant select on customer_summary to service_role;
