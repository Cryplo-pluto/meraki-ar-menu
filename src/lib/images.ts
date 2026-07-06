/**
 * Real-asset guard.
 *
 * Production (owner uploads their own photos): only our own hosted assets pass.
 * Demo mode: curated free-stock hosts (Unsplash, Pexels) also pass, so the
 * menu looks complete in the pitch build. Every URL is still checked against
 * a small allowlist of hosts so we never render arbitrary third-party URLs.
 */

import { isDemoStockUrl } from "./demo-images";

/**
 * Meraki's own published photos, hosted on their Cloudinary account. Real
 * Meraki imagery, not stock — safe to mirror/reference directly. Excludes
 * "demo-restaurant" paths, which are unreplaced template stock Meraki's own
 * live site never swapped out (confirmed by inspecting their homepage HTML).
 */
export function isMerakiCloudinaryUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname === "res.cloudinary.com" &&
      u.pathname.startsWith("/davidharven/") &&
      !u.pathname.includes("demo-restaurant")
    );
  } catch {
    return false;
  }
}

function readEnv(name: string): string {
  // browser
  try {
    const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
    const v = meta?.env?.[name];
    if (typeof v === "string" && v.length > 0) return v;
  } catch {
    /* ignore */
  }
  // server
  if (typeof process !== "undefined" && process.env && typeof process.env[name] === "string") {
    return process.env[name] as string;
  }
  return "";
}

function getStorageBase(): string {
  const url = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
  if (!url) return "";
  return url.replace(/\/+$/, "") + "/storage/v1/object/public/";
}

export function isRealAsset(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith("/images/meraki/")) return true;
  const base = getStorageBase();
  if (base && trimmed.startsWith(base)) return true;
  if (isMerakiCloudinaryUrl(trimmed)) return true;
  if (isDemoStockUrl(trimmed)) return true;
  return false;
}

/** True only if the setting resolves to a URL we host ourselves. */
export function safeImageOrEmpty(url: string | null | undefined): string {
  return isRealAsset(url) ? (url as string) : "";
}
