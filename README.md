# SolbergFinance — Cloud Sync Update

This version adds Supabase authentication and cloud sync to the Next.js/PWA app.

## Added
- Email/password Supabase authentication
- Cloud-synced tasks
- Cloud-synced GMAT practice sessions
- Cloud-synced GMAT mock scores
- Cloud-synced saved finance stories
- Automatic one-time migration of existing browser tasks/user-created stories
- Existing Plan My Day, university assessment dashboard and PWA behaviour retained

## Required environment variables
These should already exist in Vercel:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

## Supabase tables
This version uses the tables already created by `supabase/schema.sql`:
- tasks
- gmat_sessions
- gmat_mocks
- finance_stories

## Deployment
Upload/commit these files to the root of GitHub repository `solbergfinance`.
Vercel should automatically create a new deployment.

## First login
1. Open the newly deployed app.
2. Choose "Need an account? Create one".
3. Use your email and a new app password.
4. If Supabase email confirmation is enabled, click the confirmation link in the email.
5. Sign in on both Mac and iPhone with the same account.

## Next development step
- Sync daily plans/preferences
- Add live Australian macro/M&A backend
- Scheduled morning briefing
- Push notifications
