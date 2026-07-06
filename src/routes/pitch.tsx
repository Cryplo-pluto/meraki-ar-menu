import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/pitch")({
  component: PitchPage,
  head: () => ({
    meta: [
      { title: "Meraki — Pitch Overview" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  errorComponent: ({ error }) => (
    <p className="container-page py-24">Could not load: {error.message}</p>
  ),
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

const BULLETS = [
  {
    title: "Faithful redesign",
    body: "Same warm cafe feel, brand voice and menu structure — rebuilt as a fast, mobile-first web experience.",
  },
  {
    title: "Order sheet + guest checkout",
    body: "Category chips, quantity steppers, sandbox checkout end-to-end. Orders land live in the admin inbox during the demo.",
  },
  {
    title: "Cake builder",
    body: "Multi-step wizard (type → shape → tiers → flavour → colour → branch → date → reference image → summary) with server-side price calc.",
  },
  {
    title: "AR on every item",
    body: "Photoreal 3D for hero dishes; size-class fallback for the rest. \"View in AR\" launches on iOS & Android over HTTPS.",
  },
  {
    title: "True-size promise",
    body: "Every AR model is scale-normalized to the physical dish so customers see real portion sizes on their table before ordering.",
  },
  {
    title: "QR table tents & shareables",
    body: "One QR per branch table, one per print ad — every scan tracked by channel in the analytics view.",
  },
  {
    title: "First in Zambia",
    body: "No other cafe in Zambia offers true-scale AR menus. Owned category, defensible for 12–18 months.",
  },
];

function PitchPage() {
  const [demoUrl, setDemoUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDemoUrl(`${window.location.origin}/menu/burgers/meraki-classic-burger?ar=1`);
    }
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[var(--cream)]">
      <div className="container-page py-12">
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">Pitch overview</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">What you're seeing.</h1>
          <p className="mt-3 max-w-2xl text-[color:var(--muted-foreground)]">
            A one-screen tour of the working Meraki concept build. Every capability below is
            live in this demo — try it on the projector, then scan the QR on your phone.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
          <ul className="grid gap-4 sm:grid-cols-2">
            {BULLETS.map((b) => (
              <li
                key={b.title}
                className="rounded-2xl border border-[var(--charcoal)]/10 bg-[var(--paper)] p-5 warm-shadow"
              >
                <p className="font-display text-lg text-[var(--charcoal)]">{b.title}</p>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{b.body}</p>
              </li>
            ))}
          </ul>

          <aside className="flex flex-col items-center gap-4 rounded-3xl bg-[var(--charcoal)] p-8 text-center text-[var(--cream)]">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">Scan me</p>
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-2xl bg-[var(--cream)] p-4">
              {demoUrl && (
                <QRCodeSVG
                  value={demoUrl}
                  size={220}
                  bgColor="#F1F2E3"
                  fgColor="#383832"
                  level="M"
                  includeMargin={false}
                />
              )}
            </div>
            <p className="max-w-[220px] text-sm text-[var(--cream)]/85">
              Opens the Meraki Classic Burger in AR — place it on the table you're sitting at.
            </p>
            <p className="break-all text-[10px] text-[var(--cream)]/50">{demoUrl}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}