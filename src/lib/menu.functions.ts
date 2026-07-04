import { createServerFn } from "@tanstack/react-start";
import { getSupabasePublicServer } from "./supabase-public";

export type MenuItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price_kwacha: number;
  image_url: string;
  image_alt: string;
  allergens: string[];
  dimensions_label: string;
  glb_url: string | null;
  usdz_url: string | null;
  available_branches: string[];
  is_available: boolean;
  is_signature: boolean;
  sort_order: number;
};

export type Branch = {
  slug: string;
  name: string;
  address: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  hours: Record<string, string>;
  sort_order: number;
};

const ITEM_COLS =
  "id,slug,name,category,description,price_kwacha,image_url,image_alt,allergens,dimensions_label,glb_url,usdz_url,available_branches,is_available,is_signature,sort_order";

export const listMenuItems = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("menu_items")
    .select(ITEM_COLS)
    .eq("is_available", true)
    .order("category")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as MenuItem[];
});

export const listSignatureItems = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("menu_items")
    .select(ITEM_COLS)
    .eq("is_signature", true)
    .eq("is_available", true)
    .order("sort_order")
    .limit(6);
  if (error) throw new Error(error.message);
  return (data ?? []) as MenuItem[];
});

export const listCakes = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("menu_items")
    .select(ITEM_COLS)
    .eq("category", "cakes")
    .eq("is_available", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as MenuItem[];
});

export const getItemBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = getSupabasePublicServer();
    const { data: row, error } = await sb
      .from("menu_items")
      .select(ITEM_COLS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as MenuItem | null;
  });

export const listBranches = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("branches")
    .select("slug,name,address,phone,lat,lng,hours,sort_order")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Branch[];
});

export const getBranchBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = getSupabasePublicServer();
    const { data: row, error } = await sb
      .from("branches")
      .select("slug,name,address,phone,lat,lng,hours,sort_order")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as Branch | null;
  });

export const listCategoryItems = createServerFn({ method: "GET" })
  .inputValidator((d: { category: string }) => d)
  .handler(async ({ data }) => {
    const sb = getSupabasePublicServer();
    const { data: rows, error } = await sb
      .from("menu_items")
      .select(ITEM_COLS)
      .eq("category", data.category)
      .eq("is_available", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (rows ?? []) as MenuItem[];
  });

export const listAllSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb.from("menu_items").select("slug,category,updated_at");
  if (error) throw new Error(error.message);
  return data ?? [];
});