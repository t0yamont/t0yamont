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
