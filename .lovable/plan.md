## Demo Prep Pass — Scope

This is a big batch (image sourcing, seed data, hero 3D, interactive cards, polish). I'll ship it in one focused pass, but calling out the shape first so you can redirect before I spend the tokens.

### 1. Image sourcing (relax truth-guard for demo)
- Add `DEMO_MODE` flag in `site_settings` (default `true`). When on, `isRealAsset` also accepts curated `images.unsplash.com` and `images.pexels.com` URLs from an allowlist helper.
- Seed every menu item with a matched 4:3 stock photo (warm, homely, no text/people). Alt text = generic dish description.
- Homepage hero: bright plant-filled cafe interior stock.
- Gallery: 8–12 matched stock food/interior shots.

### 2. Seed data (SQL migration)
- Full printed-menu dataset (categories, items, prices, descriptions, size_class links).
- 3 branches with the phones/hours/addresses currently shown on meraki.co.zm, "Since 2008" tagline on About.
- 3 sample approved reviews flagged `is_sample=true` (schema add). Admin shows a "sample — replace" badge.
- Cake builder options seeded.
- Sandbox checkout already works; verify order lands in inbox.

### 3. Hero AR items (photoreal)
- Add `is_hero` flag on `menu_items`. Mark: Meraki Beef Burger, Black Forest slice, whole celebration cake, Chicken Wings, Cappuccino, Pizza platter, Strawberry Milkshake.
- Ship an admin "Upload GLB" flow (already have ar-models bucket). Add a scale-normalize server fn: read GLB bbox, uniform-scale to size_class target width, re-upload.
- For the demo I will NOT hunt/download third-party GLBs myself (license verification per-file is your call) — the flow is wired so you or the owner drops files in during setup. Non-hero items keep size-class reference GLB fallback (already working).

### 4. Desktop interactive 3D cards
- New `<InteractiveModelCard>`: photo by default with a "3D" chip; click swaps to inline `<model-viewer camera-controls auto-rotate-delay="0" poster={photo}>`. Esc or chip returns to photo. Model only loads on toggle.
- Used on `MenuCard` and menu item detail pages.
- Hero item detail pages default to 3D view with a "Photo" toggle.
- Mobile: "View in AR" stays primary; 3D chip still available.

### 5. Polish
- Footer: single line "Concept build by [AGENCY NAME]" (placeholder link — tell me the agency name + URL and I'll wire it).
- New `/credits` route: lists image sources + 3D model attributions (pulled from a `credits` table or static list).
- New `/pitch` route (unlinked, `noindex`): one-screen summary + QR code (using `qrcode` lib) pointing to `/menu?ar=1&item=<hero-slug>`.
- Lighthouse-friendly: lazy-load stock images, `loading="lazy"`, preconnect to unsplash CDN.

### Technical notes
- Migrations: add `is_hero boolean`, `is_sample boolean` (reviews), `demo_mode boolean` in site_settings, `credits` table.
- New files: `src/lib/demo-images.ts`, `src/components/InteractiveModelCard.tsx`, `src/routes/credits.tsx`, `src/routes/pitch.tsx`, `src/lib/glb-normalize.functions.ts`.
- Edited: `src/lib/images.ts` (demo-mode allowlist), `MenuCard.tsx`, `Footer.tsx`, `index.tsx`, `menu.$category.$slug.tsx`, seed migration.

### Two things I need from you before I start
1. **Agency name + URL** for the footer line.
2. Confirm: I use curated Unsplash/Pexels URLs directly (fastest, keeps repo small) rather than mirroring each into Supabase storage on seed. Mirroring can be a later admin action.

Say "go" (or answer the two) and I'll execute end-to-end.