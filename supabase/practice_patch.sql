-- Run this once in Supabase SQL Editor to add cloud-synced Practice history.
create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now(),
  subject text not null,
  topic text,
  difficulty text not null,
  practice_format text not null,
  question_text text not null,
  question_type text not null,
  selected_answer text,
  correct_answer text,
  is_correct boolean,
  self_rating integer,
  explanation text,
  question_payload jsonb
);

alter table public.practice_attempts enable row level security;

drop policy if exists "users own practice attempts" on public.practice_attempts;
create policy "users own practice attempts"
on public.practice_attempts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists practice_attempts_user_time_idx
on public.practice_attempts (user_id, attempted_at desc);
