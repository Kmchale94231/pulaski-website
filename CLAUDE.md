@AGENTS.md

# Working on this project

- Read `PLAN.md` first: decisions, rules, license tiers and open questions live there. Update it when a decision changes.
- Keep code and running costs minimal (ponytail plugin rules): smallest complete change, no dependency for a few lines, free tiers first. The site was self-built to avoid BeatStars/Airbit monthly fees, so flag anything that adds a monthly bill before choosing it.
- Database changes go in a new numbered file in `supabase/` that the owner runs in the Supabase SQL Editor.
- Secrets live in `.env.local` (not in git) and in Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ADMIN_EMAIL`.
- Pushing to `main` deploys to Vercel. Check with `npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run build` before pushing.
