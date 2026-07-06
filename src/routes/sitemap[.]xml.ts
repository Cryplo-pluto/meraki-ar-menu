import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listAllSlugs, listBranches } from "@/lib/menu.functions";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const BASE_URL = new URL(request.url).origin;
        const [slugs, branches] = await Promise.all([listAllSlugs(), listBranches()]);
        const cats = ["all-day-breakfast", "burgers", "bowls", "smoothies", "coffee", "sweets"];
        const staticPaths = ["/", "/menu", "/cakes", "/cake-builder", "/locations", "/catering", "/about", "/ar", "/table-planner", "/order"];
        const urls: string[] = [
          ...staticPaths.map((p) => `${BASE_URL}${p}`),
          ...cats.map((c) => `${BASE_URL}/menu/${c}`),
          ...branches.map((b) => `${BASE_URL}/locations/${b.slug}`),
          ...slugs.map((s: { slug: string; category: string }) =>
            s.category === "cakes" ? `${BASE_URL}/cakes/${s.slug}` : `${BASE_URL}/menu/${s.category}/${s.slug}`,
          ),
        ];
        const body = urls.map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});