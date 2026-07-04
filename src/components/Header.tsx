import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/cakes", label: "Cakes" },
  { to: "/locations", label: "Locations" },
  { to: "/ar", label: "AR menu" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Meraki Cafe home">
          <span className="font-display text-2xl font-bold tracking-tight text-primary">meraki</span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">Lusaka · since 2008</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm font-medium text-foreground/80 transition hover:text-primary" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/menu" className="min-h-11 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110">Order now</Link>
        </nav>
        <button type="button" className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="min-h-11 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}