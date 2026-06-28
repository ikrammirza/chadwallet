-- Run this in your Supabase SQL editor to enable trade history

create table if not exists trades (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  wallet_address text not null,
  token_address text not null,
  token_symbol text,
  token_logo text,
  side text not null check (side in ('buy', 'sell')),
  amount_sol numeric not null,
  amount_usd numeric,
  tx_signature text,
  created_at timestamptz default now()
);

create index if not exists trades_user_id_idx on trades (user_id);
create index if not exists trades_created_at_idx on trades (created_at desc);

alter table trades enable row level security;

-- Allow inserts and reads via anon key (demo; tighten for production)
create policy "Allow insert trades" on trades for insert with check (true);
create policy "Allow read trades" on trades for select using (true);
