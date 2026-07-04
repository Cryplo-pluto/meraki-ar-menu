import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/table-planner")({
  component: Planner,
  head: () => ({
    meta: [
      { title: "Table Planner — Will this feed everyone? | Meraki Cafe" },
      { name: "description", content: "See multiple Meraki dishes at correct relative scale on a virtual table before you order. Answer 'will this feed the five of us?' with confidence." },
      { property: "og:url", content: "/table-planner" },
    ],
    links: [{ rel: "canonical", href: "/table-planner" }],
  }),
});

function Planner() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Will this feed everyone?</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Plan a whole table</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A 3D table view where you can drop in multiple dishes at correct relative scale and see the whole spread before you order. Coming next.
        </p>
        <Link to="/menu" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">Browse the menu</Link>
      </div>
    </div>
  );
}