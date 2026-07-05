import { useEffect, useRef, useState } from "react";
import { Box, Camera } from "lucide-react";

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
  defaultMode?: "photo" | "3d";
  aspect?: string; // tailwind aspect utility, e.g. "aspect-[4/3]"
  showChip?: boolean;
};

/**
 * Desktop interactive card: photo by default with a small "3D" chip.
 * Click the chip → swap the photo for an inline <model-viewer> the user can
 * drag to spin and scroll to zoom. Esc or the "Photo" chip returns to the
 * image. Model is only loaded when the user toggles into 3D, so the initial
 * paint stays photo-fast.
 *
 * On AR-capable mobile the primary CTA is still "View in AR" (rendered
 * elsewhere); this component complements it.
 */
export function InteractiveModelCard({
  photoUrl,
  photoAlt,
  glbUrl,
  usdzUrl,
  itemName,
  defaultMode = "photo",
  aspect = "aspect-[4/3]",
  showChip = true,
}: Props) {
  const [mode, setMode] = useState<"photo" | "3d">(glbUrl ? defaultMode : "photo");
  const [mvReady, setMvReady] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mode !== "3d" || !glbUrl) return;
    let cancelled = false;
    ensureModelViewer().then(() => {
      if (!cancelled) setMvReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, glbUrl]);

  useEffect(() => {
    if (mode !== "3d") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("photo");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const hasModel = Boolean(glbUrl);

  return (
    <div className={`relative ${aspect} overflow-hidden rounded-2xl bg-[var(--mint-tint)]`}>
      {mode === "photo" || !hasModel ? (
        <img
          src={photoUrl}
          alt={photoAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <>
          {/* @ts-expect-error custom element */}
          <model-viewer
            ref={ref}
            src={glbUrl!}
            ios-src={usdzUrl ?? undefined}
            poster={photoUrl}
            alt={`Interactive 3D preview of ${itemName}`}
            camera-controls
            touch-action="none"
            auto-rotate
            auto-rotate-delay="0"
            rotation-per-second="18deg"
            interaction-prompt="auto"
            disable-zoom={false}
            reveal={mvReady ? "auto" : "manual"}
            style={{ width: "100%", height: "100%", backgroundColor: "transparent", touchAction: "none", cursor: "grab" }}
          >
            <div slot="poster" className="h-full w-full">
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            </div>
          {/* @ts-expect-error */}
          </model-viewer>
        </>
      )}

      {showChip && hasModel && (
        <button
          type="button"
          onClick={() => setMode(mode === "photo" ? "3d" : "photo")}
          className="absolute right-3 top-3 z-10 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--charcoal)]/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--cream)] backdrop-blur transition hover:bg-[var(--charcoal)]"
          aria-pressed={mode === "3d"}
          aria-label={mode === "3d" ? "Switch back to photo" : `Rotate ${itemName} in 3D`}
        >
          {mode === "3d" ? (
            <>
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              Photo
            </>
          ) : (
            <>
              <Box className="h-3.5 w-3.5" aria-hidden="true" />
              3D
            </>
          )}
        </button>
      )}
    </div>
  );
}