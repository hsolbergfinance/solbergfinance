# SolbergFinance V5 — AI Practice

This update adds a mobile-first **Practice** page to the working Supabase cloud-sync version.

## New Practice page

- Subjects: Calculus 1, Mathematical Economics, Time Series, Algorithmic Trading, IB Technical and GMAT.
- Topic presets based on the course/interview scope already built into Finance OS.
- Difficulty: Current course, Exam level, Stretch.
- Formats: Multiple choice, Open/interview style, Mixed.
- Session lengths: 3-question Tram Mini, 5-question Quick Set, 8-question Longer Set.
- One-question-at-a-time phone UI.
- Hints, explanations and ideal answers.
- MCQs auto-grade.
- Open questions can be answered aloud/in your head and self-rated as Missed / Partial / Strong.
- Practice history syncs through Supabase.
- The API route verifies the user's Supabase access token before it will spend AI API usage.

## Required setup — 1: Supabase

Before using cloud practice history, run only this file in Supabase SQL Editor:

`supabase/practice_patch.sql`

It adds the `practice_attempts` table and Row Level Security policy.

## Required setup — 2: OpenAI API

AI generation runs server-side through `app/api/practice/route.ts`. The browser never receives the secret API key.

Add this Vercel environment variable:

`OPENAI_API_KEY`

Use an OpenAI Platform API key. Do not prefix it with `NEXT_PUBLIC_` and do not commit it to GitHub.

Optional:

`OPENAI_PRACTICE_MODEL=gpt-5-mini`

If the optional variable is omitted, the route defaults to `gpt-5-mini`.

After adding environment variables, redeploy Vercel.

## Deploy

1. Run `supabase/practice_patch.sql` in Supabase.
2. Add `OPENAI_API_KEY` in Vercel Project Settings → Environment Variables.
3. Upload the contents of this folder to the root of GitHub `solbergfinance`.
4. Commit to `main`.
5. Vercel will redeploy automatically.

## Security

- `OPENAI_API_KEY` is server-only.
- `/api/practice` requires a valid Supabase user access token.
- Practice attempts are protected by RLS (`auth.uid() = user_id`).
- The Responses API call uses `store: false`.

## Next improvements

- Automatically weight generated questions toward weak topics.
- Spaced repetition / re-test missed concepts.
- Let the user upload current lecture notes so questions are grounded directly in weekly material.
- Add voice-answer practice for IB interview questions.
- Build the live Australian finance-news ingestion pipeline.
