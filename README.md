# Meraki AR Menu

A look-alike of [meraki.co.zm](https://www.meraki.co.zm/) with a true-scale **AR menu**: every dish can be placed on your own table with a phone camera (iOS Quick Look / Android Scene Viewer) — no app install needed. Includes online ordering (cart), a custom cake builder, catering requests, quote requests, reviews, and a table planner.

**Stack:** React 19 · TanStack Start (SSR) · Vite 8 · Tailwind CSS 4 · Supabase (database + storage) · `@google/model-viewer` for AR.

---

## Running on a new machine

### 1. Prerequisites

- **Node.js 20 or newer** (`node --version` to check) — https://nodejs.org
- **Git**

### 2. Get the code

```sh
git clone https://github.com/Cryplo-pluto/meraki-ar-menu.git
cd meraki-ar-menu
npm install
```

(If you received the project as a **zip** instead: unzip it, then run `npm install` inside the folder — `node_modules` is never included in the zip.)

### 3. Create your `.env`

Secrets are **not** in the repo. Copy the template and fill it in:

```sh
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Then open `.env` and fill in the values. Each one is explained below.

### 4. Run it

```sh
npm run dev
```

Open **http://localhost:8080** — that's it.

---

## Where every key / token / URL lives

| Variable                                                     | What it is                                                                  | Where to get it                                                                                                                        |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL` / `VITE_SUPABASE_URL`                         | Your database's API address                                                 | `https://lbmrywnejlrmmcnehnya.supabase.co` (fixed for this project)                                                                    |
| `SUPABASE_PROJECT_ID` / `VITE_SUPABASE_PROJECT_ID`           | The project reference                                                       | `lbmrywnejlrmmcnehnya` (fixed for this project)                                                                                        |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key (safe in the browser)                                        | [Supabase Dashboard](https://supabase.com/dashboard/project/lbmrywnejlrmmcnehnya) → Project Settings → API Keys → `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` _(optional)_                     | Admin key — bypasses all security. Only needed for admin GLB model uploads. | Same page → secret keys. **Never** put this in client code or share it.                                                                |
| `SUPABASE_ACCESS_TOKEN` _(optional)_                         | Lets the Supabase CLI manage the project                                    | https://supabase.com/dashboard/account/tokens                                                                                          |
| `SUPABASE_DB_PASSWORD` _(optional)_                          | Direct database password, needed for `supabase db push`                     | Set at project creation; reset via Dashboard → Project Settings → Database                                                             |

**Rules of thumb:**

- `.env` is gitignored and must stay that way. Move it between machines by USB stick or a password manager — never by email, chat, or git.
- The `VITE_*` variables are shipped to the browser; that's fine — they're the _publishable_ values. Everything without the `VITE_` prefix stays on the server.
- If a token/key ever leaks, revoke it in the Supabase dashboard and generate a new one.

The Supabase project itself lives under the **"Yange"** organisation of your Supabase account (project name `meraki-cafe`, region `eu-central-1`).

---

## Commands

| Command            | What it does                                                 |
| ------------------ | ------------------------------------------------------------ |
| `npm run dev`      | Start the dev server at http://localhost:8080                |
| `npm run build`    | Production build (outputs to `.output/`, targets Cloudflare) |
| `npm run preview`  | Serve the production build locally                           |
| `npm run lint`     | Check code style                                             |
| `npm run format`   | Auto-format code                                             |
| `npx tsc --noEmit` | Type-check without building                                  |

---

## Database (Supabase)

The full schema lives in this repo as SQL files under [`supabase/migrations/`](supabase/migrations/) — the database can always be rebuilt from scratch from them. To change the database:

1. Add a new file: `supabase/migrations/<YYYYMMDDHHMMSS>_short_name.sql`
2. Apply it:
   ```sh
   npx supabase db push
   ```
   (needs `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` in `.env`; the CLI reads them automatically)

On a brand-new Supabase project you would instead run `npx supabase link --project-ref <ref>` once, then `npx supabase db push --include-all`.

**Never edit an already-applied migration** — always add a new one.

Tables: `menu_items`, `branches`, `size_classes`, `cake_builder_options`, `site_settings`, `reviews`, `orders`, `order_items`, `contact_messages`, `catering_requests`, `quote_requests`, `user_roles`. Guest-facing forms (contact / catering / quote / reviews / orders) allow public _inserts_ only; reading submissions requires a staff/admin role.

---

## Project layout

```
src/
  routes/          One file per page (TanStack file-based routing)
  components/      Shared UI (Header, Footer, MenuCard, ...)
  lib/             Server functions (*.functions.ts talk to Supabase), cart, utils
  integrations/    Supabase client setup
supabase/
  migrations/      The entire database schema + seed data as SQL
public/images/     Local images (logo, etc.)
```

Key detail: pages call **server functions** in `src/lib/*.functions.ts` — the browser never talks to Supabase directly for data; only the publishable key is ever exposed.

---

## Deploying

`npm run build` produces a Cloudflare Workers-ready bundle (`.output/`), deployable with `npx nitro deploy --prebuilt` or via the Cloudflare dashboard. Remember to set the same six required environment variables in your hosting provider's settings — the `.env` file only works locally.
