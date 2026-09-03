-- ============================================================================
-- Say & It Becomes — database schema
-- Run in Supabase → SQL Editor (project: "say it" / krtixudkoojbhypypjqv).
-- Idempotent: safe to run more than once. Does NOT alter columns that already
-- exist with a different type — see the introspection queries at the bottom.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles : one row per auth user (PK = auth.users.id)
--   written by saveProfile(), read by loadUserData()
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text        not null default '',
  gender        text        not null default '',
  focus_areas   text[]      not null default '{}',
  about         text        not null default '',
  voice_uri     text        not null default '',
  reminder_on   boolean     not null default true,
  reminder_time text        not null default '08:00',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- affirmations : the user's saved declarations ("gallery")
--   insert/select/patch/delete in saveToGallery / loadUserData / gallery edit
-- ---------------------------------------------------------------------------
create table if not exists public.affirmations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  text       text        not null,
  play_count integer     not null default 0,
  kind       text        not null default 'affirmation',  -- 'affirmation' | 'whisper'
  created_at timestamptz not null default now()
);

-- If the table already exists from an earlier run, add the column:
alter table public.affirmations
  add column if not exists kind text not null default 'affirmation';

create index if not exists affirmations_user_created_idx
  on public.affirmations (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- streaks : one row per user. user_id is the PK so the app's upsert
--   (Prefer: resolution=merge-duplicates) works.
-- ---------------------------------------------------------------------------
create table if not exists public.streaks (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  count      integer     not null default 0,
  last_date  date,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- The anon key is embedded in the shipped JS bundle, so RLS is the ONLY thing
-- protecting user data. Every table must have RLS on + per-user policies.
-- ============================================================================
alter table public.profiles     enable row level security;
alter table public.affirmations enable row level security;
alter table public.streaks      enable row level security;

-- profiles (owner = id) -----------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- affirmations (owner = user_id) ------------------------------------------------
drop policy if exists affirmations_select_own on public.affirmations;
drop policy if exists affirmations_insert_own on public.affirmations;
drop policy if exists affirmations_update_own on public.affirmations;
drop policy if exists affirmations_delete_own on public.affirmations;
create policy affirmations_select_own on public.affirmations
  for select using (auth.uid() = user_id);
create policy affirmations_insert_own on public.affirmations
  for insert with check (auth.uid() = user_id);
create policy affirmations_update_own on public.affirmations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy affirmations_delete_own on public.affirmations
  for delete using (auth.uid() = user_id);

-- streaks (owner = user_id) -----------------------------------------------------
drop policy if exists streaks_select_own on public.streaks;
drop policy if exists streaks_insert_own on public.streaks;
drop policy if exists streaks_update_own on public.streaks;
create policy streaks_select_own on public.streaks
  for select using (auth.uid() = user_id);
create policy streaks_insert_own on public.streaks
  for insert with check (auth.uid() = user_id);
create policy streaks_update_own on public.streaks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Auto-create a profiles row when a user signs up, so the first profile read
-- returns a row instead of []. (The app also upserts on first save, so this is
-- a convenience, not a hard requirement.)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Keep updated_at current on profiles / streaks
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists streaks_set_updated_at on public.streaks;
create trigger streaks_set_updated_at
  before update on public.streaks
  for each row execute function public.set_updated_at();

-- ============================================================================
-- INTROSPECTION — run these first (separately) to see what already exists,
-- then compare against the tables above before trusting `create if not exists`.
-- ============================================================================
-- Columns:
--   select table_name, column_name, data_type, is_nullable, column_default
--   from information_schema.columns
--   where table_schema = 'public'
--     and table_name in ('profiles','affirmations','streaks')
--   order by table_name, ordinal_position;
--
-- RLS enabled?:
--   select relname, relrowsecurity
--   from pg_class
--   where relnamespace = 'public'::regnamespace
--     and relname in ('profiles','affirmations','streaks');
--
-- Policies:
--   select tablename, policyname, cmd, qual, with_check
--   from pg_policies
--   where schemaname = 'public'
--   order by tablename, policyname;
