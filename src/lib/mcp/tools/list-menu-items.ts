import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { isRealAsset } from "@/lib/images";

export default defineTool({
  name: "list_menu_items",
  title: "List menu items",
  description:
    "List Meraki Cafe menu items, optionally filtered by category (e.g. breakfast, mains, cakes). Returns name, slug, category, price in kwacha, description, dimensions label, and availability.",
  inputSchema: {
    category: z
      .string()
      .optional()
      .describe("Optional category slug to filter by."),
    signature_only: z
      .boolean()
      .optional()
      .describe("If true, only return signature dishes."),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Maximum number of items to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, signature_only, limit }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let query = supabase
      .from("menu_items")
      .select(
        "name, slug, category, price_kwacha, description, dimensions_label, is_available, is_signature, available_branches, allergens, image_url",
      )
      .eq("is_available", true)
      .order("sort_order", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 50, 1), 200));
    if (category) query = query.eq("category", category);
    if (signature_only) query = query.eq("is_signature", true);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const filtered = (data ?? []).filter((r) => isRealAsset((r as { image_url: string }).image_url));
    return {
      content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
      structuredContent: { items: filtered },
    };
  },
});