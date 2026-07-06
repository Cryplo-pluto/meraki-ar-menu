import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabasePublicServer } from "./supabase-public";

// Real event-type options, transcribed from the live /catering page's select.
export const CATERING_EVENT_TYPES = [
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "Anniversary",
  "Other",
] as const;

const CateringRequestInput = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).email(),
  phone: z.string().trim().min(6).max(20),
  event_date: z.string().trim().min(1),
  event_type: z.enum(CATERING_EVENT_TYPES),
  guests: z.coerce.number().int().min(1).max(5000),
  requirements: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const sendCateringRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CateringRequestInput.parse(d))
  .handler(async ({ data }) => {
    const sb = getSupabasePublicServer();
    const { error } = await sb.from("catering_requests").insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      event_date: data.event_date,
      event_type: data.event_type,
      guests: data.guests,
      requirements: data.requirements || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
