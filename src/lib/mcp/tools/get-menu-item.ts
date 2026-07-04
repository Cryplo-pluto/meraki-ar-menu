import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export default defineTool({
  name: "get_menu_item",
  title: "Get menu item",
  description:
    "Fetch full details for a single Meraki Cafe menu item by slug, including AR model URLs, dimensions, allergens, and branch availability.",
  inputSchema: {
    slug: z.string().trim().min(1).describe("Menu item slug, e.g. 'butter-chicken'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("menu_items")
      .select(
        "name, slug, category, price_kwacha, description, image_url, image_alt, dimensions_label, width_cm, height_cm, depth_cm, glb_url, usdz_url, allergens, available_branches, is_available, is_signature",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!data) {
      return { content: [{ type: "text", text: `No menu item found with slug "${slug}".` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { item: data },
    };
  },
});