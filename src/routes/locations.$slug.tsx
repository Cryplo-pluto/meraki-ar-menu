import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getBranchBySlug, type Branch } from "@/lib/menu.functions";
import { ArrowLeft, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/locations/$slug")({
  component: BranchPage,
  loader: async ({ params }): Promise<{ branch: Branch }> => {
    const b = await getBranchBySlug({ data: { slug: params.slug } });
    if (!b) throw notFound();
    return { branch: b };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Not found — Meraki" }, { name: "robots", content: "noindex" }] };
    const b = loaderData.branch;
    const hoursSpec = Object.entries(b.hours ?? {}).map(([day, hrs]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: day,
      description: hrs,
    }));
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "CafeOrCoffeeShop",
      name: `Meraki Cafe ${b.name.replace(/^Meraki\s+/i, "")}`.trim(),
      areaServed: "Lusaka, Zambia",
      sameAs: [
        "https://web.facebook.com/merakicafezm",
        "https://www.instagram.com/merakicentrolimited",
      ],
    };
    if (b.address && b.address !== "Address to be confirmed") {
      jsonLd.address = {
        "@type": "PostalAddress",
        streetAddress: b.address,
        addressLocality: "Lusaka",
        addressCountry: "ZM",
      };
    }
    if (b.phone) jsonLd.telephone = b.phone;
    if (hoursSpec.length > 0) jsonLd.openingHoursSpecification = hoursSpec;
    if (b.lat && b.lng)
      jsonLd.geo = { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng };
    const descParts = [`Meraki Cafe ${b.name}`];
    if (b.address && b.address !== "Address to be confirmed") descParts.push(b.address);
    if (b.phone) descParts.push(`Call ${b.phone}.`);
    return {
      meta: [
        { title: `${b.name} — Meraki Cafe Lusaka` },
        { name: "description", content: descParts.join(" · ") },
        { property: "og:url", content: `/locations/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/locations/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <p className="container-page py-24">Could not load: {error.message}</p>
  ),
  notFoundComponent: () => <p className="container-page py-24">Branch not found.</p>,
});

function BranchPage() {
  const { branch } = Route.useLoaderData() as { branch: Branch };
  const hoursEntries = Object.entries(branch.hours ?? {});
  const hasAddress = branch.address && branch.address !== "Address to be confirmed";
  const hasPhone = Boolean(branch.phone);
  return (
    <div className="container-page py-12">
      <Link
        to="/locations"
        className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <MapPin className="h-6 w-6 text-accent" />
          <h1 className="mt-3 text-4xl md:text-5xl">{branch.name}</h1>
          {hasAddress ? (
            <p className="mt-3 text-lg text-muted-foreground">{branch.address}</p>
          ) : (
            <p className="mt-3 text-sm italic text-muted-foreground/80">
              Address being confirmed — please call ahead.
            </p>
          )}
          {hoursEntries.length > 0 && (
            <>
              <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Hours</p>
              <ul className="mt-1 text-foreground/90">
                {hoursEntries.map(([day, hrs]) => (
                  <li key={day}>
                    <span className="capitalize">{day}</span>: {hrs}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {hasPhone && (
              <a
                href={`tel:${branch.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> {branch.phone}
              </a>
            )}
            {branch.lat && branch.lng && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
                target="_blank"
                rel="noreferrer"
                className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Get directions
              </a>
            )}
            <Link
              to="/order"
              className="min-h-11 rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
            >
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
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(`Meraki Cafe ${branch.name.replace(/^Meraki\s+/i, "")} Lusaka`)}&z=16&output=embed`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
