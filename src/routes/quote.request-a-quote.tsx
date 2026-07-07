import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { listMenuItems, type MenuItem } from "@/lib/menu.functions";
import { sendQuoteRequest, type QuoteProductLine } from "@/lib/quote.functions";
import { formatKwacha } from "@/lib/format";

export const Route = createFileRoute("/quote/request-a-quote")({
  component: QuoteRequest,
  loader: async (): Promise<{ items: MenuItem[] }> => ({ items: await listMenuItems() }),
  head: () => ({
    meta: [
      { title: "Request A Quote — Meraki Cafe Lusaka" },
      {
        name: "description",
        content:
          "Request a quotation from Meraki. Tell us who you are and which products you need, and we'll get back to you with pricing.",
      },
      { property: "og:url", content: "/quote/request-a-quote" },
    ],
    links: [{ rel: "canonical", href: "/quote/request-a-quote" }],
  }),
  errorComponent: ({ error }) => (
    <p className="container-page py-24">Could not load: {error.message}</p>
  ),
});

type ProductRow = { key: number; slug: string; quantity: number };

function QuoteRequest() {
  const { items } = Route.useLoaderData() as { items: MenuItem[] };
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<ProductRow[]>([{ key: 0, slug: "", quantity: 1 }]);
  const [nextKey, setNextKey] = useState(1);

  const addRow = () => {
    setRows((r) => [...r, { key: nextKey, slug: "", quantity: 1 }]);
    setNextKey((k) => k + 1);
  };
  const removeRow = (key: number) => setRows((r) => r.filter((row) => row.key !== key));
  const updateRow = (key: number, patch: Partial<ProductRow>) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const products: QuoteProductLine[] = rows
      .filter((r) => r.slug)
      .map((r) => {
        const it = items.find((i) => i.slug === r.slug);
        return { slug: r.slug, name: it?.name ?? r.slug, quantity: r.quantity };
      });
    if (products.length === 0) {
      setStatus("error");
      setError("Please add at least one product to your request.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await sendQuoteRequest({
        data: {
          first_name: String(form.get("first_name") ?? ""),
          last_name: String(form.get("last_name") ?? ""),
          company: String(form.get("company") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          street_address: String(form.get("street_address") ?? ""),
          town_city: String(form.get("town_city") ?? ""),
          products,
        },
      });
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Could not submit your request — please try again or call a branch directly.");
    }
  }

  if (status === "sent") {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-4xl md:text-5xl">Quotation request received!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Thank you — we&apos;ll be in touch shortly with your quote.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl">Request A Quote</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell us who you are and what you need — we&apos;ll come back to you with pricing.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="mx-auto mt-12 max-w-2xl space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <fieldset className="space-y-5">
          <legend className="font-display text-2xl">Your Details</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium">
                First Name *
              </label>
              <input
                id="first_name"
                name="first_name"
                required
                maxLength={80}
                className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium">
                Last Name *
              </label>
              <input
                id="last_name"
                name="last_name"
                required
                maxLength={80}
                className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="company" className="block text-sm font-medium">
                Company Name (optional)
              </label>
              <input
                id="company"
                name="company"
                maxLength={120}
                className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={254}
                className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={20}
                className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="street_address" className="block text-sm font-medium">
                Street Address *
              </label>
              <input
                id="street_address"
                name="street_address"
                required
                maxLength={200}
                className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="town_city" className="block text-sm font-medium">
                Town / City *
              </label>
              <input
                id="town_city"
                name="town_city"
                required
                maxLength={120}
                className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-2xl">Your Request</legend>
          {rows.map((row, i) => (
            <div key={row.key} className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor={`product-${row.key}`} className="block text-sm font-medium">
                  Product {i + 1}
                </label>
                <select
                  id={`product-${row.key}`}
                  value={row.slug}
                  onChange={(e) => updateRow(row.key, { slug: e.target.value })}
                  className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select a product</option>
                  {items.map((it) => (
                    <option key={it.slug} value={it.slug}>
                      {it.name} — {formatKwacha(it.price_kwacha)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label htmlFor={`qty-${row.key}`} className="block text-sm font-medium">
                  Qty
                </label>
                <input
                  id={`qty-${row.key}`}
                  type="number"
                  min={1}
                  max={999}
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(row.key, { quantity: Math.max(1, Number(e.target.value) || 1) })
                  }
                  className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  aria-label={`Remove product ${i + 1}`}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Product
          </button>
        </fieldset>

        <button
          type="submit"
          disabled={status === "sending"}
          className="min-h-11 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
        >
          {status === "sending" ? "Submitting…" : "Submit Quotation Request"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
