import type { MenuItem } from "@/lib/menu.functions";
import { formatKwacha } from "@/lib/format";
import { Box } from "lucide-react";
import { InteractiveModelCard } from "./InteractiveModelCard";

export function MenuCard({ item, hrefBase }: { item: MenuItem; hrefBase: string }) {
  const href = `${hrefBase}/${item.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card warm-shadow transition hover:-translate-y-0.5 hover:border-primary/40">
      <div className="relative">
        <InteractiveModelCard
          photoUrl={item.image_url}
          photoAlt={item.image_alt || item.name}
          glbUrl={item.effective_glb_url}
          usdzUrl={item.effective_usdz_url}
          itemName={item.name}
        />
        <a
          href={href}
          className="absolute inset-x-0 bottom-0 scrim-gradient p-3"
          aria-label={`View ${item.name} details`}
        >
          <p className="text-xs font-medium text-white/95">
            {item.effective_dimensions_label || item.dimensions_label}
          </p>
        </a>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <a href={href} className="text-base font-semibold text-foreground hover:text-primary">{item.name}</a>
          <span className="text-base font-semibold text-primary">{formatKwacha(item.price_kwacha)}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <a href={`${href}?ar=1`} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-110" aria-label={`View ${item.name} in AR`}>
          <Box className="h-4 w-4" aria-hidden="true" />
          View in AR
        </a>
      </div>
    </article>
  );
}