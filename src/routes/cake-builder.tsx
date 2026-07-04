import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cake-builder")({
  component: CakeBuilder,
  head: () => ({
    meta: [
      { title: "Build Your Own Cake — Meraki Cafe Lusaka" },
      { name: "description", content: "Pick the size, sponge, filling and finish — we'll bake it exactly how you imagined it. Order by 12:00 for next-day collection." },
      { property: "og:url", content: "/cake-builder" },
    ],
    links: [{ rel: "canonical", href: "/cake-builder" }],
  }),
});

function CakeBuilder() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Custom cakes</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Build your own cake</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Pick the size, sponge, filling and finish — we'll bake it exactly how you imagined it.
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          Our full step-by-step builder is coming next. In the meantime, browse our cake gallery or call us directly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/cakes" className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">See our cakes</Link>
          <a href="tel:+260977000001" className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">Call to order</a>
        </div>
      </div>
    </div>
  );
}