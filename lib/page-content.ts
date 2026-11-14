import { journalArticles, type JournalArticle } from "@/lib/journal";

export type AnnouncementTone = "navy" | "teal" | "coral" | "butter";

export type AnnouncementContent = {
  enabled: boolean;
  desktopText: string;
  mobileText: string;
  ctaLabel: string;
  ctaHref: string;
  tone: AnnouncementTone;
};

export type JournalPageContent = {
  eyebrow: string;
  heading: string;
  accent: string;
  intro: string;
  articles: JournalArticle[];
};

export type AboutPrinciple = {
  title: string;
  copy: string;
};

export type AboutPageContent = {
  eyebrow: string;
  heading: string;
  accent: string;
  intro: string;
  storyHeading: string;
  storyParagraphs: string[];
  principles: AboutPrinciple[];
  studioHeading: string;
  studioCopy: string;
  quote: string;
  quoteAttribution: string;
};

export type FaqItem = {
  title: string;
  body: string;
};

export type FaqCard = {
  title: string;
  copy: string;
};

export type FaqPageContent = {
  eyebrow: string;
  heading: string;
  accent: string;
  intro: string;
  items: FaqItem[];
  cards: FaqCard[];
};

export type SocialLinks = {
  instagram: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
};

export type PageContent = {
  announcement: AnnouncementContent;
  journal: JournalPageContent;
  about: AboutPageContent;
  faq: FaqPageContent;
  social: SocialLinks;
};

export const defaultPageContent: PageContent = {
  announcement: {
    enabled: true,
    desktopText:
      "Bengalot is in pre-launch · First study tools in preparation · No products on sale yet",
    mobileText: "Pre-launch · first study tools in preparation",
    ctaLabel: "Ask us anything",
    ctaHref: "/contact",
    tone: "navy",
  },
  journal: {
    eyebrow: "Field notes",
    heading: "Ideas for a",
    accent: "quieter mind.",
    intro:
      "Short, honest notes on focus, study rituals and the objects that help. No hacks, no endless lists — just a little more intention.",
    articles: journalArticles,
  },
  about: {
    eyebrow: "The house of Bengalot",
    heading: "We make tools for\nthe quiet part of",
    accent: "learning.",
    intro:
      "The second attempt. The honest hour. The week you actually finish. Bengalot exists for the work that happens after the motivation has worn off — and for the small tools that make that work easier to return to.",
    storyHeading: "A brand born from a simple frustration.",
    storyParagraphs: [
      "Bengalot started with the gap between how learning looks online and how it actually feels. The beautiful systems, the perfect planners, the endless templates — all of it can become another thing to manage instead of a way to begin.",
      "We wanted fewer, better objects. A deck that asks a question. A planner with one honest page. A Notion workspace that opens to the day you are actually in. A timer that removes the phone instead of asking you to ignore it. Tools that respect the person using them.",
      "We are a small studio in Saltha, Faridpur. Every product is designed here, made with local partners where possible, and checked by a person before it reaches you. Our brand line is a reminder, not a promise of perfection: bring a lot to learning.",
    ],
    principles: [
      {
        title: "Useful before beautiful",
        copy: "Every object has to earn its place in a bag, on a desk or inside a real week. Beauty is the second question, never the only one.",
      },
      {
        title: "Quiet over loud",
        copy: "No streak counters. No promises of effortless success. Just clear tools that make the next honest session easier to begin.",
      },
      {
        title: "Made from here",
        copy: "Designed in Saltha, Faridpur, for learners across Bangladesh. Local printing, local support and a long-term view.",
      },
    ],
    studioHeading: "Small enough to answer the phone.",
    studioCopy:
      "We are online-only, but never anonymous. Support is handled by the same small team that makes the tools.",
    quote:
      "We are not trying to make learning effortless. We are trying to make the effort feel worth returning to.",
    quoteAttribution: "The Bengalot studio, Faridpur",
  },
  faq: {
    eyebrow: "Questions, answered",
    heading: "The useful",
    accent: "small print.",
    intro:
      "Everything we get asked before a first order. If your question is not here, a human is one message away.",
    items: [
      {
        title: "How do digital products arrive?",
        body: "After payment is confirmed, your resource is added to your account library. Notion templates open through a duplicate link, and downloadable resources appear as PDFs. You will also receive a receipt by email.",
      },
      {
        title: "Can I buy without an account?",
        body: "You can place a physical order as a guest. Digital orders need an account so we have a safe place to deliver access. Creating one takes less than a minute and keeps every resource in one library.",
      },
      {
        title: "Are the planners printed or digital?",
        body: "The Exam Focus Planner and Weekly Study Planner are printed physical products, delivered across Bangladesh. Notion templates, the Deep Work guide and other digital tools are separate and appear in your account library after purchase.",
      },
      {
        title: "What payment methods do you accept?",
        body: "Cash on delivery is available for physical items across Bangladesh. Digital orders are paid securely through ZiniPay with bKash, Nagad, Rocket or Upay.",
      },
      {
        title: "How much is delivery?",
        body: "Delivery is ৳70 inside Faridpur district and ৳130 elsewhere in Bangladesh. Orders above ৳2,000 ship free. Digital orders have no delivery fee.",
      },
      {
        title: "How long does a physical order take?",
        body: "Most parcels are packed within one working day and arrive in 2–4 working days. If something is delayed, message us on WhatsApp with your order number and we will check it with the courier.",
      },
      {
        title: "Can I return a study card deck?",
        body: "If a physical item arrives damaged or is not what you ordered, tell us within 48 hours of delivery. Unused items in their original packaging can be exchanged. Digital resources are non-refundable once access has been opened.",
      },
      {
        title: "What if a Notion link stops working?",
        body: "Send us your order number and the resource name. We check every access link and will repair or reset it for you. Our support window is Sunday to Thursday, 10am–6pm.",
      },
      {
        title: "Are the prices in BDT?",
        body: "Yes. Every price on Bengalot is in Bangladeshi Taka, including the taka symbol. Delivery is shown separately at checkout before you place the order.",
      },
      {
        title: "Do you ship outside Bangladesh?",
        body: "Not yet. Our printed tools and delivery pricing are designed for Bangladesh. Digital tools can be used from anywhere, but the checkout address step is currently set up for local delivery only.",
      },
      {
        title: "Can I get a custom bundle or school order?",
        body: "Yes, for larger orders we can put together a bundle for a class, school or study group. Message support@bengalot.com or WhatsApp 01341739202 with what you need and roughly how many people.",
      },
    ],
    cards: [
      {
        title: "Delivery across Bangladesh",
        copy: "৳70 in Faridpur · ৳130 elsewhere · free over ৳2,000.",
      },
      {
        title: "Digital access guarantee",
        copy: "Every link is checked and reset if it ever breaks.",
      },
      {
        title: "Real support",
        copy: "The same small studio answers your questions.",
      },
    ],
  },
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
    whatsapp: "https://wa.me/8801341739202",
  },
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function textLines(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const lines = value
    .filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    )
    .map((item) => item.trim());
  return lines.length ? lines : fallback;
}

