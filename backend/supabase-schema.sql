-- Execute este SQL no Supabase SQL Editor

create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  description text not null,
  price numeric(10,2) not null,
  category text not null,
  image_path text,
  available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create sequence if not exists public.orders_sequence_number_seq;

create table if not exists public.orders (
  id text primary key,
  sequence_number bigint unique not null default nextval('public.orders_sequence_number_seq'),
  customer_token text,
  customer_name text not null,
  customer_phone text,
  total numeric(10,2) not null,
  status text default 'pendente',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  item_id text not null references public.menu_items(id),
  quantity integer not null,
  price numeric(10,2) not null
);

create index if not exists idx_orders_customer_token on public.orders(customer_token);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

create or replace function public.sync_orders_sequence()
returns void
language sql
security definer
as $$
  select setval(
    'public.orders_sequence_number_seq',
    coalesce((select max(sequence_number) from public.orders), 0),
    true
  );
$$;

alter table public.menu_items disable row level security;
alter table public.orders disable row level security;
alter table public.order_items disable row level security;
