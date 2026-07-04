import { createFileRoute, Link } from "@tanstack/react-router";
import { listCakes, type MenuItem } from "@/lib/menu.functions";
import { MenuCard } from "@/components/MenuCard";

export const Route = createFileRoute("/cakes/")({
  component: CakesIndex,
  loader: async (): Promise<{ cakes: MenuItem[] }> => ({ cakes: await listCakes() }),
  head: () => ({
    meta: [
      { title: "Custom & Celebration Cakes in Lusaka | Order Online — Meraki Cafe" },
      { name: "description", content: "Cakes for birthdays, weddings and just-because Fridays. Pickup from Rhodespark, Eastpark or Kabulonga, or delivery across Lusaka. Order by 12:00 for next-day collection." },
      { property: "og:title", content: "Meraki Cakes — Lusaka" },
      { property: "og:url", content: "/cakes" },
    ],
    links: [{ rel: "canonical", href: "/cakes" }],
  }),
  errorComponent: ({ error }) => <p className="container-page py-24">Could not load: {error.message}</p>,
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

function CakesIndex() {
  const { cakes } = Route.useLoaderData() as { cakes: MenuItem[] };
  return (
    <div className="container-page py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Baked in our kitchen</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Our cakes</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          From black forest to something entirely your own. Pickup or delivery across Lusaka.
        </p>
        <Link to="/cake-builder" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
          Build your own cake
        </Link>
      </header>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cakes.map((c) => (
          <MenuCard key={c.id} item={c} hrefBase="/cakes" />
        ))}
      </div>
    </div>
  );
}