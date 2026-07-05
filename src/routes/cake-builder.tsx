import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatKwacha } from "@/lib/format";

export const Route = createFileRoute("/cake-builder")({
  component: CakeBuilder,
  head: () => ({
    meta: [
      { title: "Build Your Own Cake — Meraki Cafe Lusaka" },
      { name: "description", content: "Pick the size, sponge, filling and finish — we'll bake it exactly how you imagined it. Order by 12:00 for next-day collection." },
      { property: "og:url", content: "/cake-builder" },
    ],
    links: [{ rel: "canonical", href: "/cake-builder" }],
  }),
});

const SIZES = [
  { key: "6\"", label: "6-inch (serves 8)", price: 350 },
  { key: "8\"", label: "8-inch (serves 15)", price: 550 },
  { key: "10\"", label: "10-inch (serves 25)", price: 850 },
  { key: "12\"", label: "12-inch (serves 40)", price: 1200 },
];
const SPONGES = ["Vanilla", "Chocolate", "Red velvet", "Carrot", "Lemon"];
const FILLINGS = ["Vanilla buttercream", "Chocolate ganache", "Strawberry jam", "Salted caramel", "Cream cheese"];
const FINISHES = [
  { key: "buttercream", label: "Smooth buttercream", price: 0 },
  { key: "fondant", label: "Fondant finish", price: 150 },
  { key: "drip", label: "Chocolate drip + fresh fruit", price: 100 },
];

type Step = 1 | 2 | 3 | 4 | 5;

function CakeBuilder() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [size, setSize] = useState(SIZES[1].key);
  const [sponge, setSponge] = useState(SPONGES[0]);
  const [filling, setFilling] = useState(FILLINGS[0]);
  const [finish, setFinish] = useState(FINISHES[0].key);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [collectAt, setCollectAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const sizeObj = SIZES.find((s) => s.key === size)!;
  const finishObj = FINISHES.find((f) => f.key === finish)!;
  const total = sizeObj.price + finishObj.price;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const notes = `CAKE BUILDER — ${size} · ${sponge} sponge · ${filling} · ${finishObj.label}${message ? ` · Message on cake: "${message}"` : ""}`;
      const collectionNote = collectAt ? ` · Collection ${collectAt.replace("T", " ")}` : "";
      const { data, error: err } = await supabase
        .from("orders")
        .insert({
          branch_slug: "rhodespark",
          channel: "website",
          fulfillment: "pickup",
          status: "pending",
          payment_status: "pending",
          customer_name: name,
          customer_phone: phone,
          subtotal_kwacha: total,
          notes: (notes + collectionNote).slice(0, 1000),
        })
        .select("id, order_number")
        .single();
      if (err) throw err;
      setOrderId(data.order_number ?? data.id);
      setStep(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "Size" },
    { n: 2, label: "Sponge & filling" },
    { n: 3, label: "Finish" },
    { n: 4, label: "Details" },
  ];

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Custom cakes</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Build your own cake</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Order by 12:00 for next-day collection. Our team will call to confirm details and payment.
        </p>

        {step < 5 && (
          <ol className="mt-8 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {steps.map((s, i) => (
              <li key={s.n} className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step >= s.n ? "bg-[var(--mint)] text-white" : "bg-muted text-muted-foreground"}`}>{s.n}</span>
                <span className={step === s.n ? "text-foreground" : ""}>{s.label}</span>
                {i < steps.length - 1 && <span className="text-muted-foreground/40">—</span>}
              </li>
            ))}
          </ol>
        )}

        <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 warm-shadow md:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl">Pick a size</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {SIZES.map((s) => (
                  <button key={s.key} type="button" onClick={() => setSize(s.key)}
                    className={`rounded-2xl border p-4 text-left transition ${size === s.key ? "border-[var(--mint)] bg-[var(--mint-tint)]" : "border-border hover:border-primary/40"}`}>
                    <p className="font-semibold">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{formatKwacha(s.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl">Sponge</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SPONGES.map((s) => (
                    <button key={s} type="button" onClick={() => setSponge(s)}
                      className={`rounded-full border px-4 py-2 text-sm ${sponge === s ? "border-[var(--mint)] bg-[var(--mint-tint)]" : "border-border hover:border-primary/40"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-2xl">Filling</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FILLINGS.map((f) => (
                    <button key={f} type="button" onClick={() => setFilling(f)}
                      className={`rounded-full border px-4 py-2 text-sm ${filling === f ? "border-[var(--mint)] bg-[var(--mint-tint)]" : "border-border hover:border-primary/40"}`}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl">Finish</h2>
              <div className="grid gap-3">
                {FINISHES.map((f) => (
                  <button key={f.key} type="button" onClick={() => setFinish(f.key)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${finish === f.key ? "border-[var(--mint)] bg-[var(--mint-tint)]" : "border-border hover:border-primary/40"}`}>
                    <span className="font-semibold">{f.label}</span>
                    <span className="text-sm text-muted-foreground">{f.price === 0 ? "Included" : `+ ${formatKwacha(f.price)}`}</span>
                  </button>
                ))}
              </div>
              <div>
                <label className="mt-4 block text-sm font-medium">Message on the cake (optional)</label>
                <input value={message} onChange={(e) => setMessage(e.target.value.slice(0, 60))} maxLength={60}
                  placeholder="Happy Birthday Amara"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3" />
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl">Your details</h2>
              <div>
                <label className="block text-sm font-medium">Full name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone (we'll call to confirm)</label>
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
                  placeholder="+260 …"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium">Collection date & time</label>
                <input type="datetime-local" value={collectAt} onChange={(e) => setCollectAt(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3" />
              </div>
              <div className="rounded-2xl bg-[var(--mint-tint)] p-4 text-sm">
                <p className="font-semibold">Your cake</p>
                <p className="mt-1 text-muted-foreground">
                  {sizeObj.label} · {sponge} sponge · {filling} · {finishObj.label}
                  {message ? ` · "${message}"` : ""}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--charcoal)]">Total {formatKwacha(total)}</p>
              </div>
              {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            </div>
          )}
          {step === 5 && orderId && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--mint)] text-2xl text-white">✓</div>
              <h2 className="text-2xl">Order received</h2>
              <p className="text-muted-foreground">
                Reference <span className="font-mono">{orderId}</span>. We'll call {phone} within business hours to confirm your cake and take payment.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/cakes" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">See our cakes</Link>
                <button type="button" onClick={() => router.navigate({ to: "/" })} className="rounded-full bg-[var(--mint)] px-6 py-3 text-sm font-semibold text-white">Back home</button>
              </div>
            </div>
          )}

          {step < 5 && (
            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
                disabled={step === 1}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold disabled:opacity-40">Back</button>
              <p className="text-sm text-muted-foreground">Running total <span className="font-semibold text-foreground">{formatKwacha(total)}</span></p>
              {step < 4 ? (
                <button type="button" onClick={() => setStep((s) => ((s + 1) as Step))}
                  className="rounded-full bg-[var(--mint)] px-6 py-2 text-sm font-semibold text-white hover:brightness-95">Next</button>
              ) : (
                <button type="button" onClick={submit} disabled={submitting || !name || !phone}
                  className="rounded-full bg-[var(--mint)] px-6 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50">
                  {submitting ? "Sending…" : "Place order"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
