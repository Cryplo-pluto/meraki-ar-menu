import { useEffect, useRef, useState } from "react";
import { SafeImage } from "./SafeImage";

// Lazy-load model-viewer once on demand.
let mvLoaded = false;
async function ensureModelViewer() {
  if (mvLoaded || typeof window === "undefined") return;
  await import("@google/model-viewer");
  mvLoaded = true;
}

type Props = {
  photoUrl: string;
  photoAlt: string;
  glbUrl: string | null;
  usdzUrl?: string | null;
  itemName: string;
  autoLaunchAr?: boolean;
  aspect?: string; // tailwind aspect utility, e.g. "aspect-[4/3]"
};

/**
 * Item media card: always shows the photo — no on-page 3D orbit/zoom.
 * When the page is opened via the "View in AR" CTA (?ar=1 → autoLaunchAr),
 * an invisible <model-viewer> is mounted behind the photo purely to hand off
 * to the platform AR viewer (Scene Viewer on Android, Quick Look on iOS) as
 * soon as the model loads. Desktop and non-AR visits never load the model.
 */
export function InteractiveModelCard({
  photoUrl,
  photoAlt,
  glbUrl,
  usdzUrl,
  itemName,
  autoLaunchAr = false,
  aspect = "aspect-[4/3]",
}: Props) {
  const [mvReady, setMvReady] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const wantAr = autoLaunchAr && Boolean(glbUrl);

  useEffect(() => {
    if (!wantAr) return;
    let cancelled = false;
    ensureModelViewer().then(() => {
      if (!cancelled) setMvReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [wantAr]);

  useEffect(() => {
    if (!wantAr || !mvReady || !ref.current) return;
    const el = ref.current as unknown as {
      addEventListener: (ev: string, fn: () => void) => void;
      removeEventListener: (ev: string, fn: () => void) => void;
      activateAR?: () => Promise<void> | void;
      loaded?: boolean;
    };
    let launched = false;
    const launch = () => {
      if (launched || !el.activateAR) return;
      launched = true;
      try {
        void el.activateAR();
      } catch {
        /* browser blocked or unsupported */
      }
    };
    // The model may already be loaded by the time this effect runs.
    if (el.loaded) launch();
    el.addEventListener("load", launch);
    return () => el.removeEventListener("load", launch);
  }, [wantAr, mvReady]);

  return (
    <div className={`relative ${aspect} overflow-hidden rounded-2xl bg-[var(--mint-tint)]`}>
      <SafeImage
        src={photoUrl}
        alt={photoAlt}
        itemName={itemName}
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {wantAr && mvReady && (
        // Invisible AR launcher — sized so model-viewer initialises, but the
        // photo above stays the only thing the user sees or can touch.
        <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden="true">
          {/* @ts-expect-error custom element */}
          <model-viewer
            ref={ref}
            src={glbUrl!}
            ios-src={usdzUrl ?? undefined}
            alt={`AR launcher for ${itemName}`}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            reveal="auto"
            style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
          >
            {/* Suppress model-viewer's built-in AR button — AR is entered
                automatically via activateAR above. */}
            <button slot="ar-button" aria-hidden="true" tabIndex={-1} style={{ display: "none" }} />
            {/* @ts-expect-error custom element */}
          </model-viewer>
        </div>
      )}
    </div>
  );
}
