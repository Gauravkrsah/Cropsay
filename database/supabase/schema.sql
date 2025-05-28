-- Orders table for CropsayAI e-commerce
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  date timestamptz not null default now(),
  total numeric not null,
  status text not null, -- e.g. 'Pending', 'Paid', 'Cancelled'
  items jsonb not null, -- array of cart items
  address text not null,
  phone text not null,
  payment_method text not null, -- 'Khalti', 'eSewa', 'COD', etc.
  payment_payload jsonb, -- optional: store payment gateway response
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast user order lookup
create index if not exists idx_orders_user_id on public.orders(user_id);

-- Trigger to update updated_at on row update
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at
before update on public.orders
for each row
execute procedure update_updated_at_column();
