# SolbergFinance — IB mode + deep-dive fix

This update is based on the working Supabase cloud-sync version.

## Fixed

### IB Interview Mode
- Button now describes the action: **Mark interview complete** / **Resume IB prep**.
- The preference is stored in Supabase Auth user metadata, so it follows the signed-in account across devices.
- Marking the interview complete removes the auto-generated future/current `IB technical interview prep` task.
- It removes IB blocks from today's generated timeline.
- `Plan My Day` no longer inserts any IB blocks when interview mode is off.
- IB blocks are now scheduled around classes instead of creating the previous 8:00 AM overlap.
- The interview-mode control remains visible on mobile.

### Finance-news Deep Dive
- Deep Dive now opens a full-screen analysis panel instead of revealing one sentence.
- It includes: What happened, IB significance, transaction/valuation/market mechanics, category-specific interview questions, source and source link.
- Placeholder/template briefing cards are now clearly labelled as templates so they are not mistaken for live news.

## Important

This fixes the deep-dive experience, but automated live-news ingestion is still a separate backend step. The current starter cards are intentionally labelled **Template / Live feed pending**.

## Deploy
Upload the contents of this folder to the root of the GitHub `solbergfinance` repo and commit to `main`. Vercel should redeploy automatically.
