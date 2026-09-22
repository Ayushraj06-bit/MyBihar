# MyBihar — हमार बिहार

> A state, shot like a film.

MyBihar is a community-built guide to Bihar: its places, its transport, its news and its markets,
gathered in one place and presented like a title sequence — cinematic bands, Devanagari that
carries the weight, one crimson mark, and a countdown to the day everyone comes home for Chhath.
Every place, festival, photograph, emblem, icon and line of copy here is Bihar's own.

<p align="center">
  <img src="frontend/public/micon.png" alt="The Mithila sun mark on a genda disc" width="96" />
</p>

## What is in it

| Route | What it does |
|---|---|
| `/home` | The week in Bihar: the paper (Prabhat Khabar), a city story and a sports story chosen by the editorial pipeline, and the marketplace — Bhagalpuri silk, Silao khaja, Madhubani on paper. |
| `/places`, `/near-you` | Explore: cafés, food, culture and outdoors across the state on a live Ola map, from Fraser Road to Bodh Gaya. Falls back to a seeded catalogue without a database. |
| `/chhath` | The countdown to Nahay Khay (13 November 2026), the four days, the four regions of the state — Magadh, Mithila, Bhojpur, Anga — and the Patna ghats nearest you. |
| `/tinder` | Experiences: swipe through Golghar, the Mahabodhi Temple, Nalanda, Dr. Rajendra Prasad, Patna Sahib and Sher Shah's tomb. |
| `/transport` | Patna Metro, trains out of Patna Junction, autos and cabs, ferries on the Ganga. |
| `/contribute` | A public story wall, one day at a time, plus the communities — GDG Patna, HackSlash, Patna se hai. |
| `/brand-kit` | The live design system: tokens, the Mithila sun, the Chhath emblems, the icon set, motion. |
| `/ghat-still` | The drawn Sandhya Arghya scene on its own. |

## The design system

The design bible is [`docs/DESIGN.md`](docs/DESIGN.md). In short:

- **Colour** — a cool three-step black, Crimson Silk on a strict budget, and **Genda Yellow** (the
  marigold on the daura, the thekua) as the one warm accent.
- **Type** — Clear Sans, Regular only, so hierarchy comes from size and colour; **Noto Sans
  Devanagari** (variable) for Hindi, Bhojpuri and Maithili, which is where the type gets loud.
- **The mark** — the Chhath sun as a Madhubani painter draws it: a red disc with filled petal-rays,
  flanked by two kohbar vines. Filled, never outlined.
- **Emblems** — surya, soop, thekua, daura, ikh, lotus, diya, kalash, machhli, mor, bodhi leaf.
- **Icons** — the Setu, Patna Metro, the shared auto, the cycle rickshaw, Golghar, a Patna City
  haveli, a Ganga boat, chai in a kulhad, litti chokha, Khuda Bakhsh Library.
- **The countdown** — a drawn ghat at dusk: the sun low over the Ganga, its road of light on the
  water, steps with diyas, sugarcane leaning in. Every date lives in `frontend/lib/chhath.ts`.

Photographs are from Wikimedia Commons under free licences; see [`docs/photo-credits.md`](docs/photo-credits.md).

## Quick start

The production frontend lives in [`frontend/`](frontend/).

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in Supabase, and optionally Ola Maps + Anakin
npm run dev
```

The app runs without a database: Explore uses the file catalogue and every catalogue page
(regions, ghats, transport, experiences, marketplace, communities) serves `prisma/seed-data.mjs`.
For the full thing, point `DATABASE_URL` at Postgres and:

```bash
npm run db:push
npm run db:seed
```

## Signing in

Accounts live in a Supabase project, and Google is the only door. Two ways in:

**Just looking (no project).** Put this in `frontend/.env.local` and start `npm run dev`:

```
NEXT_PUBLIC_AUTH_DEV_BYPASS=true
```

Every visitor is one fixed local account. It only works under the dev server — `next build`
ignores it — so it cannot leak into a deployment.

**Real accounts.** Create a free project at supabase.com, then in the dashboard:

1. *Authentication → Providers → Google*: enable it, paste a Google OAuth client id and secret
   (Google Cloud Console → APIs & Services → Credentials → OAuth client, type "Web application",
   with `https://<your-project>.supabase.co/auth/v1/callback` as the authorised redirect URI).
2. *Authentication → URL configuration*: add `http://localhost:3000/auth/callback` to the redirect
   URLs (and your deployed origin later).
3. *Project settings → API*: copy the project URL and the publishable key into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Remove `NEXT_PUBLIC_AUTH_DEV_BYPASS`, restart, and the Google button on `/login` does the rest.

For a production build:

```bash
npm run build
npm start
```

## Available scripts

Run these from `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and create a production build |
| `npm start` | Serve the production build |
| `npm test` | Run the domain, catalogue, brand-compliance, news and map contract tests (173) |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:seed` | Seed the catalogue tables with the Bihar data |

## Docs

- [`docs/DESIGN.md`](docs/DESIGN.md) — the design system
- [`docs/news.md`](docs/news.md) — how the Home news cards are chosen: relevance, events (Chhath,
  Sonepur Mela, Pustak Mela, Patna Pirates), rotation
- [`docs/contribute.md`](docs/contribute.md) — the story wall
- [`docs/photo-credits.md`](docs/photo-credits.md) — every photograph and its licence
- [`db/schema.sql`](db/schema.sql) — the schema for a fresh Supabase project
