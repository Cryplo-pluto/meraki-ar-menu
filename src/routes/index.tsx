import { createFileRoute, Link } from "@tanstack/react-router";
import { listSignatureItems, listBranches, type MenuItem, type Branch } from "@/lib/menu.functions";
import { MenuCard } from "@/components/MenuCard";
import { Section } from "@/components/Section";
import { Box, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async (): Promise<{ signatures: MenuItem[]; branches: Branch[] }> => ({
    signatures: await listSignatureItems(),
    branches: await listBranches(),
  }),
  errorComponent: ({ error }) => <p className="container-page py-24">Could not load: {error.message}</p>,
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

function Home() {
  const data = Route.useLoaderData() as { signatures: MenuItem[]; branches: Branch[] };
  const { signatures, branches } = data;
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 scrim-gradient" />
          <div className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
        </div>
        <div className="container-page flex min-h-[70dvh] flex-col justify-end py-16 text-white md:min-h-[80dvh]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Simple. Fresh. Delicious.</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl">
            A home-cooked meal, away from home.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90 md:text-xl">
            Homemade dishes, decadent cakes and honest coffee — served with love at three spots across Lusaka since 2008.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu" className="min-h-11 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground warm-shadow hover:brightness-110">
              See the menu
            </Link>
            <Link to="/menu" className="min-h-11 rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {signatures.map((it) => (
            <MenuCard key={it.id} item={it} hrefBase={`/menu/${it.category}`} />
          ))}
        </div>
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
                <p className="mt-1 text-sm text-muted-foreground">{b.address}</p>
                <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Mon–Sun · 07:00–21:00</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CAKES TEASER */}
      <Section eyebrow="For every celebration" title="Order a cake, or build your own">
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/cakes" className="group relative block aspect-[16/10] overflow-hidden rounded-2xl warm-shadow">
            <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&q=80" alt="Black Forest cake with cherries and cream" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
            <div className="absolute inset-0 scrim-gradient" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="text-2xl">Our cake gallery</h3>
              <p className="mt-1 text-sm text-white/85">Browse and order for pickup or delivery.</p>
            </div>
          </Link>
          <Link to="/cake-builder" className="group relative block aspect-[16/10] overflow-hidden rounded-2xl warm-shadow">
            <img src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1600&q=80" alt="Vanilla birthday cake with buttercream and sprinkles" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-accent/40 mix-blend-multiply" />
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
          <p className="mt-5 text-lg text-muted-foreground">
            Meraki started as a small kitchen in Lusaka with one rule: cook the way you'd cook for someone you love. Sixteen years later, three branches and thousands of cakes on, that's still the whole idea.
          </p>
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
