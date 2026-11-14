"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  once = true,
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px", amount }}
      transition={{
        duration: 0.62,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealScale({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MaskedLine({
  children,
  className,
  delay = 0,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={cn("block", className)}>{children}</span>;
  }

  if (immediate) {
    return (
      <span className={cn("masked-line", className)}>
        <span
          className="line-rise block"
          style={{ animationDelay: `${delay}s` }}
        >
          {children}
        </span>
      </span>
    );
  }

  return <MaskedInView className={className} delay={delay}>{children}</MaskedInView>;
}

function MaskedInView({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <span ref={ref} className={cn("masked-line", className)}>
      <motion.span
        className="block"
        initial={{ y: "150%", rotate: 1.5 }}
        animate={inView ? { y: "0%", rotate: 0 } : undefined}
        transition={{
          duration: 0.72,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
