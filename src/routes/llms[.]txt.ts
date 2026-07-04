import { createFileRoute } from "@tanstack/react-router";
import { listBranches, listMenuItems } from "@/lib/menu.functions";
import { getSiteSettings } from "@/lib/site-settings.functions";
import { CATEGORY_ORDER, categoryLabel } from "@/lib/format";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const [branches, items, settings] = await Promise.all([
          listBranches(),
          listMenuItems(),
          getSiteSettings(),
        ]);

        const lines: string[] = [];
        lines.push("# Meraki Cafe Lusaka");
        lines.push("");
        const story = settings.story_md.trim();
        if (story) {
          lines.push(story);
        } else {
          lines.push("Homemade cafe and cakery operating since 2008 with three branches in Lusaka, Zambia.");
        }
        lines.push("");

        // Branches — omit any field that is empty/unconfirmed.
        lines.push("## Branches");
        for (const b of branches) {
          const parts: string[] = [b.name];
          if (b.address && b.address !== "Address to be confirmed") parts.push(b.address);
          if (b.phone) parts.push(b.phone);
          lines.push(`- ${parts.join(" — ")}`);
        }
        lines.push("");

        // Hours — only if the owner has confirmed them.
        const hoursEntries = Object.entries(settings.confirmed_hours ?? {});
        if (hoursEntries.length > 0) {
          lines.push("## Hours");
          for (const [day, hrs] of hoursEntries) lines.push(`- ${day}: ${hrs}`);
          lines.push("");
        }

        // Menu categories present.
        const cats = new Set(items.map((i) => i.category));
        const orderedCats = [...CATEGORY_ORDER.filter((c) => cats.has(c)), ...[...cats].filter((c) => !CATEGORY_ORDER.includes(c))];
        if (orderedCats.length > 0) {
          lines.push("## Menu categories");
          for (const c of orderedCats) lines.push(`- ${categoryLabel(c)}`);
          lines.push("");
        }

        // Socials.
        const s = settings.socials ?? {};
        const socialLines: string[] = [];
        if (s.facebook) socialLines.push(`- Facebook: ${s.facebook}`);
        if (s.instagram) socialLines.push(`- Instagram: ${s.instagram}`);
        if (s.website) socialLines.push(`- Website: ${s.website}`);
        if (socialLines.length > 0) {
          lines.push("## Follow us");
          lines.push(...socialLines);
          lines.push("");
        }

        lines.push("## AR menu");
        lines.push("Every dish on the site can be viewed at true real-world size in AR from any modern iPhone or Android — no app required.");
        lines.push("");
        lines.push("## Currency");
        lines.push("All prices are in Zambian Kwacha, formatted as K450.");
        lines.push("");

        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});