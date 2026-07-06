import { createFileRoute, Link } from "@tanstack/react-router";
import { listCakes, type MenuItem } from "@/lib/menu.functions";
import { MenuCard } from "@/components/MenuCard";

export const Route = createFileRoute("/cakes/")({
  component: CakesIndex,
  loader: async (): Promise<{ cakes: MenuItem[] }> => ({ cakes: await listCakes() }),
  head: () => ({
    meta: [
      { title: "Custom & Celebration Cakes in Lusaka | Order Online — Meraki Cafe" },
      {
        name: "description",
        content:
          "Cakes for birthdays, weddings and just-because Fridays. Pickup from Rhodespark, Eastpark or Kabulonga, or delivery across Lusaka. Order by 12:00 for next-day collection.",
      },
      { property: "og:title", content: "Meraki Cakes — Lusaka" },
      { property: "og:url", content: "/cakes" },
    ],
    links: [{ rel: "canonical", href: "/cakes" }],
  }),
  errorComponent: ({ error }) => (
    <p className="container-page py-24">Could not load: {error.message}</p>
  ),
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

function CakesIndex() {
  const { cakes } = Route.useLoaderData() as { cakes: MenuItem[] };
  return (
    <div className="container-page py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Meraki Cakes</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Simple. Fresh. Delicious.</h1>
        <p className="mt-4 text-lg text-muted-foreground">Explore Our Cakes</p>
      </header>

      <h2 className="mt-12 text-center text-2xl">Pre designed cake</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cakes.map((c) => (
          <MenuCard key={c.id} item={c} hrefBase="/cakes" />
        ))}
      </div>

      {/* "Build Your Dream Cake" — matches the real /cakes page section verbatim */}
      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-[var(--charcoal)]/10 bg-[var(--mint-tint)] p-8 text-center sm:p-12">
        <h2 className="text-3xl md:text-4xl">Build Your Dream Cake</h2>
        <p className="mt-3 text-muted-foreground">
          Create a custom cake exactly how you want it! Choose your cake type, shape, flavors,
          colors, and more.
        </p>
        <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-[var(--charcoal)]">
          <li>• Select cake shape and size</li>
          <li>• Choose from multiple flavors</li>
          <li>• Customize colors and decorations</li>
          <li>• Upload reference images</li>
        </ul>
        <Link
          to="/cake-builder"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--mint)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--charcoal)] hover:brightness-95"
        >
          Start Building Your Cake
        </Link>
      </section>
    </div>
  );
}
