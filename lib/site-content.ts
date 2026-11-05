import "server-only";

import { HERO_SLIDES, SECTION_COPY, type HeroSlide, type SectionCopy } from "@/lib/homepage";
import { faqs, lookbook } from "@/lib/data";
import { DEFAULT_POLICIES, type PolicyKey, type PolicyPageContent } from "@/lib/policies";
import { getSetting, saveSetting } from "@/lib/admin/settings";

export type PageHeroContent = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  imageUrl?: string;
};

export type SiteContent = {
  home: {
    heroSlides: HeroSlide[];
    sections: Record<string, SectionCopy>;
    announcement: { messages: string[] };
    trust: { items: string[] };
  };
  about: {
    hero: PageHeroContent;
    intro: { eyebrow: string; title: string; paragraphs: string[]; quote: string };
    values: { title: string; text: string }[];
    steps: { title: string; text: string }[];
    valuesHeading: { eyebrow: string; title: string; description: string };
    stepsHeading: { eyebrow: string; title: string };
    cta: { eyebrow: string; title: string; text: string; description: string; button: string };
  };
  contact: {
    hero: PageHeroContent;
    replyTime: string;
    note: string;
  };
  faq: {
    hero: PageHeroContent;
    items: { q: string; a: string }[];
  };
  lookbook: {
    hero: PageHeroContent;
    stories: {
      slug: string;
      title: string;
      subtitle: string;
      description: string;
      imageUrl?: string;
    }[];
  };
  footer: {
    tagline: string;
    note: string;
  };
  policies: Record<PolicyKey, PolicyPageContent>;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  home: {
    heroSlides: HERO_SLIDES,
    sections: { ...SECTION_COPY },
    announcement: {
      messages: ["Cash on Delivery · ৳70 Faridpur · ৳130 outside"],
    },
    trust: {
      items: [
        "Cash on Delivery",
        "Quality Checked",
        "Delivery across Bangladesh",
        "WhatsApp Support",
      ],
    },
  },
  about: {
    hero: {
      eyebrow: "Our story",
      title: "Born in Bengal. Made to be kept.",
      accent: "kept.",
      imageUrl: "",
      description:
        "Bengalot is a new online-only fashion brand from Saltha, Faridpur. We are starting with a small collection and growing piece by piece.",
    },
    intro: {
      eyebrow: "Why we began",
      title: "A small start, made carefully.",
      paragraphs: [
        "Bengalot began with a simple idea: clothing from Bengal should feel considered, modern and easy to wear. We are a new brand, so we are starting small rather than pretending to be something we are not.",
        "Our first pieces are chosen for everyday wear and occasional moments — quiet color, comfortable cuts and details that do not need to shout. As the collection grows, we will add more pieces and share what we learn along the way.",
      ],
      quote: "A wardrobe should feel personal, useful and worth keeping.",
    },
    values: [
      { title: "Quality first", text: "We would rather make fewer pieces and check them properly than rush a larger collection." },
      { title: "Honest materials", text: "We choose natural fibres and finishes we can explain clearly, and we are still learning as we grow." },
      { title: "Fair prices", text: "Small runs, direct selling and no unnecessary middle layers. The price should make sense." },
      { title: "Real support", text: "A real person answers WhatsApp and email. If something is unclear, ask us before ordering." },
    ],
    steps: [
      { title: "Choose your pieces", text: "Browse the departments and pick the color, size and quantity you want." },
      { title: "Confirm your order", text: "Add your delivery details and choose cash on delivery at checkout." },
      { title: "Packed and sent", text: "We pack your order and hand it to the courier for delivery." },
      { title: "Pay on delivery", text: "Pay the courier when your parcel arrives. Delivery is available across Bangladesh." },
    ],
    valuesHeading: {
      eyebrow: "What we stand for",
      title: "Four simple intentions.",
      description: "Not a manifesto. Just the things we keep coming back to when making a decision.",
    },
    stepsHeading: {
      eyebrow: "How ordering works",
      title: "From choosing to delivery.",
    },
    cta: {
      eyebrow: "Wear the story",
      title: "Wear the story",
      text: "Considered pieces, made to be kept.",
      description: "Explore the collection, or send us a message. We are online-only, but always happy to help.",
      button: "Shop the collection",
    },
  },
  contact: {
    hero: {
      eyebrow: "Here for you",
      title: "Let's talk.",
      accent: "talk.",
      imageUrl: "",
      description:
        "No bots, no ticket maze. A small team in Faridpur reads every message. Choose whichever way feels easiest.",
    },
    replyTime: "Usually within a few hours",
    note: "Order help, fit advice and photos of pieces.",
  },
  faq: {
    hero: {
      eyebrow: "Help centre",
      title: "Questions, answered.",
      accent: "answered.",
      imageUrl: "",
      description:
        "The things people ask us most. If your question isn't here, WhatsApp is the fastest way to a real answer.",
    },
    items: faqs.map((faq) => ({ q: faq.q, a: faq.a })),
  },
  lookbook: {
    hero: {
      eyebrow: "The Bengalot lookbook",
      title: "Stories in color.",
      accent: "color.",
      imageUrl: "",
      description:
        "Notes on craft, color and the quiet details behind each Bengalot collection — photographed without people, because the clothes should speak first.",
    },
    stories: lookbook.map((story) => ({
      slug: story.slug,
      title: story.title,
      subtitle: story.subtitle,
      description: story.description,
      imageUrl: "",
    })),
  },
  footer: {
    tagline: "Premium fashion from Bengal.",
    note: "Saltha, Faridpur, Bangladesh",
  },
  policies: DEFAULT_POLICIES,
};

function mergeContent<T>(defaults: T, stored: unknown): T {
  if (Array.isArray(defaults)) return (Array.isArray(stored) ? stored : defaults) as T;
  if (defaults && typeof defaults === "object") {
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaults;
    const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
    for (const [key, value] of Object.entries(stored as Record<string, unknown>)) {
      result[key] = mergeContent((defaults as Record<string, unknown>)[key], value);
    }
    return result as T;
  }
  return (stored === undefined || stored === null ? defaults : stored) as T;
}

export async function getSiteContent() {
  const stored = await getSetting<unknown>("site_content", {});
  return mergeContent(DEFAULT_SITE_CONTENT, stored);
}

export async function ensureSiteContent() {
  const existing = await getSetting<unknown>("site_content", null);
  const merged = mergeContent(DEFAULT_SITE_CONTENT, existing ?? {});
  if (!existing) {
    await saveSetting("site_content", merged, true);
    return merged;
  }
  if (JSON.stringify(existing) !== JSON.stringify(merged)) {
    await saveSetting("site_content", merged, true);
  }
  return merged;
}
