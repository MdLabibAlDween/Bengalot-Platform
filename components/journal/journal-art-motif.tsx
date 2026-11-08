import { cn } from "@/lib/utils";

export function JournalArtMotif({
  theme,
  index,
  className,
}: {
  theme: "teal" | "coral" | "lavender";
  index: string;
  className?: string;
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <span className="absolute right-5 top-3 font-display text-[3.5rem] italic leading-none text-current opacity-[0.18]">
        {index}
      </span>
      {theme === "teal" ? (
        <>
          <span className="absolute -right-8 -top-10 size-40 rounded-full border border-current/25" />
          <span className="absolute right-14 top-6 size-16 rounded-full border border-dashed border-current/30" />
          <span className="absolute bottom-8 left-6 flex items-center gap-2 opacity-40">
            <span className="h-px w-8 bg-current" />
            <span className="size-1 rounded-full bg-current" />
            <span className="h-px w-4 bg-current" />
          </span>
        </>
      ) : null}
      {theme === "coral" ? (
        <>
          <span className="absolute -bottom-8 -left-8 size-36 rounded-full border border-current/25" />
          <span className="absolute bottom-5 right-8 h-16 w-14 rotate-[8deg] rounded-md border border-current/20 bg-current/10" />
          <span className="absolute bottom-10 right-[4.7rem] h-16 w-14 rotate-[-4deg] rounded-md border border-current/20 bg-current/10" />
          <span className="absolute right-4 top-12 h-px w-16 bg-current opacity-25" />
          <span className="absolute right-4 top-14 h-px w-10 bg-current opacity-25" />
        </>
      ) : null}
      {theme === "lavender" ? (
        <>
          <span className="absolute -right-6 bottom-[-14%] h-28 w-20 rotate-[11deg] rounded-lg border border-current/20 bg-current/10" />
          <span className="absolute right-12 bottom-[-10%] h-28 w-20 rotate-[-3deg] rounded-lg border border-current/20 bg-current/10" />
          <span className="absolute right-24 bottom-[8%] h-28 w-20 rotate-[-12deg] rounded-lg border border-current/25 bg-current/15" />
          <span className="absolute left-8 top-8 size-3 rounded-full border border-current/35" />
        </>
      ) : null}
    </div>
  );
}
