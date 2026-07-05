// Minimal client-side cart backed by localStorage. Server has no session yet;
// this only powers the header badge + order-sheet steppers on the home page.
// Checkout will re-compute all prices server-side (§8) before writing orders.

export type CartLine = {
  slug: string;
  name: string;
  price_kwacha: number;
  qty: number;
};

const KEY = "meraki.cart.v1";
const EVENT = "meraki:cart-change";

function safeRead(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        l && typeof l.slug === "string" && typeof l.name === "string" &&
        typeof l.price_kwacha === "number" && typeof l.qty === "number",
    );
  } catch {
    return [];
  }
}

function safeWrite(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getCart(): CartLine[] {
  return safeRead();
}

export function setQty(item: { slug: string; name: string; price_kwacha: number }, qty: number) {
  const bounded = Math.max(0, Math.min(50, Math.floor(qty)));
  const lines = safeRead();
  const idx = lines.findIndex((l) => l.slug === item.slug);
  if (bounded === 0) {
    if (idx >= 0) lines.splice(idx, 1);
  } else if (idx >= 0) {
    lines[idx] = { ...lines[idx], qty: bounded };
  } else {
    lines.push({ slug: item.slug, name: item.name, price_kwacha: item.price_kwacha, qty: bounded });
  }
  safeWrite(lines);
}

export function getQty(slug: string): number {
  return safeRead().find((l) => l.slug === slug)?.qty ?? 0;
}

export function totalCount(): number {
  return safeRead().reduce((n, l) => n + l.qty, 0);
}

export function subscribe(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => fn();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}