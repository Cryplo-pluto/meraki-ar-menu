import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// "Stay in the Loop!" — replicates Meraki's popup visually but is retimed:
// fires at 30s or exit-intent (never on load). Focus-trapped dialog, Esc
// closes, focus returns. Suppressed 30 days after dismiss/subscribe.

const STORAGE_KEY = "meraki.newsletter.suppress.until";
const SUPPRESS_DAYS = 30;
const DELAY_MS = 30_000;

function isSuppressed(): boolean {
  if (typeof window === "undefined") return true;
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

export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Timer + exit-intent, guarded by suppression cookie.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isSuppressed()) return;

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      setOpen(true);
    };

    const t = window.setTimeout(fire, DELAY_MS);

    const onLeave = (e: MouseEvent) => {
      // Exit-intent: pointer leaves through the top of the viewport.
      if (e.clientY <= 0) fire();
    };
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Focus trap + Esc + focus restore.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    const node = dialogRef.current;
    const focusables = node
      ? node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
      : null;
    const first = focusables?.[0];
    const last = focusables?.[focusables.length - 1];
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
    suppress();
    setOpen(false);
  }

  function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Server-side subscribe is wired later (§8: server-verified captcha,
    // rate-limited, UNIQUE email). For now: acknowledge visually + suppress.
    setSubmitted(true);
    suppress();
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
        className="relative w-full max-w-md rounded-3xl bg-[var(--paper)] p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-[var(--charcoal)] hover:bg-[var(--mint-tint)]"
          aria-label="Close newsletter dialog"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--mint)]">
          Meraki news
        </p>
        <h2 id="nl-title" className="mt-2 font-display text-3xl">
          Stay in the Loop!
        </h2>
        <p id="nl-desc" className="mt-3 text-sm text-[color:var(--muted-foreground)]">
          New menu drops, seasonal cakes and quiet-time offers — straight to your inbox. No spam.
        </p>
        {submitted ? (
          <p className="mt-6 rounded-2xl bg-[var(--mint-tint)] p-4 text-sm text-[var(--charcoal)]">
            Thanks! We'll be in touch when there's something worth sharing.
          </p>
        ) : (
          <form onSubmit={onSubscribe} className="mt-6 space-y-3">
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
              placeholder="you@example.com"
              className="w-full rounded-full border border-border bg-[var(--paper)] px-5 py-3 text-base focus:border-[var(--mint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
            />
            <button
              type="submit"
              className="w-full min-h-11 rounded-full bg-[var(--mint)] px-5 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--charcoal)] hover:brightness-95"
            >
              Subscribe now
            </button>
            <button
              type="button"
              onClick={close}
              className="w-full text-sm text-[color:var(--muted-foreground)] hover:text-[var(--charcoal)]"
            >
              Maybe later
            </button>
          </form>
        )}
      </div>
    </div>
  );
}