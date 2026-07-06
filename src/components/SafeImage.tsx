import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  itemName: string;
  className?: string;
  loading?: "lazy" | "eager";
};

/**
 * <img> that never leaks raw alt text to the page: if the photo 404s, swap in
 * a mint-tinted placeholder with the item name centered instead of the
 * browser's broken-image icon + alt text.
 */
export function SafeImage({ src, alt, itemName, className = "", loading = "lazy" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--mint-tint)] p-4 text-center ${className}`}
      >
        <span className="font-display text-lg text-[var(--charcoal)]/70">{itemName}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
