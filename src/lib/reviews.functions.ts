import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabasePublicServer } from "./supabase-public";

export type Review = {
  id: string;
  author_first_name: string;
  body: string;
  rating: number;
  branch_slug: string | null;
  is_sample: boolean;
  sort_order: number;
};

export const listApprovedReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<Review[]> => {
    const sb = getSupabasePublicServer();
    const { data, error } = await sb
      .from("reviews")
      .select("id,author_first_name,body,rating,branch_slug,is_sample,sort_order")
      .eq("status", "approved")
      .order("sort_order")
      .limit(6);
    if (error) throw new Error(error.message);
    return (data ?? []) as Review[];
  },
);

const FeedbackInput = z.object({
  author_first_name: z.string().trim().min(1).max(60),
  body: z.string().trim().min(1).max(600),
  rating: z.number().int().min(1).max(5),
  branch_slug: z.string().trim().max(60).optional().or(z.literal("")),
});

/** Guest-submitted feedback. Always lands as status="pending" — never
 * appears in listApprovedReviews() until staff flip it to "approved". */
export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FeedbackInput.parse(d))
  .handler(async ({ data }) => {
    const sb = getSupabasePublicServer();
    const { error } = await sb.from("reviews").insert({
      author_first_name: data.author_first_name,
      body: data.body,
      rating: data.rating,
      branch_slug: data.branch_slug || null,
      status: "pending",
      is_sample: false,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
