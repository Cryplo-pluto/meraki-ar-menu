// SIMPLE. FRESH. DELICIOUS. strip — Meraki's signature between-section band.
// Duplicated content lets us translate -50% for a seamless loop.
// Respects prefers-reduced-motion via a global rule in styles.css.

type Props = {
  words?: string[];
  variant?: "solid" | "outline";
  className?: string;
};

export function Marquee({
  words = ["SIMPLE.", "FRESH.", "DELICIOUS."],
  variant = "solid",
  className = "",
}: Props) {
  const solid = variant === "solid";
  const bg = solid ? "bg-primary text-[var(--charcoal)]" : "bg-[var(--charcoal)] text-primary";
  const item = solid
    ? "text-[var(--charcoal)]"
    : "[-webkit-text-stroke:1.5px_var(--mint)] text-transparent";
  // Repeated well past any realistic viewport width (even ultrawide desktop)
  // so the -50% loop point always lands mid-pattern — no empty gap, no
  // visible "restart" moment, just a continuous scroll.
  const line = Array.from({ length: 16 }, () => words).flat();
  return (
    <div
      className={`overflow-hidden ${bg} border-y border-[var(--charcoal)]/10 py-4 ${className}`}
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max gap-10 font-display text-4xl md:text-5xl">
        {line.map((w, i) => (
          <span key={i} className={item}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
