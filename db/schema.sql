-- Emergency Fund Schema
-- This is a suggested schema for a remote database like Supabase/PostgreSQL
-- Currently, the app uses local IndexedDB, but this can be adapted for sync

create table if not exists public.emergency_fund (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  target      numeric(12,2) default 0,
  current     numeric(12,2) default 0,
  updated_at  timestamptz default now()
);

-- For storing aportes history, if using relational DB
-- In the current local implementation, aportes are stored as an array in the emergency record
-- For remote sync, you might want a separate table:

create table if not exists public.emergency_aportes (
  id              uuid default uuid_generate_v4() primary key,
  emergency_id    uuid references public.emergency_fund(id) on delete cascade not null,
  value           numeric(12,2) not null,
  date            timestamptz default now(),
  created_at      timestamptz default now()
);