import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
  head: () => ({
    meta: [
      { title: "Image & Model Credits — Meraki Cafe Lusaka" },
      {
        name: "description",
        content:
          "Attribution for stock photography and 3D model assets used in the Meraki Cafe demo build.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => (
    <p className="container-page py-24">Could not load: {error.message}</p>
  ),
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

const IMAGE_SOURCES = [
  {
    name: "Unsplash",
    url: "https://unsplash.com/license",
    note: "Free-to-use photography under the Unsplash License. Menu, hero and gallery imagery in the demo build are sourced from Unsplash contributors.",
  },
  {
    name: "Pexels",
    url: "https://www.pexels.com/license/",
    note: "Free stock photos and videos under the Pexels License. Used interchangeably with Unsplash where a matching dish or interior shot was available.",
  },
];

const MODEL_SOURCES = [
  {
    name: "Poly Pizza",
    url: "https://poly.pizza",
    note: "CC0 (public domain) 3D models. Reference GLBs for size classes (plate, bowl, cup, cake round) were sourced or adapted from Poly Pizza contributors.",
  },
  {
    name: "Sketchfab",
    url: "https://sketchfab.com",
    note: "Individual photoreal hero models may be sourced from Sketchfab creators under CC-BY 4.0. Each such model is credited to its author in the Meraki admin dashboard alongside the uploaded GLB.",
  },
  {
    name: "google/model-viewer",
    url: "https://modelviewer.dev/",
    note: "Apache 2.0 web component powering the AR and inline 3D previews on every product page.",
  },
];

function CreditsPage() {
  return (
    <div className="container-page py-16">
      <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">Credits</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Image &amp; Model Attribution</h1>
      <p className="mt-4 max-w-2xl text-[color:var(--muted-foreground)]">
        This is a concept build. Meraki's own food and interior photography will replace the stock
        imagery below once uploaded through the admin dashboard. All third-party assets used in the
        meantime are listed here in good faith.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Photography</h2>
        <ul className="mt-4 space-y-4">
          {IMAGE_SOURCES.map((s) => (
            <li
              key={s.name}
              className="rounded-2xl border border-[var(--charcoal)]/10 bg-[var(--paper)] p-5"
            >
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-lg text-[var(--charcoal)] underline underline-offset-4 hover:text-[var(--mint)]"
              >
                {s.name}
              </a>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{s.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">3D Models</h2>
        <ul className="mt-4 space-y-4">
          {MODEL_SOURCES.map((s) => (
            <li
              key={s.name}
              className="rounded-2xl border border-[var(--charcoal)]/10 bg-[var(--paper)] p-5"
            >
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-lg text-[var(--charcoal)] underline underline-offset-4 hover:text-[var(--mint)]"
              >
                {s.name}
              </a>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{s.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-16 text-sm text-[color:var(--muted-foreground)]">
        Questions about a specific asset?{" "}
        <Link to="/" className="underline underline-offset-4 hover:text-[var(--mint)]">
          Return home
        </Link>{" "}
        and reach out via the contact details in the footer.
      </p>
    </div>
  );
}
