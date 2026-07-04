import { createFileRoute, Link } from "@tanstack/react-router";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings.functions";

export const Route = createFileRoute("/about")({
  component: About,
  loader: async (): Promise<{ settings: SiteSettings }> => ({ settings: await getSiteSettings() }),
  head: () => ({
    meta: [
      { title: "Our Story — Meraki Cafe Lusaka" },
      { name: "description", content: "Meraki is a homemade cafe and cakery, serving Lusaka since 2008 from three branches: Rhodespark, Eastpark and Kabulonga." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  errorComponent: ({ error }) => <p className="container-page py-24">Could not load: {error.message}</p>,
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

function About() {
  const { settings } = Route.useLoaderData() as { settings: SiteSettings };
  const story = settings.story_md.trim();
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our home</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Cooked with soul, since 2008.</h1>
        {story ? (
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground/90">
            {story.split(/\n\n+/).map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-lg leading-relaxed text-foreground/90">
            Meraki is a homemade cafe and cakery, serving Lusaka since 2008 from three branches: Rhodespark, Eastpark and Kabulonga. We cook homemade food, bake cakes, and pour coffee — and every dish on this site can be viewed at true real-world size in AR.
          </p>
        )}
        <div className="mt-8">
          <Link to="/menu" className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">See the menu</Link>
        </div>
      </div>
    </div>
  );
}