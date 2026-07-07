import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { listMenuItems, listBranches, type MenuItem, type Branch } from "@/lib/menu.functions";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings.functions";
import { listApprovedReviews, type Review } from "@/lib/reviews.functions";
import { isRealAsset } from "@/lib/images";
import { formatKwacha } from "@/lib/format";
import { Marquee } from "@/components/Marquee";
import { NewsletterModal } from "@/components/NewsletterModal";
import { SafeImage } from "@/components/SafeImage";
import { FeedbackForm } from "@/components/FeedbackForm";
import { MapPin, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async (): Promise<{
    items: MenuItem[];
    branches: Branch[];
    settings: SiteSettings;
    reviews: Review[];
  }> => ({
    items: await listMenuItems(),
    branches: await listBranches(),
    settings: await getSiteSettings(),
    reviews: await listApprovedReviews(),
  }),
  head: () => ({
    meta: [
      {
        title:
          "Meraki Cafe Lusaka | Homemade Food, Cakes & Coffee — Rhodespark, Eastpark & Kabulonga",
      },
      {
        name: "description",
        content:
          "Meraki is Lusaka's home for homemade meals, decadent cakes and good coffee. Three branches — Rhodespark, Eastpark, Kabulonga. See every dish in true-scale AR before you order.",
      },
      { property: "og:title", content: "Meraki Cafe Lusaka — Homemade Food, Cakes & Coffee" },
      {
        property: "og:description",
        content:
          "Three branches across Lusaka since 2008. See every dish in true-scale AR before you order.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  errorComponent: ({ error }) => (
    <p className="container-page py-24">Could not load: {error.message}</p>
  ),
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

// Real hero background photo from meraki.co.zm — used whenever the owner
// hasn't set their own site_settings.hero_image_url.
const REAL_HERO_IMAGE =
  "https://res.cloudinary.com/davidharven/image/upload/v1735744139/meraki/jkh5lsf2syrm4wspxfjn.jpg";

function Home() {
  const data = Route.useLoaderData() as {
    items: MenuItem[];
    branches: Branch[];
    settings: SiteSettings;
    reviews: Review[];
  };
  const { items, branches, settings, reviews } = data;
  const heroImg = isRealAsset(settings.hero_image_url) ? settings.hero_image_url : REAL_HERO_IMAGE;

  const prePacks = useMemo(
    () => items.filter((it) => it.is_hero || it.is_signature).slice(0, 6),
    [items],
  );

  return (
    <>
      {/* HERO — mint circle with rotating words + ORDER NOW.
          Photo hero swaps in when the owner uploads settings.hero_image_url. */}
      <Hero heroImg={heroImg} branches={branches} />

      <Marquee variant="solid" />

      {/* STORY BAND — giant pale MERAKI watermark, since 2008. */}
      <StoryBand />

      <Marquee variant="outline" />

      {/* PRE-PACKS — featured items with prices, like the live site's section. */}
      <PrePacks items={prePacks} />

      {reviews.length > 0 && <ReviewsStrip reviews={reviews} />}

      <FeedbackForm />

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
            <Link
              to="/locations"
              className="text-sm font-semibold uppercase tracking-wider text-[var(--charcoal)] underline underline-offset-8"
            >
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

function Hero({ heroImg, branches }: { heroImg: string; branches: Branch[] }) {
  return HeroImpl({ heroImg, branches });
}

function ReviewsStrip({ reviews }: { reviews: Review[] }) {
  // Duplicated once so the marquee-track's -50% loop lands mid-pattern —
  // same technique as <Marquee>, just with review cards instead of words.
  const track = reviews.length > 1 ? [...reviews, ...reviews] : reviews;
  return (
    <section className="bg-[var(--cream)] py-20">
      <div className="container-page text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">
          What people say
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Loved in Lusaka</h2>
      </div>

      <div className="group mt-10 overflow-hidden">
        <ul
          className="marquee-track flex w-max gap-6 px-5 group-hover:[animation-play-state:paused]"
          style={{ animationDuration: "40s" }}
        >
          {track.map((r, i) => (
            <li
              key={`${r.id}-${i}`}
              aria-hidden={i >= reviews.length}
              className="w-[320px] shrink-0 rounded-2xl border border-[var(--charcoal)]/10 bg-[var(--paper)] p-6 warm-shadow"
            >
              <div className="flex items-center gap-1 text-[var(--mint)]">
                {Array.from({ length: r.rating }).map((_, si) => (
                  <Star key={si} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--charcoal)]">
                &ldquo;{r.body}&rdquo;
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[color:var(--muted-foreground)]">
                {r.author_first_name}
                {r.branch_slug ? ` · ${r.branch_slug}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const HERO_ROTATING_WORDS = ["Simple.", "Fresh.", "Delicious."];

function HeroImpl({ heroImg, branches }: { heroImg: string; branches: Branch[] }) {
  return (
    <section className="relative overflow-hidden bg-[var(--brand-black)]">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[var(--brand-black)]/45" aria-hidden="true" />
      </div>
      <div className="container-page relative flex min-h-[80dvh] flex-col items-center justify-center py-20">
        {/* Mint circle: real meraki.co.zm hero motif, sampled from their markup */}
        <div
          className="relative grid h-[320px] w-[320px] place-items-center rounded-full bg-[var(--mint)] warm-shadow sm:h-[450px] sm:w-[450px] lg:h-[550px] lg:w-[550px] xl:h-[700px] xl:w-[700px]"
          aria-hidden="true"
        >
          <div className="text-center">
            <span
              style={{ fontFamily: "var(--font-script)" }}
              className="block text-5xl leading-none text-white sm:text-6xl xl:text-7xl"
            >
              Meraki
            </span>
            <span className="mt-4 block font-display text-2xl tracking-wide text-white sm:text-3xl xl:text-4xl">
              Experience
            </span>
            <div className="relative mt-1 h-8 sm:h-10 xl:h-12">
              {HERO_ROTATING_WORDS.map((w, i) => (
                <span
                  key={w}
                  className="absolute inset-x-0 font-display text-2xl tracking-wide text-[var(--charcoal)] sm:text-3xl xl:text-4xl"
                  style={{
                    animation: `word-rotate 6s ${i * 2}s infinite`,
                    opacity: 0,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        <h1 className="sr-only">Meraki Cafe Lusaka — homemade food, cakes and coffee since 2008</h1>

        <Link
          to="/menu"
          className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-widest text-[var(--charcoal)] hover:bg-white/90"
        >
          Order now
          <span aria-hidden="true">→</span>
        </Link>

        {/* Branch + phone strip — matches real site's placement directly under the hero CTA */}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/90">
          {branches.map((b) => (
            <li key={b.slug}>
              <span className="font-semibold">{b.name}</span>
              {b.phone && (
                <>
                  {" "}
                  <a
                    href={`tel:${b.phone}`}
                    className="underline underline-offset-4 hover:text-white"
                  >
                    {b.phone}
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- STORY ---------- */

// Decorative flat-lay cake photos flanking the giant MERAKI watermark —
// stand-ins for the real site's own product shots in this same spot.
const STORY_CAKE_WHOLE =
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80&auto=format&fit=crop";
const STORY_CAKE_SLICE =
  "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?w=700&q=80&auto=format&fit=crop";

// Orbit angle while actively scrolling; eases back to 0 (static front view)
// once scrolling and mouse movement both go idle.
const STORY_SPIN_DEGREES = 30;
const STORY_IDLE_MS = 550;

function StoryBand() {
  const [angle, setAngle] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);
  const idleTimerRef = useRef<number | undefined>(undefined);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lastScrollYRef.current = window.scrollY;

    // Freeze at the static front view once "Pre-Packs" arrives.
    const sentinel = document.getElementById("pre-packs");
    const observer = sentinel
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              lockedRef.current = true;
              window.clearTimeout(idleTimerRef.current);
              setAngle(0);
            }
          },
          { rootMargin: "0px 0px -40% 0px" },
        )
      : undefined;
    observer?.observe(sentinel as Element);

    const scheduleReturn = () => {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        if (!lockedRef.current) setAngle(0);
      }, STORY_IDLE_MS);
    };

    const onScroll = () => {
      if (lockedRef.current) return;
      const y = window.scrollY;
      if (y > lastScrollYRef.current) setAngle(STORY_SPIN_DEGREES);
      else if (y < lastScrollYRef.current) setAngle(-STORY_SPIN_DEGREES);
      lastScrollYRef.current = y;
      scheduleReturn();
    };

    // Mouse settling over the cakes is what triggers the return to front —
    // movement itself doesn't spin them, only scroll direction does.
    const onMouseMove = () => {
      if (lockedRef.current) return;
      scheduleReturn();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const stage = stageRef.current;
    stage?.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      stage?.removeEventListener("mousemove", onMouseMove);
      window.clearTimeout(idleTimerRef.current);
      observer?.disconnect();
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[var(--cream)] py-24">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 text-center font-display text-[18vw] font-bold leading-none tracking-tighter text-[var(--charcoal)]/[0.05]"
      >
        MERAKI
      </span>
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-2">
        <div
          ref={stageRef}
          className="relative mx-auto hidden aspect-square w-full max-w-sm md:block"
          aria-hidden="true"
        >
          {/* Orbit: rotating this swings both photos' positions around the
              shared center — "spinning around each other". */}
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {/* Each photo counter-rotates so it always reads front-on, never tilted. */}
            <div
              className="absolute left-0 top-0 transition-transform duration-700 ease-out will-change-transform"
              style={{ transform: `rotate(${-angle}deg)` }}
            >
              <img
                src={STORY_CAKE_WHOLE}
                alt=""
                className="h-56 w-56 rounded-3xl object-cover warm-shadow sm:h-72 sm:w-72"
              />
            </div>
            <div
              className="absolute bottom-0 right-0 transition-transform duration-700 ease-out will-change-transform"
              style={{ transform: `rotate(${-angle}deg)` }}
            >
              <img
                src={STORY_CAKE_SLICE}
                alt=""
                className="h-40 w-40 rounded-3xl border-4 border-[var(--cream)] object-cover warm-shadow sm:h-52 sm:w-52"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">
            —— Since 2008
          </p>
          <h2 className="mt-4 font-display text-5xl md:text-6xl">Simple. Fresh. Delicious.</h2>
          <p className="mt-6 text-lg text-[color:var(--muted-foreground)]">
            Experience the warmth of home with every visit. Our menu features a delightful array of
            homemade dishes and decadent cakes, crafted with love and the finest ingredients.
            Whether you're here for a casual meal or a special celebration, we promise a cozy
            atmosphere and food that comforts the soul.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              to="/about"
              className="min-h-11 rounded-full border-2 border-[var(--charcoal)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--charcoal)] hover:bg-[var(--charcoal)] hover:text-[var(--cream)]"
            >
              About Meraki
            </Link>
            <Link
              to="/quote/request-a-quote"
              className="min-h-11 rounded-full bg-[var(--mint)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--charcoal)] hover:brightness-95"
            >
              Get a quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PRE-PACKS ---------- */

function PrePacks({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;
  return (
    <section id="pre-packs" className="container-page py-20">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">
          Ready when you are
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Pre-Packs</h2>
        <p className="mx-auto mt-3 max-w-xl text-[color:var(--muted-foreground)]">
          A taste of the menu — favourites you can order straight away.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-[var(--charcoal)]/10 bg-[var(--paper)] warm-shadow"
          >
            <Link
              to="/menu/$category/$slug"
              params={{ category: it.category, slug: it.slug }}
              className="block aspect-[4/3] overflow-hidden bg-[var(--mint-tint)]"
              aria-label={`View ${it.name}`}
            >
              <SafeImage
                src={it.image_url}
                alt={it.image_alt || it.name}
                itemName={it.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-xl text-[var(--charcoal)]">{it.name}</h3>
                <span className="shrink-0 font-display text-lg text-[var(--charcoal)]">
                  {formatKwacha(it.price_kwacha)}
                </span>
              </div>
              <Link
                to="/menu/$category/$slug"
                params={{ category: it.category, slug: it.slug }}
                className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--mint)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--charcoal)] hover:brightness-95"
              >
                Order Now
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/menu"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[var(--charcoal)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--charcoal)] hover:bg-[var(--charcoal)] hover:text-[var(--cream)]"
        >
          See the full menu
        </Link>
      </div>
    </section>
  );
}
