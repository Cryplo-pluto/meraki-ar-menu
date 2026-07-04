import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/order")({
  component: OrderPage,
  head: () => ({
    meta: [
      { title: "Order Online — Meraki Cafe Lusaka" },
      { name: "description", content: "Order Meraki food and cakes for pickup or delivery across Lusaka. Mobile Money and card payments." },
      { property: "og:url", content: "/order" },
    ],
    links: [{ rel: "canonical", href: "/order" }],
  }),
});

function OrderPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl">Order online</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Full checkout with Mobile Money and card payments is on the way. For now, tap through to any dish and call your nearest branch.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/menu" className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">Browse the menu</Link>
          <Link to="/locations" className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">Branch numbers</Link>
        </div>
      </div>
    </div>
  );
}