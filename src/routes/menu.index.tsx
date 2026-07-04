import { createFileRoute, Link } from "@tanstack/react-router";
import { listMenuItems, type MenuItem } from "@/lib/menu.functions";
import { MenuCard } from "@/components/MenuCard";
import { CATEGORY_ORDER, categoryLabel } from "@/lib/format";

export const Route = createFileRoute("/menu/")({
  component: MenuIndex,
  loader: async (): Promise<{ items: MenuItem[] }> => ({ items: await listMenuItems() }),
  head: () => ({
    meta: [
      { title: "Menu — Meraki Cafe Lusaka" },
      { name: "description", content: "Everything we cook, from all-day breakfasts to burgers, bowls and smoothies. See every dish in true-scale AR before you order." },
      { property: "og:title", content: "Meraki Menu — Lusaka" },
      { property: "og:url", content: "/menu" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  errorComponent: ({ error }) => (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl">The menu didn't load</h1>
      <p className="mt-3 text-muted-foreground">Likely a slow connection. Refresh to try again, or head to Locations for our branch details.</p>
      <p className="mt-6 text-xs text-muted-foreground/70">Error: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
  pendingComponent: () => <p className="container-page py-24 text-center text-muted-foreground">Setting the table… your menu's on its way.</p>,
});

function MenuIndex() {
  const { items } = Route.useLoaderData() as { items: MenuItem[] };
  const grouped = new Map<string, MenuItem[]>();
  for (const i of items) {
    if (i.category === "cakes") continue;
    if (!grouped.has(i.category)) grouped.set(i.category, []);
    grouped.get(i.category)!.push(i);
  }
  const cats = CATEGORY_ORDER.filter((c) => grouped.has(c));
  return (
    <div className="container-page py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Everything we cook</p>
        <h1 className="mt-2 text-4xl md:text-5xl">What's cooking</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything is made in our kitchen, fresh each morning — from all-day breakfasts to bowls, burgers and smoothies.
        </p>
      </header>

      {items.length === 0 && (
        <p className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-border/70 bg-card/60 p-8 text-center text-muted-foreground">
          Our full menu with photos is being uploaded — here's what's ready:
          <br />
          <span className="mt-2 block text-sm">Nothing yet. Check back very soon.</span>
        </p>
      )}

      <nav aria-label="Menu categories" className="sticky top-[68px] z-30 -mx-5 mt-10 overflow-x-auto border-b border-border/60 bg-background/85 px-5 py-3 backdrop-blur">
        <ul className="flex min-w-max gap-2">
          {cats.map((c) => (
            <li key={c}>
              <Link
                to="/menu/$category"
                params={{ category: c }}
                className="inline-block min-h-11 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 hover:border-primary/50 hover:text-primary"
              >
                {categoryLabel(c)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {cats.map((c) => (
        <section key={c} id={c} className="mt-16 scroll-mt-32">
          <h2 className="text-2xl md:text-3xl">{categoryLabel(c)}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.get(c)!.map((it) => (
              <MenuCard key={it.id} item={it} hrefBase={`/menu/${it.category}`} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}