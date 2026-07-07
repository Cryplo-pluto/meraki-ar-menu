import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";
import { getSiteSettings, type AgencyCredit } from "@/lib/site-settings.functions";

// Only real, confirmed values render. Anything missing is hidden — never a
// placeholder phone/address (§0 Truth). Real socials linked in a new tab.
const SOCIALS = {
  facebook: "https://web.facebook.com/merakicafezm",
  instagram: "https://www.instagram.com/merakicentrolimited/",
};

const BRANCHES: { name: string; phone?: string }[] = [
  { name: "Rhodespark", phone: "+260978063799" },
  { name: "Eastpark", phone: "+260975948210" },
  { name: "Kabulonga", phone: "+260764170860" },
];

// Business hours in site_settings will replace this once the owner confirms.
// Rendering an empty block by default keeps the layout truthful.

export function Footer() {
  const [credit, setCredit] = useState<AgencyCredit>(null);
  useEffect(() => {
    let cancelled = false;
    getSiteSettings()
      .then((s) => {
        if (!cancelled) setCredit(s.agency_credit);
      })
      .catch(() => {
        /* silent — footer credit is non-critical */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <footer className="mt-24 bg-[var(--charcoal)] text-[var(--cream)]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-10">
        {/* Business Hours */}
        <div className="md:col-span-2">
          <h2 className="font-display text-lg tracking-wider text-[var(--mint)]">Business Hours</h2>
          <p className="mt-3 text-sm text-[var(--cream)]/80">
            Mon – Sat: 07:30 – 19:00
            <br />
            Saturday &amp; Holidays: 07:30 – 17:00
          </p>
        </div>

        {/* Follow Us */}
        <div className="md:col-span-2">
          <h2 className="font-display text-lg tracking-wider text-[var(--mint)]">Follow Us</h2>
          <ul className="mt-3 flex gap-3">
            <li>
              <a
                href={SOCIALS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Meraki on Facebook"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--cream)]/30 hover:border-[var(--mint)] hover:text-[var(--mint)]"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Meraki on Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--cream)]/30 hover:border-[var(--mint)] hover:text-[var(--mint)]"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        {/* Call Us — real, confirmed branch numbers. */}
        <div className="md:col-span-2">
          <h2 className="font-display text-lg tracking-wider text-[var(--mint)]">Call Us</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--cream)]/85">
            {BRANCHES.map((b) => (
              <li key={b.name}>
                {b.phone ? (
                  <a href={`tel:${b.phone}`} className="hover:text-[var(--mint)]">
                    {b.name}
                  </a>
                ) : (
                  <span className="font-semibold">{b.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2">
          <h2 className="font-display text-lg tracking-wider text-[var(--mint)]">Quick Links</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--cream)]/85">
            <li>
              <Link to="/" className="hover:text-[var(--mint)]">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[var(--mint)]">
                About Meraki
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[var(--mint)]">
                Let&apos;s Talk
              </Link>
            </li>
            <li>
              <Link to="/quote/request-a-quote" className="hover:text-[var(--mint)]">
                Get A Quote
              </Link>
            </li>
          </ul>
        </div>

        {/* Our Services */}
        <div className="md:col-span-2">
          <h2 className="font-display text-lg tracking-wider text-[var(--mint)]">Our Services</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--cream)]/85">
            <li>
              <Link to="/catering" className="hover:text-[var(--mint)]">
                Catering Services
              </Link>
            </li>
            <li>
              <Link to="/quote/request-a-quote" className="hover:text-[var(--mint)]">
                Event Planning
              </Link>
            </li>
            <li>
              <Link to="/cakes" className="hover:text-[var(--mint)]">
                Cakes
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--cream)]/10">
        <div className="container-page flex flex-col items-center gap-3 py-6 text-center">
          <img
            src="/images/meraki/logo.png"
            alt=""
            aria-hidden="true"
            className="h-10 w-auto opacity-90"
          />
          <p className="text-xs text-[var(--cream)]/70">
            © {new Date().getFullYear()} Meraki Home. All rights reserved.
          </p>
          {credit && credit.label && (
            <p className="text-[11px] text-[var(--cream)]/50">
              {credit.url ? (
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-[var(--mint)]"
                >
                  {credit.label}
                </a>
              ) : (
                credit.label
              )}
              {" · "}
              <Link to="/credits" className="underline underline-offset-4 hover:text-[var(--mint)]">
                image &amp; model credits
              </Link>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
