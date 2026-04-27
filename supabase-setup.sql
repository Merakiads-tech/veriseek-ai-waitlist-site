-- Run this ONCE in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

-- 1) waitlist_responses table (survey submissions)
create table if not exists public.waitlist_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text not null,
  q1_answer text,
  q2_answer text,
  q3_answer text,
  q4_answer text,
  q5_answer text,
  source text default 'waitlist_page'
);

-- 2) waitlist_emails table (hero / footer CTAs)
create table if not exists public.waitlist_emails (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text not null unique,
  source text
);

-- 3) Enable RLS on both
alter table public.waitlist_responses enable row level security;
alter table public.waitlist_emails   enable row level security;

-- 4) Public INSERT only (no SELECT for anon)
drop policy if exists "public insert responses" on public.waitlist_responses;
create policy "public insert responses" on public.waitlist_responses
  for insert to anon, authenticated
  with check (true);

drop policy if exists "public insert emails" on public.waitlist_emails;
create policy "public insert emails" on public.waitlist_emails
  for insert to anon, authenticated
  with check (true);
