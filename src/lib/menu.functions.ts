import { createServerFn } from "@tanstack/react-start";
import { getSupabasePublicServer } from "./supabase-public";
import { isRealAsset } from "./images";

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
  is_hero: boolean;
  sort_order: number;
  // Effective AR values: fall back to size_class defaults when the item has none.
  effective_glb_url: string | null;
  effective_usdz_url: string | null;
  effective_dimensions_label: string;
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
  "id,slug,name,category,description,price_kwacha,image_url,image_alt,allergens,dimensions_label,glb_url,usdz_url,available_branches,is_available,is_signature,is_hero,sort_order,size_classes(reference_glb_url,reference_usdz_url,dimensions_label)";

type RawItem = Omit<MenuItem, "effective_glb_url" | "effective_usdz_url" | "effective_dimensions_label"> & {
  size_classes?: {
    reference_glb_url: string | null;
    reference_usdz_url: string | null;
    dimensions_label: string | null;
  } | null;
};

function shape(rows: RawItem[] | null): MenuItem[] {
  const list = (rows ?? []).map((r) => {
    const sc = r.size_classes ?? null;
    const item: MenuItem = {
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category,
      description: r.description,
      price_kwacha: r.price_kwacha,
      image_url: r.image_url,
      image_alt: r.image_alt,
      allergens: r.allergens,
      dimensions_label: r.dimensions_label,
      glb_url: r.glb_url,
      usdz_url: r.usdz_url,
      available_branches: r.available_branches,
      is_available: r.is_available,
      is_signature: r.is_signature,
      is_hero: r.is_hero ?? false,
      sort_order: r.sort_order,
      effective_glb_url: r.glb_url ?? sc?.reference_glb_url ?? null,
      effective_usdz_url: r.usdz_url ?? sc?.reference_usdz_url ?? null,
      effective_dimensions_label: r.dimensions_label || sc?.dimensions_label || "",
    };
    return item;
  });
  // TRUTH: never surface items whose photo isn't ours.
  return list.filter((it) => isRealAsset(it.image_url));
}

export const listMenuItems = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("menu_items")
    .select(ITEM_COLS)
    .eq("is_available", true)
    .order("category")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return shape(data as unknown as RawItem[]);
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
  return shape(data as unknown as RawItem[]);
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
  return shape(data as unknown as RawItem[]);
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
    if (!row) return null;
    const shaped = shape([row as unknown as RawItem]);
    return shaped[0] ?? null;
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
    return shape(rows as unknown as RawItem[]);
  });

export const listAllSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb.from("menu_items").select("slug,category,updated_at,image_url");
  if (error) throw new Error(error.message);
  // Sitemap must not advertise items without real photos.
  return (data ?? []).filter((r: { image_url: string }) => isRealAsset(r.image_url));
});