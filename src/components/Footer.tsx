import { Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";

// Only real, confirmed values render. Anything missing is hidden — never a
// placeholder phone/address (§0 Truth). Real socials linked in a new tab.
const SOCIALS = {
  facebook: "https://web.facebook.com/merakicafezm",
  instagram: "https://www.instagram.com/merakicentrolimited/",
};

const BRANCHES: { name: string; phone?: string }[] = [
  { name: "Rhodespark" },
  { name: "Eastpark" },
  { name: "Kabulonga" },
];

// Business hours in site_settings will replace this once the owner confirms.
// Rendering an empty block by default keeps the layout truthful.

export function Footer() {
  return (
    <footer className="mt-24 bg-[var(--charcoal)] text-[var(--cream)]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        {/* Business Hours */}
        <div className="md:col-span-3">
          <h2 className="font-display text-lg tracking-wider text-[var(--mint)]">
            Business Hours
          </h2>
          <p className="mt-3 text-sm text-[var(--cream)]/80">
            Confirmed opening times are published per branch on our{" "}
            <Link to="/locations" className="underline underline-offset-4 hover:text-[var(--mint)]">
              locations page
            </Link>
            .
          </p>
        </div>

        {/* Follow Us */}
        <div className="md:col-span-3">
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

        {/* Call Us — only render phones when confirmed. */}
        <div className="md:col-span-3">
          <h2 className="font-display text-lg tracking-wider text-[var(--mint)]">Call Us</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--cream)]/85">
            {BRANCHES.map((b) => (
              <li key={b.name}>
                <span className="font-semibold">{b.name}</span>{" "}
                {b.phone ? (
                  <a href={`tel:${b.phone}`} className="hover:text-[var(--mint)]">
                    {b.phone}
                  </a>
                ) : (
                  <span className="text-[var(--cream)]/60">— phone coming soon</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3">
          <h2 className="font-display text-lg tracking-wider text-[var(--mint)]">Quick Links</h2>
          <ul className="mt-3 grid grid-cols-2 gap-y-2 text-sm text-[var(--cream)]/85">
            <li><Link to="/" className="hover:text-[var(--mint)]">Home</Link></li>
            <li><Link to="/menu" className="hover:text-[var(--mint)]">Menu</Link></li>
            <li><Link to="/cakes" className="hover:text-[var(--mint)]">Cakes</Link></li>
            <li><Link to="/about" className="hover:text-[var(--mint)]">About</Link></li>
            <li><Link to="/catering" className="hover:text-[var(--mint)]">Catering</Link></li>
            <li><Link to="/gallery" className="hover:text-[var(--mint)]">Gallery</Link></li>
            <li><Link to="/locations" className="hover:text-[var(--mint)]">Locations</Link></li>
            <li><Link to="/contact" className="hover:text-[var(--mint)]">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--cream)]/10">
        <div className="container-page flex flex-col items-center gap-3 py-6 text-center">
          <span
            className="grid h-11 w-11 place-items-center rounded-full bg-[var(--mint)] text-[var(--charcoal)]"
            aria-hidden="true"
          >
            <span className="text-2xl leading-none">m</span>
          </span>
          <p className="text-xs text-[var(--cream)]/70">
            © {new Date().getFullYear()} Meraki Home. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}