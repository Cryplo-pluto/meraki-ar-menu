import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabasePublicServer } from "./supabase-public";

const ContactMessageInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).email().optional().or(z.literal("")),
  phone: z.string().trim().min(6).max(20).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ContactMessageInput.parse(d))
  .handler(async ({ data }) => {
    const sb = getSupabasePublicServer();
    const { error } = await sb.from("contact_messages").insert({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
