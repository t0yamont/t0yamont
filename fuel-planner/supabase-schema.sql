-- Run this in your Supabase SQL editor

create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  sport text not null,
  wizard_state jsonb not null,
  computed jsonb
);

alter table plans enable row level security;

create policy "users read own plans"
  on plans for select using (auth.uid() = user_id);
create policy "users insert own plans"
  on plans for insert with check (auth.uid() = user_id);
create policy "users update own plans"
  on plans for update using (auth.uid() = user_id);
create policy "users delete own plans"
  on plans for delete using (auth.uid() = user_id);

-- Custom product library (Change 2) — user-defined fuel products
create table custom_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  carbs numeric not null,
  sodium numeric default 0,
  fluid numeric default 0,
  caffeine numeric default 0,
  mixed_carb boolean default false,
  servings_per_container numeric,
  created_at timestamptz default now()
);

alter table custom_products enable row level security;

create policy "own custom products"
  on custom_products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Post-race log — one entry per plan (plan_id is unique)
create table post_race_log (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null unique references plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  actual_splits jsonb not null default '{}',
  actual_items jsonb not null default '[]',
  notes text not null default '',
  created_at timestamptz default now()
);

alter table post_race_log enable row level security;

create policy "users read own race logs"
  on post_race_log for select using (auth.uid() = user_id);
create policy "users insert own race logs"
  on post_race_log for insert with check (auth.uid() = user_id);
create policy "users update own race logs"
  on post_race_log for update using (auth.uid() = user_id);
create policy "users delete own race logs"
  on post_race_log for delete using (auth.uid() = user_id);
