import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { isRealAsset } from "@/lib/images";

export default defineTool({
  name: "list_cakes",
  title: "List cakes",
  description:
    "List Meraki Cakery cakes with name, slug, price in kwacha, description, and dimensions.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .optional()
      .describe("Maximum number of cakes to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("menu_items")
      .select("name, slug, price_kwacha, description, dimensions_label, allergens, is_available, image_url")
      .eq("category", "cakes")
      .eq("is_available", true)
      .order("sort_order", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 50, 1), 200));
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const filtered = (data ?? []).filter((r) => isRealAsset((r as { image_url: string }).image_url));
    return {
      content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
      structuredContent: { cakes: filtered },
    };
  },
});