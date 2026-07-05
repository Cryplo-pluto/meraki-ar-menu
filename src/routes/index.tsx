import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listMenuItems, listBranches, type MenuItem, type Branch } from "@/lib/menu.functions";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings.functions";
import { isRealAsset } from "@/lib/images";
import { formatKwacha } from "@/lib/format";
import { Marquee } from "@/components/Marquee";
import { NewsletterModal } from "@/components/NewsletterModal";
import { getQty, setQty, subscribe } from "@/lib/cart";
import { ArrowLeft, Box, MapPin, Minus, Plus, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async (): Promise<{ items: MenuItem[]; branches: Branch[]; settings: SiteSettings }> => ({
    items: await listMenuItems(),
    branches: await listBranches(),
    settings: await getSiteSettings(),
  }),
  head: () => ({
    meta: [
      { title: "Meraki Cafe Lusaka | Homemade Food, Cakes & Coffee — Rhodespark, Eastpark & Kabulonga" },
      { name: "description", content: "Meraki is Lusaka's home for homemade meals, decadent cakes and good coffee. Three branches — Rhodespark, Eastpark, Kabulonga. See every dish in true-scale AR before you order." },
      { property: "og:title", content: "Meraki Cafe Lusaka — Homemade Food, Cakes & Coffee" },
      { property: "og:description", content: "Three branches across Lusaka since 2008. See every dish in true-scale AR before you order." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  errorComponent: ({ error }) => <p className="container-page py-24">Could not load: {error.message}</p>,
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

// Category display labels — canonical printed-menu wording. Only shown when
// at least one real-photo item exists in that category.
const CATEGORY_LABEL: Record<string, string> = {
  "all-day-breakfast": "All Day Breakfast",
  burgers: "Burgers",
  sandwiches: "Sandwiches",
  wraps: "Wraps",
  salads: "Salads",
  bowls: "Healthy Bowls",
  pasta: "Pasta",
  mains: "Mains",
  coffee: "Coffees & Teas",
  "iced-coffee": "Iced Coffee",
  smoothies: "Smoothies",
  "summer-coolers": "Summer Coolers",
  mocktails: "Mocktails",
  juices: "Freshly Pressed Juices",
  milkshakes: "Milkshakes",
  drinks: "Sodas & Water",
  sweets: "Sweet Snacks",
  cakes: "Cakes",
  "pre-packs": "Pre-Packs",
};

function labelFor(slug: string) {
  return CATEGORY_LABEL[slug] ?? slug.replace(/-/g, " ");
}

function Home() {
  const data = Route.useLoaderData() as { items: MenuItem[]; branches: Branch[]; settings: SiteSettings };
  const { items, branches, settings } = data;
  const heroImg = isRealAsset(settings.hero_image_url) ? settings.hero_image_url : "";
  const story = settings.story_md.trim();

  const categories = useMemo(() => {
    const seen = new Map<string, MenuItem[]>();
    for (const it of items) {
      const arr = seen.get(it.category) ?? [];
      arr.push(it);
      seen.set(it.category, arr);
    }
    return Array.from(seen.entries()).map(([slug, list]) => ({ slug, list }));
  }, [items]);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const activeList = activeCat ? categories.find((c) => c.slug === activeCat)?.list ?? [] : [];

  return (
    <>
      {/* HERO — mint circle with rotating words + ORDER NOW.
          Photo hero swaps in when the owner uploads settings.hero_image_url. */}
      <Hero heroImg={heroImg} />

      <Marquee variant="solid" />

      {/* STORY BAND — giant pale MERAKI watermark, since 2008. */}
      <StoryBand story={story} />

      <Marquee variant="outline" />

      {/* OUR MENU — the order sheet. Category chips → row list with steppers. */}
      <OrderSheet
        categories={categories}
        activeCat={activeCat}
        setActiveCat={setActiveCat}
        activeList={activeList}
      />

      {/* LOCATIONS STRIP */}
      <section className="border-t border-[var(--charcoal)]/10 bg-[var(--mint-tint)]">
        <div className="container-page py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--charcoal)]/70">
                Three spots
              </p>
              <h2 className="mt-1 font-display text-4xl md:text-5xl">Find your Meraki</h2>
            </div>
            <Link to="/locations" className="text-sm font-semibold uppercase tracking-wider text-[var(--charcoal)] underline underline-offset-8">
              All locations →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {branches.map((b) => (
              <Link
                key={b.slug}
                to="/locations/$slug"
                params={{ slug: b.slug }}
                className="group rounded-2xl border border-[var(--charcoal)]/10 bg-[var(--paper)] p-6 warm-shadow transition hover:border-[var(--mint)]"
              >
                <MapPin className="h-5 w-5 text-[var(--mint)]" aria-hidden="true" />
                <h3 className="mt-3 font-display text-2xl">{b.name}</h3>
                {b.address && b.address !== "Address to be confirmed" && (
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{b.address}</p>
                )}
                <p className="mt-4 text-xs uppercase tracking-widest text-[color:var(--muted-foreground)]">
                  See branch details
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsletterModal />
    </>
  );
}

/* ---------- HERO ---------- */

function Hero({ heroImg }: { heroImg: string }) {
  const words = ["EXPERIENCE", "SIMPLE.", "FRESH.", "DELICIOUS."];
  return (
    <section className="relative overflow-hidden bg-[var(--mint-tint)]">
      {heroImg && (
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[var(--charcoal)]/40" aria-hidden="true" />
        </div>
      )}
      <div className="container-page relative flex min-h-[80dvh] flex-col items-center justify-center py-20">
        {/* Mint circle with rotating words */}
        <div
          className="relative grid h-72 w-72 place-items-center rounded-full bg-[var(--mint)] warm-shadow sm:h-96 sm:w-96"
          aria-hidden="true"
        >
          <span className="pointer-events-none absolute inset-4 rounded-full border border-[var(--charcoal)]/25" />
          <div className="text-center">
            <span style={{ fontFamily: "var(--font-script)" }} className="block text-6xl leading-none text-[var(--charcoal)] sm:text-7xl">
              Meraki
            </span>
            <span className="mt-4 block text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--charcoal)]/70">
              Cafe · since 2008
            </span>
            <div className="relative mt-4 h-6 sm:h-8">
              {words.map((w, i) => (
                <span
                  key={w}
                  className="absolute inset-x-0 font-display text-lg tracking-widest text-[var(--charcoal)] sm:text-2xl"
                  style={{
                    animation: `word-rotate 8s ${i * 2}s infinite`,
                    opacity: 0,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        <h1 className="sr-only">
          Meraki Cafe Lusaka — homemade food, cakes and coffee since 2008
        </h1>

        <Link
          to="/menu"
          className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--charcoal)] px-8 py-3 text-sm font-bold uppercase tracking-widest text-[var(--cream)] hover:bg-[var(--charcoal)]/90"
        >
          Order now
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

/* ---------- STORY ---------- */

function StoryBand({ story }: { story: string }) {
  return (
    <section className="relative overflow-hidden bg-[var(--cream)] py-24">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 text-center font-display text-[18vw] font-bold leading-none tracking-tighter text-[var(--charcoal)]/[0.05]"
      >
        MERAKI
      </span>
      <div className="container-page relative mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">—— Since 2008</p>
        <h2 className="mt-4 font-display text-5xl md:text-6xl">
          Simple. Fresh. Delicious.
        </h2>
        {story ? (
          <p className="mt-6 whitespace-pre-line text-lg text-[color:var(--muted-foreground)]">
            {story}
          </p>
        ) : (
          <p className="mt-6 text-lg text-[color:var(--muted-foreground)]">
            Welcome to Meraki — where every plate is cooked with soul and every cake is baked
            with love. Three branches across Lusaka, one home-cooked promise.
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/about"
            className="min-h-11 rounded-full border-2 border-[var(--charcoal)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--charcoal)] hover:bg-[var(--charcoal)] hover:text-[var(--cream)]"
          >
            About Meraki
          </Link>
          <Link
            to="/catering"
            className="min-h-11 rounded-full bg-[var(--mint)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--charcoal)] hover:brightness-95"
          >
            Get a quote
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- ORDER SHEET ---------- */

type Cat = { slug: string; list: MenuItem[] };

function OrderSheet({
  categories,
  activeCat,
  setActiveCat,
  activeList,
}: {
  categories: Cat[];
  activeCat: string | null;
  setActiveCat: (v: string | null) => void;
  activeList: MenuItem[];
}) {
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    const bump = () => {
      let n = 0;
      for (const it of activeList) n += getQty(it.slug);
      setCartCount(n);
    };
    bump();
    return subscribe(bump);
  }, [activeList]);

  return (
    <section id="menu" className="container-page py-20">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">Order sheet</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Our Menu</h2>
        <p className="mx-auto mt-3 max-w-xl text-[color:var(--muted-foreground)]">
          Explore our delicious selection of dishes and treats — every item shows in true-scale AR before you order.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-dashed border-[var(--charcoal)]/20 bg-[var(--mint-tint)]/40 p-10 text-center">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Our full menu with real photos is being uploaded — check back very soon.
          </p>
        </div>
      ) : activeCat === null ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActiveCat(c.slug)}
              className="group rounded-2xl border border-[var(--charcoal)]/10 bg-[var(--paper)] p-5 text-left transition hover:border-[var(--mint)] hover:bg-[var(--mint-tint)]"
            >
              <span className="block text-xs font-semibold uppercase tracking-widest text-[var(--mint)]">
                {c.list.length} item{c.list.length === 1 ? "" : "s"}
              </span>
              <span className="mt-2 block font-display text-xl text-[var(--charcoal)] group-hover:text-[var(--charcoal)]">
                {labelFor(c.slug)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-[var(--charcoal)]/10 bg-[var(--paper)] p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveCat(null)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[var(--charcoal)] hover:bg-[var(--mint-tint)]"
              aria-label="Back to categories"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <h3 className="font-display text-2xl md:text-3xl">{labelFor(activeCat)}</h3>
            <Link
              to="/order"
              className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--mint)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--charcoal)] hover:brightness-95 ${cartCount === 0 ? "opacity-60" : ""}`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Checkout
            </Link>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeList.map((it) => (
              <OrderRow key={it.slug} item={it} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function OrderRow({ item }: { item: MenuItem }) {
  const [qty, setQtyState] = useState(0);
  useEffect(() => {
    setQtyState(getQty(item.slug));
    return subscribe(() => setQtyState(getQty(item.slug)));
  }, [item.slug]);

  const detailHref = `/menu/${item.category}/${item.slug}`;
  const arHref = `${detailHref}?ar=1`;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-[var(--charcoal)]/10 bg-[var(--cream)]/40 p-3">
      <div className="flex items-start gap-3">
        <Link
          to="/menu/$category/$slug"
          params={{ category: item.category, slug: item.slug }}
          className="block h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--mint-tint)]"
          aria-label={`View ${item.name}`}
        >
          <img
            src={item.image_url}
            alt={item.image_alt || item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              to="/menu/$category/$slug"
              params={{ category: item.category, slug: item.slug }}
              className="truncate font-display text-lg leading-tight text-[var(--charcoal)] hover:underline"
            >
              {item.name}
            </Link>
            <span className="shrink-0 font-display text-lg text-[var(--charcoal)]">
              {formatKwacha(item.price_kwacha)}
            </span>
          </div>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[color:var(--muted-foreground)]">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* View in AR — required under EVERY food image (§6) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href={arHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[var(--charcoal)] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--charcoal)] hover:bg-[var(--charcoal)] hover:text-[var(--cream)]"
          aria-label={`View ${item.name} in augmented reality on your table`}
        >
          <Box className="h-3.5 w-3.5" aria-hidden="true" />
          View in AR
        </a>

        <div
          className="flex items-center gap-1 rounded-full bg-[var(--paper)] p-1 warm-shadow"
          role="group"
          aria-label={`Quantity of ${item.name}`}
        >
          <button
            type="button"
            onClick={() => setQty(item, qty - 1)}
            disabled={qty === 0}
            className="grid h-9 w-9 place-items-center rounded-full text-[var(--charcoal)] hover:bg-[var(--mint-tint)] disabled:opacity-40"
            aria-label={`Remove one ${item.name}`}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            className="min-w-6 text-center text-sm font-bold tabular-nums text-[var(--charcoal)]"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty(item, qty + 1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-[var(--mint)] text-[var(--charcoal)] hover:brightness-95"
            aria-label={`Add one ${item.name}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}
