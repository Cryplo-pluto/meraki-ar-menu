/**
 * Demo-mode stock hosts. Kept narrow: Unsplash and Pexels only, over HTTPS.
 * Both provide royalty-free imagery suitable for the pitch build.
 */
const DEMO_STOCK_HOSTS = new Set(["images.unsplash.com", "plus.unsplash.com", "images.pexels.com"]);

export function isDemoStockUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && DEMO_STOCK_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}
