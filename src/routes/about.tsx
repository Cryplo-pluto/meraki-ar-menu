import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "Our Story — Meraki Cafe Lusaka" },
      { name: "description", content: "Meraki has been cooking with soul in Lusaka since 2008. Three homes, one kitchen philosophy: cook the way you'd cook for someone you love." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function About() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our home</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Cooked with soul, since 2008.</h1>
        <p className="mt-6 text-lg leading-relaxed text-foreground/90">
          Meraki started as a small kitchen in Lusaka with one rule: cook the way you'd cook for someone you love. Sixteen years later, three branches and thousands of cakes on, that's still the whole idea.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-foreground/90">
          Everything we serve — from all-day breakfasts to birthday cakes — is made in-house, from scratch, each morning. It's why our regulars stay regulars, and why we've never wanted to grow faster than our kitchen.
        </p>
        <div className="mt-8">
          <Link to="/menu" className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">See the menu</Link>
        </div>
      </div>
    </div>
  );
}