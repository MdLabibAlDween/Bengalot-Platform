import type { ReactNode } from "react";

export function AccountHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="eyebrow flex items-center gap-2.5 text-indigo">
            <span className="h-px w-6 bg-gold" /> {eyebrow}
          </p>
        )}
        <h2 className="display-3 mt-2">{title}</h2>
        {description && (
          <p className="mt-2 max-w-xl text-[0.78rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
