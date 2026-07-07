import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// "Stay in the Loop!" — replicates Meraki's popup:
// split card, image left, form right, mint accent circle, subscribe + "don't
// show this popup again" checkbox. Retimed: 30s or exit-intent (never on load).

const STORAGE_KEY = "meraki.newsletter.suppress.until";
const NEVER_KEY = "meraki.newsletter.never";
const SUPPRESS_DAYS = 30;
const DELAY_MS = 30_000;
const IMAGE_URL =
  "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=900&q=80&auto=format&fit=crop";

function isSuppressed(): boolean {
  if (typeof window === "undefined") return true;
  if (window.localStorage.getItem(NEVER_KEY) === "1") return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  return Number.isFinite(ts) && ts > Date.now();
}
function suppress() {
  if (typeof window === "undefined") return;
  const until = Date.now() + SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(STORAGE_KEY, String(until));
}
function suppressForever() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEVER_KEY, "1");
}

export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [never, setNever] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isSuppressed()) return;
    let fired = false;
    const fire = () => {
      if (!fired) {
        fired = true;
        setOpen(true);
      }
    };
    const t = window.setTimeout(fire, DELAY_MS);
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) fire();
    };
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    const node = dialogRef.current;
    const focusables = node?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables?.[0];
    const last = focusables?.[(focusables?.length ?? 1) - 1];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab" && focusables && focusables.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    if (never) suppressForever();
    else suppress();
    setOpen(false);
  }
  function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (never) suppressForever();
    else suppress();
    window.setTimeout(() => setOpen(false), 1600);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="absolute inset-0 bg-[var(--charcoal)]/60" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-title"
        aria-describedby="nl-desc"
        className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl md:grid-cols-2"
      >
        {/* Left: image (hidden on small screens for speed) */}
        <div className="relative hidden min-h-[380px] md:block">
          <img src={IMAGE_URL} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>

        {/* Right: form */}
        <div className="relative p-8 md:p-10">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mint-tint)] text-[var(--charcoal)] hover:brightness-95"
            aria-label="Close newsletter dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div
              className="mt-2 h-16 w-16 rounded-full bg-[var(--mint)] shadow-[0_0_0_10px_var(--mint-tint)]"
              aria-hidden="true"
            />
            <h2
              id="nl-title"
              className="mt-6 font-display text-3xl font-bold text-[var(--charcoal)]"
            >
              Stay in the Loop!
            </h2>
            <p id="nl-desc" className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              Subscribe and stand a chance to win 10% off your next order.
            </p>
          </div>

          {submitted ? (
            <p className="mt-8 rounded-2xl bg-[var(--mint-tint)] p-4 text-center text-sm text-[var(--charcoal)]">
              Thanks! We'll be in touch when there's something worth sharing.
            </p>
          ) : (
            <form onSubmit={onSubscribe} className="mt-8 space-y-4">
              <label htmlFor="nl-email" className="sr-only">
                Email address
              </label>
              <input
                id="nl-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-2xl border border-border bg-[var(--paper)] px-5 py-4 text-base placeholder:text-[color:var(--muted-foreground)] focus:border-[var(--mint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-[var(--mint)] px-5 py-4 text-base font-semibold text-white hover:brightness-95"
              >
                Subscribe Now
              </button>
              <label className="flex items-center justify-center gap-2 pt-2 text-sm text-[color:var(--muted-foreground)]">
                <input
                  type="checkbox"
                  checked={never}
                  onChange={(e) => setNever(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[var(--mint)]"
                />
                Don't show this popup again
              </label>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
