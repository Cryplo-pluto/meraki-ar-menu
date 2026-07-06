import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { formatKwacha } from "@/lib/format";
import { getCart, setQty, clearCart, subscribe, type CartLine } from "@/lib/cart";

export const Route = createFileRoute("/order")({
  component: OrderPage,
  head: () => ({
    meta: [
      { title: "Order Online — Meraki Cafe Lusaka" },
      {
        name: "description",
        content:
          "Order Meraki food and cakes for pickup or delivery across Lusaka. Mobile Money and card payments.",
      },
      { property: "og:url", content: "/order" },
    ],
    links: [{ rel: "canonical", href: "/order" }],
  }),
});

function OrderPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [checkoutMessage, setCheckoutMessage] = useState(false);

  useEffect(() => {
    setLines(getCart());
    return subscribe(() => setLines(getCart()));
  }, []);

  const subtotal = lines.reduce((n, l) => n + l.qty * l.price_kwacha, 0);

  if (lines.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl">Your cart is empty</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tap "View in AR" or "Add to order" on any dish to add it here.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/menu"
              className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
            >
              Browse the menu
            </Link>
            <Link
              to="/locations"
              className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Branch numbers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl">Shopping cart</h1>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card warm-shadow">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 text-center font-semibold">Quantity</th>
                <th className="p-4 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.slug} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQty(line, 0)}
                        aria-label={`Remove ${line.name} from cart`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <img
                        src={line.image_url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <span className="font-medium">{line.name}</span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">{formatKwacha(line.price_kwacha)}</td>
                  <td className="p-4">
                    <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border px-2 py-1">
                      <button
                        type="button"
                        onClick={() => setQty(line, line.qty - 1)}
                        aria-label={`Decrease quantity of ${line.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span className="min-w-[1.5ch] text-center">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line, line.qty + 1)}
                        aria-label={`Increase quantity of ${line.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right font-semibold whitespace-nowrap">
                    {formatKwacha(line.qty * line.price_kwacha)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col items-end gap-6">
          <div className="w-full max-w-xs rounded-2xl bg-muted p-6">
            <div className="flex justify-between text-sm text-foreground/80">
              <span>Subtotal</span>
              <span>{formatKwacha(subtotal)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatKwacha(subtotal)}</span>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                clearCart();
                setCheckoutMessage(false);
              }}
              className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Empty cart
            </button>
            <button
              type="button"
              onClick={() => setCheckoutMessage(true)}
              className="min-h-11 rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:brightness-110"
            >
              Proceed to checkout
            </button>
          </div>

          {checkoutMessage && (
            <p className="w-full rounded-2xl bg-[var(--mint-tint)] p-4 text-right text-sm text-foreground/90">
              Full checkout with Mobile Money and card payments is on the way — call your nearest
              branch to place this order in the meantime.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
