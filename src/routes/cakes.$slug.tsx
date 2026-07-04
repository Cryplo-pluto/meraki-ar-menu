import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getItemBySlug, type MenuItem } from "@/lib/menu.functions";
import { formatKwacha } from "@/lib/format";
import { ArViewer } from "@/components/ArViewer";
import { z } from "zod";

const searchSchema = z.object({ ar: z.union([z.literal(1), z.string()]).optional() });

export const Route = createFileRoute("/cakes/$slug")({
  component: CakePage,
  validateSearch: (s) => searchSchema.parse(s),
  loader: async ({ params }): Promise<{ item: MenuItem }> => {
    const item = await getItemBySlug({ data: { slug: params.slug } });
    if (!item) throw notFound();
    return { item };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — Meraki" }, { name: "robots", content: "noindex" }] };
    const it = loaderData.item;
    return {
      meta: [
        { title: `${it.name} Cake — Meraki Cafe Lusaka` },
        { name: "description", content: `${it.name}. ${it.dimensions_label}. Order by 12:00 for next-day collection or delivery across Lusaka.` },
        { property: "og:title", content: `${it.name} — Meraki Cakes` },
        { property: "og:image", content: it.image_url },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/cakes/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/cakes/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: it.name,
            description: it.description,
            image: it.image_url,
            offers: { "@type": "Offer", price: it.price_kwacha, priceCurrency: "ZMW", availability: "https://schema.org/InStock" },
          }),
        },
      ],
    };
  },
  errorComponent: ({ error }) => <p className="container-page py-24">Could not load: {error.message}</p>,
  notFoundComponent: () => <p className="container-page py-24">This cake isn't available right now.</p>,
});

function CakePage() {
  const { item } = Route.useLoaderData() as { item: MenuItem };
  const { ar } = Route.useSearch();
  return (
    <div className="container-page py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/cakes" className="hover:text-primary">Cakes</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{item.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted warm-shadow">
            <img src={item.image_url} alt={item.image_alt || item.name} className="h-full w-full object-cover" />
          </div>
          <div id="ar" className="mt-6 aspect-[4/3]">
            <ArViewer
              glbUrl={item.glb_url}
              usdzUrl={item.usdz_url}
              posterUrl={item.image_url}
              itemName={item.name}
              dimensionsLabel={item.dimensions_label}
              autoLaunchAr={Boolean(ar)}
              className="h-full w-full"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Representative cake shown at true size; final decoration may vary.</p>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl">{item.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-primary">{formatKwacha(item.price_kwacha)}</p>
          <p className="mt-1 text-sm font-medium text-accent">{item.dimensions_label}</p>
          <p className="mt-6 text-lg leading-relaxed text-foreground/90">{item.description}</p>
          {item.allergens.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Contains</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {item.allergens.map((a) => (
                  <li key={a} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium capitalize text-foreground/80">{a}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/order" search={{ add: item.slug } as never} className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">Order this cake</Link>
            <Link to="/cake-builder" className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">Or build your own</Link>
          </div>
        </div>
      </div>
    </div>
  );
}