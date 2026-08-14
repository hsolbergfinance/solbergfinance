# SolbergFinance / Henrik Finance OS

This is the Next.js App Router + PWA migration of the Finance OS prototype.

## Current features

- Responsive desktop and phone UI
- Installable PWA structure
- Your class timetable
- Plan My Day
- 35-minute commute assumption
- IB Interview Mode as Priority 0
- University assessment dates/weights
- GMAT 750+ countdown
- Finance briefing UI
- Local browser persistence for tasks/settings/stories
- Supabase starter schema for the next step

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build test

```bash
npm run build
```

## GitHub

Upload this project's **contents** to the root of the `solbergfinance` repository.

## Vercel

Once GitHub contains the project:

1. Vercel → Add New → Project
2. Import `solbergfinance`
3. Framework should auto-detect as Next.js
4. Leave root directory as `.`
5. Deploy

## Next step: Supabase

Do not add secrets to GitHub.

After the first deployment, we will:
1. create the Supabase project,
2. run `supabase/schema.sql`,
3. add Supabase environment variables to Vercel,
4. move localStorage data to cloud sync,
5. add authentication,
6. add the live Australian finance/M&A briefing backend.
