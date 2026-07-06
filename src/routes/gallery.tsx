import { createFileRoute } from "@tanstack/react-router";
import { listMenuItems, type MenuItem } from "@/lib/menu.functions";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  loader: async (): Promise<{ items: MenuItem[] }> => ({ items: await listMenuItems() }),
  head: () => ({
    meta: [
      { title: "Our Gallery — Meraki Cafe Lusaka" },
      {
        name: "description",
        content:
          "A visual look at Meraki Cafe Lusaka's homemade dishes, cakes and coffee across our Rhodespark, Eastpark and Kabulonga branches.",
      },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
});

function GalleryPage() {
  const { items } = Route.useLoaderData() as { items: MenuItem[] };

  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Gallery</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Discover our culinary artistry</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A visual feast of our finest creations — homemade food, cakes, and coffee across all three
          branches.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="mx-auto mt-12 max-w-md text-center text-muted-foreground">
          We're curating our gallery — follow us on{" "}
          <a
            href="https://www.instagram.com/merakicentrolimited/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-accent"
          >
            Instagram
          </a>{" "}
          in the meantime.
        </p>
      ) : (
        <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {items.map((it) => (
            <img
              key={it.id}
              src={it.image_url}
              alt={it.image_alt || it.name}
              loading="lazy"
              className="w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
