import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getBranchBySlug, type Branch } from "@/lib/menu.functions";
import { MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/locations/$slug")({
  component: BranchPage,
  loader: async ({ params }): Promise<{ branch: Branch }> => {
    const b = await getBranchBySlug({ data: { slug: params.slug } });
    if (!b) throw notFound();
    return { branch: b };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — Meraki" }, { name: "robots", content: "noindex" }] };
    const b = loaderData.branch;
    return {
      meta: [
        { title: `${b.name} — Meraki Cafe Lusaka` },
        { name: "description", content: `${b.name}, ${b.address}. Open daily 07:00–21:00. Call ${b.phone}.` },
        { property: "og:url", content: `/locations/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/locations/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: b.name,
            address: { "@type": "PostalAddress", streetAddress: b.address, addressLocality: "Lusaka", addressCountry: "ZM" },
            telephone: b.phone,
            openingHours: "Mo-Su 07:00-21:00",
            geo: b.lat && b.lng ? { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng } : undefined,
          }),
        },
      ],
    };
  },
  errorComponent: ({ error }) => <p className="container-page py-24">Could not load: {error.message}</p>,
  notFoundComponent: () => <p className="container-page py-24">Branch not found.</p>,
});

function BranchPage() {
  const { branch } = Route.useLoaderData() as { branch: Branch };
  return (
    <div className="container-page py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/locations" className="hover:text-primary">Locations</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{branch.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <MapPin className="h-6 w-6 text-accent" />
          <h1 className="mt-3 text-4xl md:text-5xl">{branch.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{branch.address}</p>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Hours</p>
          <p className="mt-1 text-foreground/90">Mon–Sun · 07:00–21:00</p>
          <p className="mt-1 text-xs text-muted-foreground">Kitchen closes 30 minutes before we do.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
              <Phone className="h-4 w-4" aria-hidden="true" /> {branch.phone}
            </a>
            {branch.lat && branch.lng && (
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`} target="_blank" rel="noreferrer" className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                Get directions
              </a>
            )}
            <Link to="/order" className="min-h-11 rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5">
              Order from this branch
            </Link>
          </div>
        </div>
        {branch.lat && branch.lng && (
          <div className="overflow-hidden rounded-2xl border border-border/60 warm-shadow">
            <iframe
              title={`Map to ${branch.name}`}
              width="100%"
              height="420"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${branch.lng - 0.01},${branch.lat - 0.01},${branch.lng + 0.01},${branch.lat + 0.01}&layer=mapnik&marker=${branch.lat},${branch.lng}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}