create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  birth_date date null,
  tracking_type text null,
  unit_preference text not null default 'mg/dL',
  target_min numeric not null default 70,
  target_max numeric not null default 180,
  uses_insulin text null,
  uses_medication text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.glucose_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric not null,
  unit text not null,
  measured_at timestamptz not null,
  context text,
  mood text,
  note text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  time text,
  days text[],
  context text,
  enabled boolean not null default true,
  notification_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text,
  file_url text null,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_user_id_unique_idx on public.profiles(user_id);
create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists glucose_readings_user_id_idx on public.glucose_readings(user_id);
create index if not exists glucose_readings_user_measured_at_idx on public.glucose_readings(user_id, measured_at desc);
create index if not exists reminders_user_id_idx on public.reminders(user_id);
create index if not exists ai_insights_user_id_idx on public.ai_insights(user_id);
create index if not exists ai_insights_user_created_at_idx on public.ai_insights(user_id, created_at desc);
create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists reports_user_created_at_idx on public.reports(user_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_glucose_readings_updated_at on public.glucose_readings;
create trigger set_glucose_readings_updated_at
before update on public.glucose_readings
for each row execute function public.set_updated_at();

drop trigger if exists set_reminders_updated_at on public.reminders;
create trigger set_reminders_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.glucose_readings enable row level security;
alter table public.reminders enable row level security;
alter table public.ai_insights enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "glucose_readings_select_own" on public.glucose_readings;
create policy "glucose_readings_select_own"
on public.glucose_readings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "glucose_readings_insert_own" on public.glucose_readings;
create policy "glucose_readings_insert_own"
on public.glucose_readings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "glucose_readings_update_own" on public.glucose_readings;
create policy "glucose_readings_update_own"
on public.glucose_readings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "glucose_readings_delete_own" on public.glucose_readings;
create policy "glucose_readings_delete_own"
on public.glucose_readings
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own"
on public.reminders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own"
on public.reminders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own"
on public.reminders
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own"
on public.reminders
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "ai_insights_select_own" on public.ai_insights;
create policy "ai_insights_select_own"
on public.ai_insights
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "ai_insights_insert_own" on public.ai_insights;
create policy "ai_insights_insert_own"
on public.ai_insights
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "ai_insights_update_own" on public.ai_insights;
create policy "ai_insights_update_own"
on public.ai_insights
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ai_insights_delete_own" on public.ai_insights;
create policy "ai_insights_delete_own"
on public.ai_insights
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
on public.reports
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
on public.reports
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "reports_update_own" on public.reports;
create policy "reports_update_own"
on public.reports
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "reports_delete_own" on public.reports;
create policy "reports_delete_own"
on public.reports
for delete
to authenticated
using (auth.uid() = user_id);
