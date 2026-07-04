import { Link } from "@tanstack/react-router";
import type { MenuItem } from "@/lib/menu.functions";
import { formatKwacha } from "@/lib/format";
import { Box } from "lucide-react";

export function MenuCard({ item, hrefBase }: { item: MenuItem; hrefBase: string }) {
  const href = `${hrefBase}/${item.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card warm-shadow transition hover:-translate-y-0.5 hover:border-primary/40">
      <a href={href} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <img src={item.image_url} alt={item.image_alt || item.name} className="h-full w-full object-cover transition group-hover:scale-[1.03]" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 scrim-gradient p-3">
          <p className="text-xs font-medium text-white/95">{item.effective_dimensions_label || item.dimensions_label}</p>
        </div>
      </a>
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