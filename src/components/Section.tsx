import type { ReactNode } from "react";

export function Section({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="container-page py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 text-3xl md:text-4xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
