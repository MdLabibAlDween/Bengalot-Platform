/**
 * Derived visual tokens.
 *
 * Canonical hex values live in `app/globals.css` under `@theme` / `:root`.
 * This module only references those CSS variables so SVG placeholder art and
 * gradients stay in sync with the site palette.
 */

export type PlaceholderPalette = {
  from: string;
  to: string;
  ink: string;
  gold: string;
};

export type PlaceholderTone =
  | "indigo"
  | "magenta"
  | "saffron"
  | "teal"
  | "terracotta"
  | "jade";

const PLACEHOLDER_TONES: Record<PlaceholderTone, PlaceholderPalette> = {
  indigo: {
    from: "var(--color-indigo)",
    to: "var(--color-indigo-luminous)",
    ink: "var(--color-ivory)",
    gold: "var(--color-saffron)",
  },
  magenta: {
    from: "var(--color-magenta)",
    to: "var(--color-magenta-luminous)",
    ink: "var(--color-ivory)",
    gold: "var(--color-saffron)",
  },
  saffron: {
    from: "var(--color-indigo-luminous)",
    to: "var(--color-magenta)",
    ink: "var(--color-ivory)",
    gold: "var(--color-saffron)",
  },
  teal: {
    from: "var(--color-teal)",
    to: "var(--color-teal-luminous)",
    ink: "var(--color-ivory)",
    gold: "var(--color-saffron)",
  },
  terracotta: {
    from: "var(--color-terracotta)",
    to: "var(--color-terracotta-luminous)",
    ink: "var(--color-ivory)",
    gold: "var(--color-saffron)",
  },
  jade: {
    from: "var(--color-jade)",
    to: "var(--color-jade-luminous)",
    ink: "var(--color-ivory)",
    gold: "var(--color-saffron)",
  },
};

const PLACEHOLDER_PALETTES = Object.values(PLACEHOLDER_TONES);

function hash(value: string) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return Math.abs(result);
}

export function placeholderPalette(seed: string) {
  return PLACEHOLDER_PALETTES[(hash(seed) % 997) % PLACEHOLDER_PALETTES.length];
}

export function placeholderTone(tone: PlaceholderTone) {
  return PLACEHOLDER_TONES[tone];
}

function parseHex(value: string) {
  const hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
    ] as [number, number, number];
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ] as [number, number, number];
  }
  return null;
}

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function luminance([r, g, b]: [number, number, number]) {
  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function isLightHex(value: string) {
  const rgb = parseHex(value);
  return rgb ? luminance(rgb) > 0.28 : false;
}

/** Lighten (positive) or darken (negative) a hex colour by a 0–1 amount. */
export function shadeHex(value: string, amount: number) {
  const rgb = parseHex(value);
  if (!rgb) return value;
  const strength = Math.max(-1, Math.min(1, amount));
  const target = strength >= 0 ? 255 : 0;
  const mix = Math.abs(strength);
  return toHex(
    rgb.map((channel) => channel + (target - channel) * mix) as [number, number, number]
  );
}

/** Blend two hex colours; amount is the weight of the second colour. */
export function mixHex(from: string, to: string, amount = 0.5) {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return from;
  const weight = Math.max(0, Math.min(1, amount));
  return toHex(
    a.map((channel, index) => channel + (b[index] - channel) * weight) as [
      number,
      number,
      number,
    ]
  );
}

/** Build a readable art palette from two exact brand/variant colours. */
export function paletteFromColors([from, to]: [string, string]): PlaceholderPalette {
  const fromRgb = parseHex(from);
  const toRgb = parseHex(to);
  const average = fromRgb && toRgb
    ? (luminance(fromRgb) + luminance(toRgb)) / 2
    : 0;
  const light = average > 0.28;
  return {
    from,
    to,
    ink: light ? "var(--color-ink)" : "var(--color-ivory)",
    gold: light ? "var(--color-gold-ink)" : "var(--color-saffron)",
  };
}

/** A two-stop palette for one exact product colour. */
export function productColorPalette(value: string): [string, string] {
  return [value, shadeHex(value, isLightHex(value) ? -0.12 : 0.12)];
}

export const PRIMARY_GRADIENT =
  "linear-gradient(135deg, var(--color-indigo), var(--color-magenta))";
