import { createServerFn } from "@tanstack/react-start";
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

export const listApprovedReviews = createServerFn({ method: "GET" }).handler(async (): Promise<Review[]> => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("reviews")
    .select("id,author_first_name,body,rating,branch_slug,is_sample,sort_order")
    .eq("status", "approved")
    .order("sort_order")
    .limit(6);
  if (error) throw new Error(error.message);
  return (data ?? []) as Review[];
});