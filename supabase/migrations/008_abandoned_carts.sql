create table if not exists abandoned_carts (
  id           uuid default gen_random_uuid() primary key,
  session_id   text not null unique,
  email        text not null default '',
  cart_data    jsonb not null default '[]',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  email_sent_at timestamptz,
  recovered_at timestamptz
);
create index if not exists abandoned_carts_email_idx on abandoned_carts(email);
create index if not exists abandoned_carts_recovery_idx on abandoned_carts(email_sent_at, recovered_at, created_at);
alter table abandoned_carts enable row level security;
create policy "Service role only" on abandoned_carts using (auth.role() = 'service_role');
