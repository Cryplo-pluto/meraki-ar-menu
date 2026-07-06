import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { getItemBySlug, type MenuItem } from "@/lib/menu.functions";
import { formatKwacha, categoryLabel } from "@/lib/format";
import { InteractiveModelCard } from "@/components/InteractiveModelCard";
import { getCart, getQty, setQty, subscribe, type CartLine } from "@/lib/cart";
import { z } from "zod";

const searchSchema = z.object({ ar: z.union([z.literal(1), z.string()]).optional() });

export const Route = createFileRoute("/menu/$category/$slug")({
  component: ItemPage,
  validateSearch: (s) => searchSchema.parse(s),
  loader: async ({ params }): Promise<{ item: MenuItem }> => {
    const item = await getItemBySlug({ data: { slug: params.slug } });
    if (!item) throw notFound();
    return { item };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Not found — Meraki" }, { name: "robots", content: "noindex" }] };
    const it = loaderData.item;
    return {
      meta: [
        { title: `${it.name} — Meraki Cafe Lusaka` },
        {
          name: "description",
          content: `${it.name}. ${it.dimensions_label}. ${formatKwacha(it.price_kwacha)}. See it in true-scale AR before you order.`,
        },
        { property: "og:title", content: `${it.name} — Meraki` },
        { property: "og:description", content: it.description.slice(0, 180) },
        { property: "og:image", content: it.image_url },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/menu/${params.category}/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/menu/${params.category}/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MenuItem",
            name: it.name,
            description: it.description,
            image: it.image_url,
            offers: { "@type": "Offer", price: it.price_kwacha, priceCurrency: "ZMW" },
          }),
        },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <p className="container-page py-24">Could not load: {error.message}</p>
  ),
  notFoundComponent: () => (
    <p className="container-page py-24">This item isn't on the menu right now.</p>
  ),
});

function ItemPage() {
  const { item } = Route.useLoaderData() as { item: MenuItem };
  const { ar } = Route.useSearch();
  return (
    <div className="container-page py-12">
      <Link
        to="/menu/$category"
        params={{ category: item.category }}
        className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <InteractiveModelCard
            photoUrl={item.image_url}
            photoAlt={item.image_alt || item.name}
            glbUrl={item.effective_glb_url}
            usdzUrl={item.effective_usdz_url}
            itemName={item.name}
            defaultMode={ar ? "3d" : item.is_hero ? "3d" : "photo"}
            autoLaunchAr={Boolean(ar)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Representative dish shown at true size; plating may vary.
          </p>
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl">{item.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-primary">
            {formatKwacha(item.price_kwacha)}
          </p>
          <p className="mt-1 text-sm font-medium text-accent">
            Shown at actual size — {item.effective_dimensions_label || item.dimensions_label}
          </p>

          <p className="mt-6 text-lg leading-relaxed text-foreground/90">{item.description}</p>

          {item.allergens.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Contains
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {item.allergens.map((a) => (
                  <li
                    key={a}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium capitalize text-foreground/80"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Available at
            </h2>
            <p className="mt-2 text-sm capitalize text-foreground/80">
              {item.available_branches.join(" · ")}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QtyStepper item={item} />
            <Link
              to="/menu/$category"
              params={{ category: item.category }}
              className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Back to {categoryLabel(item.category)}
            </Link>
          </div>
        </div>
      </div>

      <FloatingCheckout />
    </div>
  );
}

function QtyStepper({ item }: { item: MenuItem }) {
  const [qty, setQtyState] = useState(0);

  useEffect(() => {
    setQtyState(getQty(item.slug));
    return subscribe(() => setQtyState(getQty(item.slug)));
  }, [item.slug]);

  const update = (next: number) => setQty(item, next);

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => update(1)}
        className="min-h-11 rounded-full bg-[var(--charcoal)] px-6 py-3 text-sm font-semibold text-[var(--cream)] hover:brightness-110"
      >
        Add to order
      </button>
    );
  }

  return (
    <div className="inline-flex min-h-11 items-center gap-4 rounded-full bg-[var(--charcoal)] px-3 py-1.5 text-[var(--cream)]">
      <button
        type="button"
        onClick={() => update(qty - 1)}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" className="min-w-[1.5ch] text-center text-sm font-bold">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => update(qty + 1)}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function FloatingCheckout() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(getCart());
    return subscribe(() => setLines(getCart()));
  }, []);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.price_kwacha, 0);

  if (count === 0) return null;

  return (
    <Link
      to="/order"
      className="fixed inset-x-0 bottom-6 z-40 mx-auto flex min-h-11 w-fit items-center gap-2 rounded-full bg-[var(--charcoal)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--cream)] warm-shadow hover:brightness-110"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      Checkout · {count} item{count === 1 ? "" : "s"} · {formatKwacha(total)}
    </Link>
  );
}
