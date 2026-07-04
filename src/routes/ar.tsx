import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Camera, Ruler } from "lucide-react";

export const Route = createFileRoute("/ar")({
  component: ArExplainer,
  head: () => ({
    meta: [
      { title: "Our AR Menu — See Your Meal Before You Order | Meraki Cafe" },
      { name: "description", content: "Meraki's AR menu shows every dish on your own table at its actual serving size. Works on iPhone and Android — no app needed." },
      { property: "og:title", content: "Meraki's AR Menu" },
      { property: "og:url", content: "/ar" },
    ],
    links: [{ rel: "canonical", href: "/ar" }],
  }),
});

function ArExplainer() {
  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Meraki AR menu</p>
        <h1 className="mt-2 text-4xl md:text-6xl">See your meal before you order it.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Every dish on our menu can be placed, at actual serving size, on your own table using your phone camera. No app to install — just tap "View in AR".
        </p>
      </header>

      <ol className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
        <li className="rounded-2xl border border-border/60 bg-card p-6 warm-shadow">
          <Camera className="h-6 w-6 text-accent" />
          <h2 className="mt-4 text-xl">1. Open any dish</h2>
          <p className="mt-2 text-sm text-muted-foreground">Scan a QR at your table or tap any food photo on our menu.</p>
        </li>
        <li className="rounded-2xl border border-border/60 bg-card p-6 warm-shadow">
          <Box className="h-6 w-6 text-accent" />
          <h2 className="mt-4 text-xl">2. Tap View in AR</h2>
          <p className="mt-2 text-sm text-muted-foreground">Then slowly point your camera at the table. That's it.</p>
        </li>
        <li className="rounded-2xl border border-border/60 bg-card p-6 warm-shadow">
          <Ruler className="h-6 w-6 text-accent" />
          <h2 className="mt-4 text-xl">3. That's the actual size</h2>
          <p className="mt-2 text-sm text-muted-foreground">Walk around it, get closer — then order when you're hungry.</p>
        </li>
      </ol>

      <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground">
        Sizes shown are true to what arrives. We show a representative dish for each size class — plating may vary, but the portion doesn't.
      </p>

      <div className="mt-10 flex justify-center gap-3">
        <Link to="/menu" className="min-h-11 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">Try it on the menu</Link>
        <Link to="/table-planner" className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">Plan a whole table</Link>
      </div>
    </div>
  );
}