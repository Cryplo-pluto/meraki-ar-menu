import { createFileRoute, Link } from "@tanstack/react-router";
import { listCategoryItems, type MenuItem } from "@/lib/menu.functions";
import { MenuCard } from "@/components/MenuCard";
import { categoryLabel } from "@/lib/format";

export const Route = createFileRoute("/menu/$category")({
  component: CategoryPage,
  loader: async ({ params }): Promise<{ items: MenuItem[] }> => ({
    items: await listCategoryItems({ data: { category: params.category } }),
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${categoryLabel(params.category)} — Meraki Cafe Lusaka` },
      { name: "description", content: `Our ${categoryLabel(params.category).toLowerCase()} at Meraki Cafe Lusaka. See every dish in true-scale AR before you order.` },
      { property: "og:title", content: `${categoryLabel(params.category)} — Meraki` },
      { property: "og:url", content: `/menu/${params.category}` },
    ],
    links: [{ rel: "canonical", href: `/menu/${params.category}` }],
  }),
  errorComponent: ({ error }) => <p className="container-page py-24">Could not load menu: {error.message}</p>,
  notFoundComponent: () => <p className="container-page py-24">Category not found.</p>,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { items } = Route.useLoaderData() as { items: MenuItem[] };
  return (
    <div className="container-page py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/menu" className="hover:text-primary">Menu</Link> <span className="mx-2">/</span> <span className="text-foreground">{categoryLabel(category)}</span>
      </nav>
      <h1 className="text-4xl md:text-5xl">{categoryLabel(category)}</h1>
      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Nothing in this category right now — our specials change with the season. Check back soon or ask in store.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <MenuCard key={it.id} item={it} hrefBase={`/menu/${it.category}`} />
          ))}
        </div>
      )}
    </div>
  );
}