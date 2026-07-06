import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Facebook, Instagram, MapPin } from "lucide-react";
import { sendContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us — Meraki Cafe Lusaka" },
      {
        name: "description",
        content:
          "Get in touch with Meraki Cafe Lusaka — Rhodespark, Eastpark and Kabulonga. Send a message or call your nearest branch.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const BRANCHES = [
  { name: "Rhodespark", phone: "+260978063799" },
  { name: "Eastpark", phone: "+260975948210" },
  { name: "Kabulonga", phone: "+260764170860" },
];

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      await sendContactMessage({
        data: {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          message: String(form.get("message") ?? ""),
        },
      });
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setError("Could not send your message — please try again or call a branch directly.");
    }
  }

  return (
    <div className="relative">
      <div className="container-page py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Simple. Fresh. Delicious.
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl">Get in touch</h1>
        </header>

        <div className="mt-12 max-w-6xl lg:mx-auto">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
            <div className="hidden lg:block" aria-hidden="true" />

            <form
              onSubmit={onSubmit}
              className="w-full space-y-4 rounded-2xl border border-border bg-card p-6 lg:w-[28rem]"
            >
              <h2 className="text-xl">Send a message</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  maxLength={120}
                  className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={254}
                  className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={20}
                  className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  maxLength={2000}
                  rows={5}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="min-h-11 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
              >
                {status === "sending" ? "Sending message…" : "Send message"}
              </button>
              <p aria-live="polite" className="text-sm">
                {status === "sent" && (
                  <span className="text-[var(--brand-green)]">
                    Thanks — we'll get back to you soon.
                  </span>
                )}
                {status === "error" && <span className="text-destructive">{error}</span>}
              </p>
            </form>

            <div className="space-y-8 lg:text-right">
              <div>
                <h2 className="text-xl">Business Hours</h2>
                <p className="mt-2 text-muted-foreground">
                  Mon – Sat: 07:30 – 19:00
                  <br />
                  Saturday &amp; Holidays: 07:30 – 17:00
                </p>
              </div>
              <div>
                <h2 className="text-xl">Follow Us</h2>
                <div className="mt-2 flex gap-3 lg:justify-end">
                  <a
                    href="https://web.facebook.com/merakicafezm"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Meraki on Facebook"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border hover:border-accent hover:text-accent"
                  >
                    <Facebook className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://www.instagram.com/merakicentrolimited/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Meraki on Instagram"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border hover:border-accent hover:text-accent"
                  >
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div>
                <h2 className="text-xl">Call Us</h2>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {BRANCHES.map((b) => (
                    <li key={b.name}>
                      <span className="font-semibold text-foreground">{b.name}</span>{" "}
                      <a href={`tel:${b.phone}`} className="hover:text-accent">
                        {b.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/locations"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:brightness-110"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                See us in person
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none absolute left-8 top-1/2 hidden -translate-y-1/2 select-none whitespace-nowrap text-left font-sans text-7xl font-black leading-[0.95] text-[var(--brand-cedar)] 2xl:block min-[1800px]:text-8xl"
      >
        Simple.
        <br />
        Fresh.
        <br />
        Delicious.
      </p>
    </div>
  );
}
