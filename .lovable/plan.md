# Meraki Cafe — Build Plan

This is a large production site. I'll ship it in **4 phases within this project**, each verifiable in the preview. Phase 1 goes in now; I'll pause between phases so you can review and redirect.

Before I start I have three quick things to confirm — see the questions after this plan.

---

## Phase 1 — Foundations + AR core (this turn)

**Backend (Lovable Cloud / Supabase)**
- Enable Cloud. Migrations for: `size_classes`, `menu_items`, `branches`, `cake_builder_options`, `orders`, `order_items`, `site_settings` (socials, hours override), `user_roles` (+ `has_role` fn, `app_role` enum with `admin`/`staff`).
- RLS: public SELECT on menu/cakes/branches/size_classes/cake_builder_options; admin-only write. Orders: insert by anyone (guest checkout), select/update by staff+admin.
- Storage buckets: `menu-images`, `ar-models` (public read).
- Seed: 3 branches (Rhodespark, Eastpark, Kabulonga), 6 size-class placeholders, 6 categories × 4 items, 8 cakes, cake-builder options. All items reference a size-class placeholder GLB/USDZ so **every item has working AR on day one**.

**Design system**
- Extract Meraki palette (warm creams/browns/greens) into `src/styles.css` as oklch tokens: `--background` cream, `--primary` deep green, `--accent` warm terracotta, `--foreground` rich brown. Scrim tokens for photo overlays. Focus-ring token.
- Typography: display serif (Fraunces) + body sans (Nunito Sans) via `<link>` in `__root.tsx`.
- Custom shadcn Button variants: `hero`, `ar` (pill w/ cube icon, min-h-11), `ghost-warm`.
- `prefers-reduced-motion` global rule.

**AR system**
- Install `@google/model-viewer`, `three`, `qrcode`.
- `<ArViewer>` component: dynamic-imports model-viewer, `ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed"`, poster, custom slotted "View in AR" button, fallback ladder (AR → 3D spin → photo+dimensions_label).
- `?ar=1` deep link auto-triggers `activateAR()`.
- Placeholder GLB/USDZ per size class (I'll generate simple neutral discs/blocks at true meter dimensions with three.js and upload to the `ar-models` bucket via a one-shot script, or ship data-URI stub GLBs if generation fails — either way every item resolves).

**Routes & content (Phase 1 scope)**
- `/` Home with signature dishes strip (AR-enabled cards), locations strip, cakes teaser, story block.
- `/menu`, `/menu/$category`, `/menu/$category/$slug` — grids + detail w/ AR viewer, dimensions_label, allergens, branch availability.
- `/cakes`, `/cakes/$slug`.
- `/locations`, `/locations/$slug`.
- `/ar` explainer.
- `__root.tsx`: header, footer, HeadContent, sitewide meta, JSON-LD Restaurant.
- Per-route `head()` with unique title/description/OG + JSON-LD (MenuItem/Product per detail).
- `sitemap.xml` server route reading from Supabase; `robots.txt`; `llms.txt`.

**A11y & perf baseline**
- Semantic HTML, one H1/page, 44px targets, aria-labels, focus rings, alt from `image_alt`.
- Lazy model-viewer, responsive images.

## Phase 2 — Ordering, cake builder, popup, admin scaffold
- `/cake-builder` stepper, `/order` cart+checkout (Mobile Money / Card stubs), `/order/confirmed`.
- Newsletter popup (30s / exit-intent, focus-trapped, never on load).
- Cart state (Zustand), aria-live announcements.
- `/admin` login + dashboard shell (menu CRUD, price/availability toggles, order list by branch).

## Phase 3 — Admin depth + QR + Table Planner
- Admin: image/GLB/USDZ upload, branch hours editor, socials editor, per-branch availability, QR PNG download per item.
- `/table-planner` three.js scene with add-multiple items at true relative scale.
- `/catering`, `/about`.

## Phase 4 — Polish
- Prerender pass, Lighthouse tuning, SEO audit fixes, additional JSON-LD (LocalBusiness per branch), OG image generation for detail pages.

---

## Technical notes
- TanStack Start (project default). Public routes SSR-on; admin under `_authenticated/`.
- Menu reads via public server fn using publishable-key server client + `TO anon` SELECT policies (loader-safe on public routes).
- Admin writes via `requireSupabaseAuth` + `has_role(_,'admin')` check.
- Prices stored as integer kwacha; formatted `K450`.
- Slugs unique; no IDs in URLs.
- Placeholder GLB approach: I'll generate minimal binary GLB files (a colored cylinder/box sized in meters) with a small node script and upload to Storage during seeding. USDZ is harder to author programmatically — for iOS I'll ship a shared reference USDZ per size class using a pre-authored minimal file (fetched from a public CDN reference or generated via `three` + a USDZ exporter). If USDZ generation blocks, iOS falls to the 3D spin fallback until real scans arrive, and the button still appears everywhere.

## Out of scope (per your spec)
Real payments, real SMS, photogrammetry, Yango API, i18n.

---

**Please confirm the questions after this plan, then I'll ship Phase 1.**