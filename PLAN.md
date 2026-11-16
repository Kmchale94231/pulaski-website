# Pulaski Website — Plan

Self-hosted beat store: listeners play 30s previews, buy a license, get a download link + license PDF by email.
Built in-house to avoid BeatStars/Airbit monthly fees, so running costs should stay near $0 at small scale.

## Decisions

| Area | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript, Tailwind CSS |
| Hosting | Vercel Hobby (free) for now. Hobby is non-commercial only: decide on Pro ($20/mo) or Netlify free before taking real sales |
| Database, admin login, previews | Supabase (free tier): Postgres for beats/orders, Auth for the admin, Storage for 30s previews + cover art |
| Full files (MP3 / WAV / stems) | Google Drive. Admin uploads them to Drive by hand and pastes three share links per beat (MP3, WAV, stems); the email sends the links the bought tier includes |
| Payments | PayPal Checkout (Orders API: server creates the order at our price, buyer approves in PayPal's popup, server captures) |
| Delivery | After a successful capture → email (Resend) with the Drive link for the bought tier + filled license PDF |
| Player | Native `<audio>`, persistent bottom bar |

## Pages

- **Public:** beat list (play preview, license picker, buy), beat detail, licensing info, checkout success.
- **Admin (login required):** add/edit/delete beats, cut + upload preview, paste Drive links, set prices, see orders, mark sold.

## Rules

- **Admin access:** public sign-ups disabled in Supabase; admin pages also check the admin email, kept in the `ADMIN_EMAIL` env var (not in the repo). Row-level security: public can only read unsold beats.
- **Exclusive:** buying it removes the beat from the store and blocks further leases. Before capturing an exclusive payment, the server marks the beat sold in one atomic update (`... where id = $1 and not sold`); if no row changed, it doesn't capture, so the buyer is never charged. If the capture then fails, it un-marks the beat. This path gets a test.
- **Orders:** store each PayPal order ID once (unique column) so a double-click or retry can't create two orders or two emails.
- **Keep-alive:** a daily scheduled ping (Vercel Cron or GitHub Actions) so Supabase's free project is never paused for inactivity.
- **License PDF:** one template per tier, filled with buyer name, beat title, date. Contract text supplied later.
- **Previews:** 30s, voice tag already in the audio. Admin picks the tagged MP3 and a start time; the admin page cuts the clip in the browser by slicing the MP3's bytes (no library, no re-encode; switch to ffmpeg.wasm only if VBR files come out the wrong length). Only the small clip is uploaded, so it stays under Vercel's request size limit.

## License tiers

| Tier | Price | Files | Copies | Streams | Music videos | Live shows | Radio |
|---|---|---|---|---|---|---|---|
| Standard | $29.99 | MP3 | 10,000 | 250,000 | 0 | Non-profit only (unlimited) | No |
| Premium (WAV) | $59.99 | WAV, MP3 | 100,000 | 1,000,000 | 0 | For-profit | No |
| Premium + WAV Stems | $99.99 | WAV, MP3, stems | 100,000 | 2,000,000 | 1 | For-profit | Unlimited stations |
| Unlimited + WAV Stems | $199.99 | WAV, MP3, stems | Unlimited | Unlimited | Unlimited | For-profit | Unlimited stations |
| Exclusive | $1,000.00 | WAV, MP3, stems | Unlimited | Unlimited | Unlimited | For-profit | Unlimited stations |

All tiers: used for music recording. Exclusive also removes the beat from sale.
Prices are the same for every beat, so they live in one place in the code (in cents), not per beat in the database.
Checkout: one beat + one tier per purchase, no cart. Stripe only (no PayPal for now).

## Known limits

- Drive "anyone with the link" folders can be forwarded by a buyer. Accepted: the license agreement is the protection, and unlicensed use can be enforced by copyright claim.
- Supabase free storage: 1 GB / 5 GB egress per month. Fine for 30s previews (~1 MB each); move previews to Cloudflare R2 if plays outgrow it.

## Workflow

- Git + GitHub. `main` = production; every branch gets a Vercel preview URL.
- PayPal sandbox until launch. Secrets in `.env.local` / Vercel env vars, never committed.

## Open questions

- [ ] Are delivered files untagged?
- [ ] Contract PDFs (one per tier).
- [ ] Guest checkout only, or buyer accounts?
- [ ] Catalog size and filters (BPM, key, genre, mood, search).
- [ ] Extra pages (contact, email signup, sound kits)?
- [ ] Domain, brand name, logo/colors.
