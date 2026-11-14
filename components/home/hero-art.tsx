"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { Sparkles, Star } from "lucide-react";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeroEnterVars = CSSProperties & {
  "--hero-delay"?: string;
  "--hero-duration"?: string;
  "--hero-from-y"?: string;
  "--hero-from-rotate"?: string;
  "--hero-to-rotate"?: string;
  "--hero-from-scale"?: string;
};

function HeroEnter({
  children,
  className,
  delay = 0,
  duration = 900,
  fromY = 30,
  fromRotate = 0,
  toRotate = 0,
  fromScale = 1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  fromY?: number;
  fromRotate?: number;
  toRotate?: number;
  fromScale?: number;
}) {
  const style: HeroEnterVars = {
    "--hero-delay": `${delay}ms`,
    "--hero-duration": `${duration}ms`,
    "--hero-from-y": `${fromY}px`,
    "--hero-from-rotate": `${fromRotate}deg`,
    "--hero-to-rotate": `${toRotate}deg`,
    "--hero-from-scale": `${fromScale}`,
  };

  return (
    <div className={cn("hero-enter", className)} style={style}>
      {children}
    </div>
  );
}

function FloatingChip({
  children,
  className,
  delay = "0s",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute z-40 animate-[float-soft_8s_ease-in-out_infinite] rounded-full border border-line bg-cream/95 px-3.5 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.13em] text-ink shadow-[0_12px_28px_-18px_rgba(16,28,42,0.5)] backdrop-blur-sm ${className ?? ""}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

export function HeroArt() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 48, damping: 18, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 48, damping: 18, mass: 0.6 });

  const cardsX = useTransform(x, (value) => value * 18);
  const cardsY = useTransform(y, (value) => value * 14);
  const notionX = useTransform(x, (value) => value * -24);
  const notionY = useTransform(y, (value) => value * -18);
  const notebookX = useTransform(x, (value) => value * 10);
  const notebookY = useTransform(y, (value) => value * 8);
  const timerX = useTransform(x, (value) => value * 28);
  const timerY = useTransform(y, (value) => value * 20);
  const sunX = useTransform(x, (value) => value * -8);
  const sunY = useTransform(y, (value) => value * -8);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((event.clientX - rect.left) / rect.width - 0.5);
    rawY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onPointerLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto h-[32rem] w-full max-w-[38rem] select-none sm:h-[38rem] lg:h-[44rem] lg:max-w-none"
      aria-label="A composed scene of Bengalot study cards, a weekly notebook, a Notion study dashboard and a focus timer"
      role="img"
    >
      {/* soft stage */}
      <motion.div
        style={{ x: sunX, y: sunY }}
        className="absolute left-[16%] top-[10%] h-[62%] w-[78%] rounded-full bg-[radial-gradient(circle_at_38%_34%,#fbe9b4_0%,#f3c95f_45%,#eab84a_100%)] shadow-[0_40px_80px_-45px_rgba(118,85,16,0.5)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-[19%] top-[14%] h-[62%] w-[78%] rounded-full border border-ink/10"
        aria-hidden="true"
      />
      <div
        className="absolute -right-4 top-[42%] size-[52%] rounded-full border border-dashed border-teal/20"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[5%] left-[2%] hidden size-28 dot-paper opacity-30 sm:block"
        aria-hidden="true"
      />

      {/* notebook */}
      <motion.div
        style={{ x: notebookX, y: notebookY }}
        className="absolute right-[1%] top-[1%] z-10 w-[37%] sm:right-[2%] sm:w-[36%]"
      >
        <div className="animate-[float-soft_11s_ease-in-out_infinite] [animation-delay:1.1s]">
          <HeroEnter
            delay={360}
            fromY={46}
            fromRotate={12}
            toRotate={6}
            className="relative aspect-[3/3.8] overflow-hidden rounded-[1.6rem] bg-[linear-gradient(160deg,#e6def3_0%,#cec4e2_100%)] shadow-[0_34px_60px_-30px_rgba(52,42,72,0.55)]"
          >
            <span className="absolute inset-y-0 left-[10%] w-px bg-ink/10" />
            <span className="absolute inset-y-0 left-[12.5%] w-px bg-ink/[0.06]" />
            <div className="flex h-full flex-col justify-between p-[11%]">
              <div className="flex items-start justify-between">
                <span className="text-[0.5rem] font-extrabold uppercase tracking-[0.18em] text-ink/45">
                  Bengalot press
                </span>
                <span className="size-2 rounded-full bg-coral" />
              </div>
              <div>
                <p className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-ink/40">
                  No. 04 · Weekly
                </p>
                <p className="mt-1.5 font-display text-[1.5rem] leading-[0.92] tracking-[-0.045em] text-ink sm:text-[1.85rem]">
                  Make
                  <br />
                  room.
                </p>
                <span className="mt-2.5 block h-px w-8 bg-ink/25" />
                <p className="mt-2 text-[0.5rem] leading-relaxed text-ink/45">
                  A quiet plan for a clearer week.
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[0.44rem] font-extrabold uppercase tracking-[0.16em] text-ink/35">
                  Est. 2026
                </span>
                <span className="font-display text-[0.7rem] italic text-ink/45">
                  Faridpur
                </span>
              </div>
            </div>
          </HeroEnter>
        </div>
      </motion.div>

      {/* notion dashboard */}
      <motion.div
        style={{ x: notionX, y: notionY }}
        className="absolute right-[-1%] top-[51%] z-40 w-[50%] sm:right-[0%] sm:w-[49%]"
      >
        <div className="animate-[float-soft_9s_ease-in-out_infinite] [animation-delay:0.4s]">
          <HeroEnter
            delay={620}
            fromY={30}
            fromRotate={-4}
            toRotate={-2}
            className="overflow-hidden rounded-[1.35rem] border border-white/80 bg-cream shadow-[0_30px_58px_-28px_rgba(16,28,42,0.55)]"
          >
            <div className="flex items-center gap-1.5 border-b border-line bg-paper px-4 py-2.5">
              <span className="size-1.5 rounded-full bg-coral" />
              <span className="size-1.5 rounded-full bg-butter" />
              <span className="size-1.5 rounded-full bg-teal" />
              <span className="ml-2 h-1.5 w-24 rounded-full bg-line" />
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[0.46rem] font-extrabold uppercase tracking-[0.16em] text-teal">
                    Notion template
                  </p>
                  <p className="mt-1 font-display text-[1.15rem] leading-[0.95] tracking-[-0.03em] text-ink sm:text-[1.35rem]">
                    A clear day ahead.
                  </p>
                </div>
                <span className="grid size-7 place-items-center rounded-lg bg-teal text-cream">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-3.5 space-y-1.5">
                {[
                  ["Finish chapter 04", "09:00"],
                  ["English · 20 new cards", "11:30"],
                  ["Review biology notes", "16:00"],
                ].map(([task, time], index) => (
                  <div
                    key={task}
                    className="flex items-center gap-2 rounded-lg border border-line/80 bg-surface px-2.5 py-1.5"
                  >
                    <span
                      className={`grid size-3.5 place-items-center rounded-[0.3rem] border ${index === 0 ? "border-teal bg-teal" : "border-line-strong bg-cream"}`}
                    >
                      {index === 0 ? (
                        <span className="size-1 rounded-full bg-cream" />
                      ) : null}
                    </span>
                    <span
                      className={`flex-1 text-[0.54rem] font-medium sm:text-[0.6rem] ${index === 0 ? "text-ink/40 line-through" : "text-ink/75"}`}
                    >
                      {task}
                    </span>
                    <span className="text-[0.46rem] font-semibold text-muted">
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </HeroEnter>
        </div>
      </motion.div>

      {/* flashcard stack */}
      <motion.div
        style={{ x: cardsX, y: cardsY }}
        className="absolute bottom-[6%] left-[-1%] z-30 w-[52%] sm:bottom-[8%] sm:left-[0%] sm:w-[50%]"
      >
        <div className="animate-[float-soft_10s_ease-in-out_infinite] [animation-delay:0.9s]">
          <div className="relative aspect-[3/3.7]">
            <div className="absolute inset-0 -rotate-[13deg] rounded-[1.2rem] border border-ink/5 bg-[#0d6f6d] shadow-xl" />
            <div className="absolute inset-0 rotate-[5deg] rounded-[1.2rem] border border-ink/5 bg-coral shadow-lg" />
            <HeroEnter
              delay={500}
              fromY={46}
              fromRotate={-8}
              toRotate={-3}
              className="absolute inset-0 overflow-hidden rounded-[1.2rem] border border-line bg-[#ffffff] p-[8%] shadow-[0_30px_60px_-26px_rgba(16,28,42,0.48)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.45rem] font-extrabold uppercase tracking-[0.18em] text-ink-soft">
                  Bengalot · study cards
                </span>
                <Star className="size-2.5 fill-coral text-coral" aria-hidden="true" />
              </div>
              <p className="mt-[24%] font-display text-[2.55rem] italic leading-[0.9] tracking-[-0.055em] text-ink sm:text-[3.2rem]">
                seren-
                <br />
                dipity
              </p>
              <p className="mt-2 text-[0.55rem] font-semibold tracking-[0.04em] text-ink-soft sm:text-[0.65rem]">
                /ˌser.ənˈdɪp.ə.ti/
              </p>
              <div className="mt-[8%] h-px bg-line" />
              <p className="mt-[5%] text-[0.52rem] leading-relaxed text-ink-soft sm:text-[0.6rem]">
                Turn the card. Say the meaning before you check.
              </p>
              <div className="absolute inset-x-[8%] bottom-[7%] flex items-center justify-between">
                <span className="text-[0.43rem] font-extrabold uppercase tracking-[0.16em] text-ink/60">
                  English vocabulary
                </span>
                <span className="text-[0.46rem] font-bold text-ink/60">01 / 120</span>
              </div>
            </HeroEnter>
          </div>
        </div>
      </motion.div>

      {/* timer */}
      <motion.div
        style={{ x: timerX, y: timerY }}
        className="absolute bottom-[0%] right-[1%] z-40 w-[27%] sm:bottom-[-2%] sm:right-[3%] sm:w-[24%]"
      >
        <div className="animate-[float-soft_8.5s_ease-in-out_infinite] [animation-delay:1.5s]">
          <HeroEnter
            delay={780}
            duration={800}
            fromY={12}
            fromRotate={14}
            toRotate={7}
            fromScale={0.8}
            className="relative aspect-square rounded-full border border-line bg-[radial-gradient(circle_at_35%_28%,#ffffff,#dfe7e4)] p-[12%] shadow-[0_24px_44px_-20px_rgba(16,28,42,0.5)]"
          >
            <span className="absolute left-1/2 top-[2%] h-[8%] w-[12%] -translate-x-1/2 rounded-t-full border border-line bg-cream" />
            <div className="flex h-full flex-col items-center justify-center rounded-full bg-[#f7f9f8] shadow-[inset_0_4px_10px_rgba(0,0,0,0.12)]">
              <span className="text-[0.38rem] font-extrabold uppercase tracking-[0.14em] text-muted">
                Focus
              </span>
              <span className="mt-0.5 font-display text-[1.35rem] leading-none tracking-[-0.05em] text-ink sm:text-[1.65rem]">
                25:00
              </span>
              <span className="mt-1 text-[0.36rem] font-bold uppercase tracking-[0.12em] text-teal">
                one hour
              </span>
            </div>
          </HeroEnter>
        </div>
      </motion.div>

      {/* labels */}
      <HeroEnter
        delay={1050}
        duration={700}
        fromY={8}
        toRotate={0}
        className="absolute left-0 top-[3%] z-40"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-cream/90 px-3 py-1.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-ink shadow-sm backdrop-blur">
          <span className="size-1.5 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-teal" />
          Tools for a clearer day
        </span>
      </HeroEnter>

      <FloatingChip className="left-[31%] top-[8%] hidden sm:block" delay="2s">
        Durable paper
      </FloatingChip>
    </div>
  );
}