function theme(value: unknown): JournalArticle["theme"] {
  return value === "coral" || value === "lavender" ? value : "teal";
}

function socialUrl(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const url = value.trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url.slice(0, 300) : fallback;
}

function normaliseArticle(
  value: unknown,
  fallback: JournalArticle,
): JournalArticle {
  if (!value || typeof value !== "object") return fallback;
  const article = value as Partial<JournalArticle>;
  return {
    slug: text(article.slug, fallback.slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    category: text(article.category, fallback.category),
    title: text(article.title, fallback.title),
    excerpt: text(article.excerpt, fallback.excerpt),
    readTime: text(article.readTime, fallback.readTime),
    date: text(article.date, fallback.date),
    theme: theme(article.theme),
    pullQuote: text(article.pullQuote, fallback.pullQuote),
    paragraphs: textLines(article.paragraphs, fallback.paragraphs),
  };
}

export function normalisePageContent(value: unknown): PageContent {
  if (!value || typeof value !== "object") return defaultPageContent;
  const input = value as Partial<PageContent>;
  const announcement = (input.announcement ?? {}) as Partial<AnnouncementContent>;
  const journal = (input.journal ?? {}) as Partial<JournalPageContent>;
  const about = (input.about ?? {}) as Partial<AboutPageContent>;
  const faq = (input.faq ?? {}) as Partial<FaqPageContent>;
  const social = (input.social ?? {}) as Partial<SocialLinks>;

  const fallbackArticles = defaultPageContent.journal.articles;
  const rawArticles = Array.isArray(journal.articles) ? journal.articles : [];
  const articles = rawArticles
    .map((article, index) =>
      normaliseArticle(
        article,
        fallbackArticles[index] ?? fallbackArticles[0] as JournalArticle,
      ),
    )
    .filter((article) => article.slug && article.title);

  const uniqueArticles = [
    ...new Map(articles.map((article) => [article.slug, article])).values(),
  ];

  const principles = Array.isArray(about.principles) && about.principles.length
    ? about.principles
        .filter((item): item is AboutPrinciple => Boolean(item && typeof item === "object"))
        .map((item, index) => ({
          title: text(item.title, defaultPageContent.about.principles[index]?.title ?? "Principle"),
          copy: text(item.copy, defaultPageContent.about.principles[index]?.copy ?? ""),
        }))
        .slice(0, 6)
    : defaultPageContent.about.principles;

  const faqItems = Array.isArray(faq.items) && faq.items.length
    ? faq.items
        .filter((item): item is FaqItem => Boolean(item && typeof item === "object"))
        .map((item, index) => ({
          title: text(item.title, defaultPageContent.faq.items[index]?.title ?? "Question"),
          body: text(item.body, defaultPageContent.faq.items[index]?.body ?? ""),
        }))
        .filter((item) => item.title && item.body)
        .slice(0, 40)
    : defaultPageContent.faq.items;

  const faqCards = Array.isArray(faq.cards) && faq.cards.length
    ? faq.cards
        .filter((item): item is FaqCard => Boolean(item && typeof item === "object"))
        .map((item, index) => ({
          title: text(item.title, defaultPageContent.faq.cards[index]?.title ?? "Support"),
          copy: text(item.copy, defaultPageContent.faq.cards[index]?.copy ?? ""),
        }))
        .slice(0, 3)
    : defaultPageContent.faq.cards;

  return {
    announcement: {
      enabled: announcement.enabled !== false,
      desktopText: text(announcement.desktopText, defaultPageContent.announcement.desktopText),
      mobileText: text(announcement.mobileText, defaultPageContent.announcement.mobileText),
      ctaLabel: text(announcement.ctaLabel, defaultPageContent.announcement.ctaLabel),
      ctaHref: text(announcement.ctaHref, defaultPageContent.announcement.ctaHref),
      tone:
        announcement.tone === "teal" ||
        announcement.tone === "coral" ||
        announcement.tone === "butter"
          ? announcement.tone
          : "navy",
    },
    journal: {
      eyebrow: text(journal.eyebrow, defaultPageContent.journal.eyebrow),
      heading: text(journal.heading, defaultPageContent.journal.heading),
      accent: text(journal.accent, defaultPageContent.journal.accent),
      intro: text(journal.intro, defaultPageContent.journal.intro),
      articles: uniqueArticles.length ? uniqueArticles : fallbackArticles,
    },
    about: {
      eyebrow: text(about.eyebrow, defaultPageContent.about.eyebrow),
      heading: text(about.heading, defaultPageContent.about.heading),
      accent: text(about.accent, defaultPageContent.about.accent),
      intro: text(about.intro, defaultPageContent.about.intro),
      storyHeading: text(about.storyHeading, defaultPageContent.about.storyHeading),
      storyParagraphs: textLines(
        about.storyParagraphs,
        defaultPageContent.about.storyParagraphs,
      ),
      principles,
      studioHeading: text(about.studioHeading, defaultPageContent.about.studioHeading),
      studioCopy: text(about.studioCopy, defaultPageContent.about.studioCopy),
      quote: text(about.quote, defaultPageContent.about.quote),
      quoteAttribution: text(
        about.quoteAttribution,
        defaultPageContent.about.quoteAttribution,
      ),
    },
    faq: {
      eyebrow: text(faq.eyebrow, defaultPageContent.faq.eyebrow),
      heading: text(faq.heading, defaultPageContent.faq.heading),
      accent: text(faq.accent, defaultPageContent.faq.accent),
      intro: text(faq.intro, defaultPageContent.faq.intro),
      items: faqItems,
      cards: faqCards,
    },
    social: {
      instagram: socialUrl(
        social.instagram,
        defaultPageContent.social.instagram,
      ),
      facebook: socialUrl(social.facebook, defaultPageContent.social.facebook),
      youtube: socialUrl(social.youtube, defaultPageContent.social.youtube),
      whatsapp: socialUrl(social.whatsapp, defaultPageContent.social.whatsapp),
    },
  };
}
