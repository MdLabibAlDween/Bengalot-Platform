"use client";

import { motion, useReducedMotion } from "motion/react";

export function StepsConnector() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="absolute left-[12.5%] right-[12.5%] top-[2.1rem] hidden h-px bg-line-strong lg:block" />
    );
  }

  return (
    <div className="absolute left-[12.5%] right-[12.5%] top-[2.1rem] hidden h-px overflow-hidden bg-line-strong/40 lg:block">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-teal via-coral to-butter"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
