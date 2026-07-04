import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/catering")({
  component: Catering,
  head: () => ({
    meta: [
      { title: "Catering — Meraki Cafe Lusaka" },
      { name: "description", content: "Meraki catering for offices, birthdays, weddings and events across Lusaka. Talk to us about menus, timings and delivery." },
      { property: "og:url", content: "/catering" },
    ],
    links: [{ rel: "canonical", href: "/catering" }],
  }),
});

function Catering() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">For groups big and small</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Catering by Meraki</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          From office breakfasts to wedding cakes — we cater across Lusaka. Tell us about your event and we'll put together a menu.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a href="tel:+260977000001" className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">Call Rhodespark</a>
          <Link to="/locations" className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">All branch numbers</Link>
        </div>
      </div>
    </div>
  );
}