import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabasePublicServer } from "./supabase-public";

// Mirrors the live /quote/request-a-quote form: contact details ("Your
// Details") plus a list of requested products ("Your Request").
const QuoteProduct = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(160),
  quantity: z.coerce.number().int().min(1).max(999),
});

const QuoteRequestInput = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().max(254).email(),
  phone: z.string().trim().min(6).max(20),
  street_address: z.string().trim().min(1).max(200),
  town_city: z.string().trim().min(1).max(120),
  products: z.array(QuoteProduct).min(1).max(30),
});

export type QuoteProductLine = z.infer<typeof QuoteProduct>;

export const sendQuoteRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => QuoteRequestInput.parse(d))
  .handler(async ({ data }) => {
    const sb = getSupabasePublicServer();
    const { error } = await sb.from("quote_requests").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      company: data.company || null,
      email: data.email,
      phone: data.phone,
      street_address: data.street_address,
      town_city: data.town_city,
      products: data.products,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
