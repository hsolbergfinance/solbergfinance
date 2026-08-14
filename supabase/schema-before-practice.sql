-- We will run this in Supabase after the first Vercel deployment.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  task_date date not null,
  minutes integer not null default 60,
  priority integer not null default 3,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.gmat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  section text not null,
  questions integer not null,
  correct integer not null,
  minutes integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.gmat_mocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mock_date date not null,
  total_score integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  relevance integer not null default 5,
  headline text not null,
  summary text,
  why_it_matters text,
  deep_dive text,
  source_label text,
  source_url text,
  story_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
alter table public.gmat_sessions enable row level security;
alter table public.gmat_mocks enable row level security;
alter table public.finance_stories enable row level security;

create policy "users own tasks"
on public.tasks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own gmat sessions"
on public.gmat_sessions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own gmat mocks"
on public.gmat_mocks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own finance stories"
on public.finance_stories for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
