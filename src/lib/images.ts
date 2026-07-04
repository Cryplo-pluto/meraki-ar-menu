/**
 * Real-asset guard. Only images we host ourselves count for public rendering.
 *   - Our own Supabase storage public path (VITE_SUPABASE_URL/storage/v1/object/public/*)
 *   - Our own /images/meraki/* static assets
 *
 * Works on both server (process.env.SUPABASE_URL) and client
 * (import.meta.env.VITE_SUPABASE_URL) so the same predicate can filter server-side
 * lists AND gate <img> renders in components.
 */

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
  const url =
    readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
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
  return false;
}

/** True only if the setting resolves to a URL we host ourselves. */
export function safeImageOrEmpty(url: string | null | undefined): string {
  return isRealAsset(url) ? (url as string) : "";
}