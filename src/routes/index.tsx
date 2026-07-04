import { createFileRoute, Link } from "@tanstack/react-router";
import { listSignatureItems, listBranches, type MenuItem, type Branch } from "@/lib/menu.functions";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings.functions";
import { isRealAsset } from "@/lib/images";
import { MenuCard } from "@/components/MenuCard";
import { Section } from "@/components/Section";
import { Box, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async (): Promise<{ signatures: MenuItem[]; branches: Branch[]; settings: SiteSettings }> => ({
    signatures: await listSignatureItems(),
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

function Home() {
  const data = Route.useLoaderData() as { signatures: MenuItem[]; branches: Branch[]; settings: SiteSettings };
  const { signatures, branches, settings } = data;
  const heroImg = isRealAsset(settings.hero_image_url) ? settings.hero_image_url : "";
  const cakesImg = isRealAsset(settings.cakes_teaser_image_url) ? settings.cakes_teaser_image_url : "";
  const builderImg = isRealAsset(settings.builder_teaser_image_url) ? settings.builder_teaser_image_url : "";
  const story = settings.story_md.trim();
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/40 to-primary/15">
        {heroImg ? (
          <div className="absolute inset-0 -z-10">
            <img src={heroImg} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 scrim-gradient" />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='104' viewBox='0 0 90 104'><g fill='none' stroke='%23000' stroke-opacity='0.45' stroke-width='1.2'><polygon points='45,4 82,26 82,78 45,100 8,78 8,26'/><polyline points='45,4 45,52 8,26'/><polyline points='45,52 82,26'/><polyline points='45,52 45,100'/></g></svg>\")",
              backgroundSize: "90px 104px",
            }}
          />
        )}
        <div className={`container-page flex min-h-[70dvh] flex-col justify-end py-16 md:min-h-[80dvh] ${heroImg ? "text-white" : "text-foreground"}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${heroImg ? "text-white/80" : "text-accent"}`}>Simple. Fresh. Delicious.</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl">
            A home-cooked meal, away from home.
          </h1>
          <p className={`mt-5 max-w-2xl text-lg md:text-xl ${heroImg ? "text-white/90" : "text-foreground/80"}`}>
            Homemade dishes, decadent cakes and honest coffee — served with love at three spots across Lusaka since 2008.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu" className="min-h-11 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground warm-shadow hover:brightness-110">
              See the menu
            </Link>
            <Link to="/order" className={`min-h-11 rounded-full px-6 py-3 text-sm font-semibold ${heroImg ? "border border-white/70 text-white hover:bg-white/10" : "border border-primary text-primary hover:bg-primary/5"}`}>
              Order for delivery
            </Link>
          </div>
        </div>
      </section>

      {/* SIGNATURES */}
      <Section
        eyebrow="See it before you order it"
        title="Signature dishes — try them in AR"
        action={<Link to="/menu" className="hidden text-sm font-medium text-primary hover:underline md:inline">Full menu →</Link>}
      >
        {signatures.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-8 text-center text-muted-foreground">
            Our full menu with photos is being uploaded — check back very soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {signatures.map((it) => (
              <MenuCard key={it.id} item={it} hrefBase={`/menu/${it.category}`} />
            ))}
          </div>
        )}
      </Section>

      {/* LOCATIONS STRIP */}
      <section className="border-y border-border/60 bg-secondary/10">
        <div className="container-page py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Three spots</p>
              <h2 className="mt-1 text-3xl md:text-4xl">Find your Meraki</h2>
            </div>
            <Link to="/locations" className="hidden text-sm font-medium text-primary hover:underline md:inline">All locations →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {branches.map((b) => (
              <Link key={b.slug} to="/locations/$slug" params={{ slug: b.slug }} className="group rounded-2xl border border-border/60 bg-card p-6 warm-shadow transition hover:border-primary/40">
                <MapPin className="h-5 w-5 text-accent" />
                <h3 className="mt-3 text-xl">{b.name}</h3>
                {b.address && <p className="mt-1 text-sm text-muted-foreground">{b.address}</p>}
                <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">See branch details</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CAKES TEASER */}
      <Section eyebrow="For every celebration" title="Order a cake, or build your own">
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/cakes" className="group relative block aspect-[16/10] overflow-hidden rounded-2xl warm-shadow bg-gradient-to-br from-accent/30 to-primary/20">
            {cakesImg && <img src={cakesImg} alt="" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.03]" />}
            <div className="absolute inset-0 scrim-gradient" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="text-2xl">Our cake gallery</h3>
              <p className="mt-1 text-sm text-white/85">Browse and order for pickup or delivery.</p>
            </div>
          </Link>
          <Link to="/cake-builder" className="group relative block aspect-[16/10] overflow-hidden rounded-2xl warm-shadow bg-gradient-to-br from-primary/25 to-accent/25">
            {builderImg && <img src={builderImg} alt="" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.03]" />}
            <div className="absolute inset-0 scrim-gradient" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="text-2xl">Build your own cake</h3>
              <p className="mt-1 text-sm text-white/90">Size, sponge, filling, finish — exactly how you imagined it.</p>
            </div>
          </Link>
        </div>
      </Section>

      {/* STORY */}
      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our home</p>
          <h2 className="mt-2 text-3xl md:text-4xl">Cooked with soul, since 2008.</h2>
          {story ? (
            <p className="mt-5 whitespace-pre-line text-lg text-muted-foreground">{story}</p>
          ) : (
            <p className="mt-5 text-lg text-muted-foreground">
              Homemade food, cakes and coffee — served across three branches in Lusaka since 2008.
            </p>
          )}
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/about" className="min-h-11 rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5">Read our story</Link>
            <Link to="/ar" className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
              <span className="inline-flex items-center gap-2"><Box className="h-4 w-4" aria-hidden="true" /> How our AR menu works</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
