import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribe, totalCount } from "@/lib/cart";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/cakes", label: "Cakes" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/catering", label: "Catering" },
  { to: "/gallery", label: "Gallery" },
] as const;

function CartBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(totalCount());
    return subscribe(() => setCount(totalCount()));
  }, []);
  return (
    <Link
      to="/order"
      className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full text-[var(--charcoal)] hover:bg-[var(--mint-tint)]"
      aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart, empty"}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      <span
        aria-live="polite"
        className={`absolute -right-0.5 -top-0.5 min-h-5 min-w-5 rounded-full bg-[var(--charcoal)] px-1 text-[10px] font-bold leading-5 text-[var(--cream)] ${count === 0 ? "sr-only" : ""}`}
      >
        {count === 0 ? "0 items in cart" : count}
      </span>
    </Link>
  );
}

function Wordmark() {
  return (
    <Link to="/" className="flex items-center" aria-label="Meraki Cafe home">
      <img src="/images/meraki/logo.png" alt="Meraki" className="h-11 w-auto" />
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--charcoal)]/10 bg-[var(--cream)]/95 backdrop-blur">
      <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:grid-cols-[auto_1fr_auto]">
        <Wordmark />
        <nav className="hidden lg:flex items-center justify-center gap-7" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-semibold uppercase tracking-wider text-[var(--charcoal)]/80 transition hover:text-[var(--charcoal)]"
              activeProps={{ className: "text-[var(--charcoal)] underline underline-offset-8" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/catering"
            className="hidden md:inline-flex min-h-11 items-center rounded-full border-2 border-[var(--charcoal)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] hover:bg-[var(--charcoal)] hover:text-[var(--cream)]"
          >
            Get a quote
          </Link>
          <Link
            to="/cake-builder"
            className="hidden md:inline-flex min-h-11 items-center rounded-full bg-[var(--mint)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--charcoal)] hover:brightness-95"
          >
            Order a cake
          </Link>
          <CartBadge />
          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--charcoal)] lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[var(--charcoal)]/10 bg-[var(--cream)] lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-md px-3 py-2 text-base font-semibold uppercase tracking-wider text-[var(--charcoal)] hover:bg-[var(--mint-tint)]"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                to="/catering"
                onClick={() => setOpen(false)}
                className="min-h-11 flex-1 rounded-full border-2 border-[var(--charcoal)] px-4 py-2 text-center text-xs font-bold uppercase tracking-wider text-[var(--charcoal)]"
              >
                Get a quote
              </Link>
              <Link
                to="/cake-builder"
                onClick={() => setOpen(false)}
                className="min-h-11 flex-1 rounded-full bg-[var(--mint)] px-4 py-2 text-center text-xs font-bold uppercase tracking-wider text-[var(--charcoal)]"
              >
                Order a cake
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
