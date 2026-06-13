create table if not exists reviews (
  id          uuid default gen_random_uuid() primary key,
  product_id  text not null references products(id) on delete cascade,
  user_name   text not null,
  user_email  text not null,
  rating      integer not null check (rating between 1 and 5),
  title       text not null,
  body        text not null,
  verified    boolean not null default false,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on reviews(product_id);
create index if not exists reviews_approved_idx on reviews(approved);

alter table reviews enable row level security;
create policy "Public read approved reviews" on reviews for select using (approved = true);
create policy "Service role all" on reviews using (auth.role() = 'service_role');

create or replace function update_product_rating()
returns trigger language plpgsql as $$
declare
  v_product_id text;
  v_avg        numeric(3,1);
  v_count      integer;
begin
  if TG_OP = 'DELETE' then
    v_product_id := OLD.product_id;
  else
    v_product_id := NEW.product_id;
  end if;

  select
    coalesce(round(avg(rating)::numeric, 1), 0),
    count(*)
  into v_avg, v_count
  from reviews
  where product_id = v_product_id
    and approved = true;

  update products
  set rating  = v_avg,
      reviews = v_count
  where id = v_product_id;

  return null;
end;
$$;

create or replace trigger reviews_update_rating
  after insert or update or delete on reviews
  for each row execute function update_product_rating();
