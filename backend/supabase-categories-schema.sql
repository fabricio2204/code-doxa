-- Adicione este SQL no Supabase SQL Editor para criar a tabela de categorias

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  label text not null,
  emoji text not null default '🍽️',
  display_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Desabilitar RLS para a tabela de categorias
alter table public.categories disable row level security;

-- Inserir categorias padrão
insert into public.categories (id, name, label, emoji, display_order) values
  ('todos', 'todos', 'Todos', '🍽️', 0),
  ('cafe', 'cafe', 'Cafés', '☕', 1),
  ('bebidas', 'bebidas', 'Bebidas', '🥤', 2),
  ('doces', 'doces', 'Doces', '🍰', 3),
  ('salgados', 'salgados', 'Salgados', '🥐', 4)
on conflict (id) do nothing;

-- Criar índice para ordenação
create index if not exists idx_categories_display_order on public.categories(display_order);
