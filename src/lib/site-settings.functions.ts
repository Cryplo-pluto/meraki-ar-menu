import { createServerFn } from "@tanstack/react-start";
import { getSupabasePublicServer } from "./supabase-public";

export type Socials = {
  facebook?: string;
  instagram?: string;
  website?: string;
};

export type AgencyCredit = { label: string; url: string } | null;

export type SiteSettings = {
  hero_image_url: string;
  cakes_teaser_image_url: string;
  builder_teaser_image_url: string;
  story_md: string;
  vision: string;
  mission: string;
  values: string;
  products_services_md: string;
  socials: Socials;
  confirmed_hours: Record<string, string>;
  agency_credit: AgencyCredit;
};

const DEFAULTS: SiteSettings = {
  hero_image_url: "",
  cakes_teaser_image_url: "",
  builder_teaser_image_url: "",
  story_md: "",
  vision: "",
  mission: "",
  values: "",
  products_services_md: "",
  socials: {},
  confirmed_hours: {},
  agency_credit: null,
};

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const sb = getSupabasePublicServer();
    const { data, error } = await sb.from("site_settings").select("key,value");
    if (error) throw new Error(error.message);
    const out: SiteSettings = { ...DEFAULTS };
    for (const row of data ?? []) {
      const v = (row as { key: string; value: unknown }).value;
      switch ((row as { key: string }).key) {
        case "hero_image_url":
          if (typeof v === "string") out.hero_image_url = v;
          break;
        case "cakes_teaser_image_url":
          if (typeof v === "string") out.cakes_teaser_image_url = v;
          break;
        case "builder_teaser_image_url":
          if (typeof v === "string") out.builder_teaser_image_url = v;
          break;
        case "story_md":
          if (typeof v === "string") out.story_md = v;
          break;
        case "vision":
          if (typeof v === "string") out.vision = v;
          break;
        case "mission":
          if (typeof v === "string") out.mission = v;
          break;
        case "values":
          if (typeof v === "string") out.values = v;
          break;
        case "products_services_md":
          if (typeof v === "string") out.products_services_md = v;
          break;
        case "socials":
          if (v && typeof v === "object") out.socials = v as Socials;
          break;
        case "confirmed_hours":
          if (v && typeof v === "object") out.confirmed_hours = v as Record<string, string>;
          break;
        case "agency_credit":
          if (v && typeof v === "object" && "label" in (v as object)) {
            out.agency_credit = v as AgencyCredit;
          }
          break;
      }
    }
    return out;
  },
);
