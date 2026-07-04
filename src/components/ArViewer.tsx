import { useEffect, useRef, useState } from "react";
import { Box } from "lucide-react";

// Load model-viewer as a side-effect once (client only).
let mvLoaded = false;
async function ensureModelViewer() {
  if (mvLoaded || typeof window === "undefined") return;
  await import("@google/model-viewer");
  mvLoaded = true;
}

type Props = {
  glbUrl: string | null | undefined;
  usdzUrl?: string | null;
  posterUrl: string;
  itemName: string;
  dimensionsLabel: string;
  autoLaunchAr?: boolean;
  className?: string;
};

/**
 * True-scale AR viewer.
 * - ar-scale="fixed" so real-world sizing cannot be pinch-scaled.
 * - Fallback ladder: AR → 3D spin (if model loads but AR unavailable) → poster + dimensions text.
 */
export function ArViewer({
  glbUrl,
  usdzUrl,
  posterUrl,
  itemName,
  dimensionsLabel,
  autoLaunchAr,
  className = "",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    ensureModelViewer().then(() => setReady(true));
    if (typeof window !== "undefined" && window.matchMedia) {
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
  }, []);

  useEffect(() => {
    if (!ready || !ref.current) return;
    const el = ref.current as unknown as {
      addEventListener: (ev: string, fn: () => void) => void;
      removeEventListener: (ev: string, fn: () => void) => void;
      activateAR?: () => Promise<void> | void;
    };
    const onError = () => setModelError(true);
    el.addEventListener("error", onError);
    let launched = false;
    const onLoad = () => {
      if (autoLaunchAr && !launched && el.activateAR) {
        launched = true;
        try {
          void el.activateAR();
        } catch {
          /* browser blocked or unsupported */
        }
      }
    };
    el.addEventListener("load", onLoad);
    return () => {
      el.removeEventListener("error", onError);
      el.removeEventListener("load", onLoad);
    };
  }, [ready, autoLaunchAr, glbUrl]);

  // Missing-model state (safety net; visible items always have an effective GLB).
  if (!glbUrl) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-muted ${className}`}>
        <img
          src={posterUrl}
          alt={itemName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 scrim-gradient">
          <p className="text-sm font-medium text-white">{dimensionsLabel}</p>
          <p className="text-xs text-white/85">
            3D preview coming soon — the size shown is exact: {dimensionsLabel}.
          </p>
        </div>
      </div>
    );
  }

  // Load error on an otherwise capable device.
  if (modelError) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-muted ${className}`}>
        <img
          src={posterUrl}
          alt={itemName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 scrim-gradient">
          <p className="text-sm font-medium text-white">{dimensionsLabel}</p>
          <p className="text-xs text-white/85">
            Your phone can't show this in AR yet — here's the photo with the real size noted.
          </p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-muted ${className}`}>
        <img
          src={posterUrl}
          alt={itemName}
          className="h-full w-full object-cover opacity-90"
          loading="lazy"
        />
      </div>
    );
  }

  // model-viewer custom element
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-muted warm-shadow ${className}`}>
      {/* @ts-expect-error — custom element */}
      <model-viewer
        ref={ref}
        src={glbUrl}
        ios-src={usdzUrl ?? undefined}
        poster={posterUrl}
        alt={`3D preview of ${itemName}, ${dimensionsLabel}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        camera-controls
        touch-action="pan-y"
        loading="lazy"
        reveal="auto"
        auto-rotate={reducedMotion ? undefined : true}
        rotation-per-second="20deg"
        interaction-prompt="none"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      >
        <button
          slot="ar-button"
          type="button"
          className="absolute bottom-4 left-1/2 z-10 flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground warm-shadow transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`View ${itemName} in augmented reality on your table`}
        >
          <Box className="h-4 w-4" aria-hidden="true" />
          View in AR
        </button>
        <div slot="poster" className="h-full w-full">
          <img src={posterUrl} alt={itemName} className="h-full w-full object-cover" />
        </div>
      {/* @ts-expect-error */}
      </model-viewer>
    </div>
  );
}