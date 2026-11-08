const words = [
  "Bring a lot to learning",
  "Study cards",
  "Notion templates",
  "Printed planners",
  "Quiet focus tools",
  "Made in Bangladesh",
];

export function MarqueeStrip() {
  return (
    <section
      aria-label="Bengalot — bring a lot to learning"
      className="relative overflow-hidden bg-ivory py-7 sm:py-9"
    >
      <div className="-ml-[3%] w-[106%] -rotate-[1.4deg] border-y border-ink/10 bg-butter">
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track items-center py-3 sm:py-3.5">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {words.map((word, index) => (
                  <span
                    key={`${copy}-${word}`}
                    className="flex items-center gap-5 px-5 font-display text-[0.98rem] leading-none tracking-[-0.02em] text-ink sm:gap-7 sm:px-7 sm:text-[1.18rem]"
                  >
                    {index === 0 ? (
                      <span className="italic">{word}</span>
                    ) : (
                      <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink/70">
                        {word}
                      </span>
                    )}
                    <svg
                      viewBox="0 0 16 16"
                      className="size-3 text-coral"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 0 9.7 6.3 16 8l-6.3 1.7L8 16 6.3 9.7 0 8l6.3-1.7Z" />
                    </svg>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
