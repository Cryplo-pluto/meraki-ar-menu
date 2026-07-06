import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CATERING_EVENT_TYPES, sendCateringRequest } from "@/lib/catering.functions";

export const Route = createFileRoute("/catering")({
  component: Catering,
  head: () => ({
    meta: [
      { title: "Catering Services — Meraki Cafe Lusaka" },
      {
        name: "description",
        content:
          "Meraki catering for weddings, corporate events, birthdays and more across Lusaka. Tell us about your event and we'll put together a menu.",
      },
      { property: "og:url", content: "/catering" },
    ],
    links: [{ rel: "canonical", href: "/catering" }],
  }),
});

function Catering() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      await sendCateringRequest({
        data: {
          full_name: String(form.get("full_name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          event_date: String(form.get("event_date") ?? ""),
          event_type: String(form.get("event_type") ?? "") as (typeof CATERING_EVENT_TYPES)[number],
          guests: Number(form.get("guests") ?? 0),
          requirements: String(form.get("requirements") ?? ""),
        },
      });
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setError("Could not submit your request — please try again or call a branch directly.");
    }
  }

  if (status === "sent") {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-4xl md:text-5xl">Request received!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Thank you — we'll be in touch shortly to talk through your event.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl">Catering Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Let us make your event special with our exceptional catering services
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="mx-auto mt-12 max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium">
              Full Name *
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              maxLength={120}
              className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone Number *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              maxLength={20}
              className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="event_date" className="block text-sm font-medium">
              Event Date *
            </label>
            <input
              id="event_date"
              name="event_date"
              type="date"
              required
              className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="event_type" className="block text-sm font-medium">
              Event Type *
            </label>
            <select
              id="event_type"
              name="event_type"
              required
              defaultValue=""
              className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="" disabled>
                Select Event Type
              </option>
              {CATERING_EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="guests" className="block text-sm font-medium">
              Number of Guests *
            </label>
            <input
              id="guests"
              name="guests"
              type="number"
              min={1}
              max={5000}
              required
              className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium">
            Special Requirements
          </label>
          <textarea
            id="requirements"
            name="requirements"
            maxLength={2000}
            rows={4}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="min-h-11 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
        >
          {status === "sending" ? "Submitting…" : "Submit Request"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
