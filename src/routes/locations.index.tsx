import { createFileRoute, Link } from "@tanstack/react-router";
import { listBranches, type Branch } from "@/lib/menu.functions";
import { MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/locations/")({
  component: LocationsIndex,
  loader: async (): Promise<{ branches: Branch[] }> => ({ branches: await listBranches() }),
  head: () => ({
    meta: [
      { title: "Locations — Meraki Cafe Lusaka" },
      { name: "description", content: "Meraki Cafe has three homes in Lusaka: Rhodespark, Eastpark and Kabulonga. Open daily 07:00–21:00." },
      { property: "og:url", content: "/locations" },
    ],
    links: [{ rel: "canonical", href: "/locations" }],
  }),
  errorComponent: ({ error }) => <p className="container-page py-24">Could not load: {error.message}</p>,
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

function LocationsIndex() {
  const { branches } = Route.useLoaderData() as { branches: Branch[] };
  return (
    <div className="container-page py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Three homes in Lusaka</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Find your Meraki</h1>
        <p className="mt-4 text-lg text-muted-foreground">Kitchen closes 30 minutes before we do.</p>
      </header>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {branches.map((b) => (
          <article key={b.slug} className="flex flex-col rounded-2xl border border-border/60 bg-card p-6 warm-shadow">
            <MapPin className="h-5 w-5 text-accent" />
            <h2 className="mt-3 text-2xl">{b.name}</h2>
            {b.address && b.address !== "Address to be confirmed" ? (
              <p className="mt-2 text-sm text-muted-foreground">{b.address}</p>
            ) : (
              <p className="mt-2 text-sm italic text-muted-foreground/80">Address being confirmed.</p>
            )}
            <div className="mt-6 flex flex-col gap-2">
              {b.phone && (
                <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110">
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call to book
                </a>
              )}
              <Link to="/locations/$slug" params={{ slug: b.slug }} className="min-h-11 rounded-full border border-border px-4 py-2 text-center text-sm font-semibold text-foreground hover:bg-muted">
                Branch details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}