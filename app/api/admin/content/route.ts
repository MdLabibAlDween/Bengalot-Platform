import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { normalisePageContent } from "@/lib/page-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const articleSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(1).max(60),
  title: z.string().trim().min(3).max(180),
  excerpt: z.string().trim().min(3).max(400),
  readTime: z.string().trim().min(1).max(40),
  date: z.string().trim().min(1).max(60),
  theme: z.enum(["teal", "coral", "lavender"]),
  pullQuote: z.string().trim().min(3).max(400),
  paragraphs: z.array(z.string().trim().min(1).max(8000)).min(1).max(30),
});

const principleSchema = z.object({
  title: z.string().trim().min(1).max(100),
  copy: z.string().trim().min(1).max(500),
});

const faqItemSchema = z.object({
  title: z.string().trim().min(2).max(180),
  body: z.string().trim().min(2).max(3000),
});

const faqCardSchema = z.object({
  title: z.string().trim().min(1).max(100),
  copy: z.string().trim().min(1).max(300),
});

const schema = z.object({
  announcement: z.object({
    enabled: z.boolean(),
    desktopText: z.string().trim().min(2).max(240),
    mobileText: z.string().trim().min(2).max(160),
    ctaLabel: z.string().trim().max(80),
    ctaHref: z.string().trim().max(300),
    tone: z.enum(["navy", "teal", "coral", "butter"]),
  }),
  journal: z.object({
    eyebrow: z.string().trim().max(80),
    heading: z.string().trim().min(2).max(200),
    accent: z.string().trim().min(2).max(200),
    intro: z.string().trim().min(2).max(600),
    articles: z.array(articleSchema).min(1).max(30),
  }),
  about: z.object({
    eyebrow: z.string().trim().max(80),
    heading: z.string().trim().min(2).max(240),
    accent: z.string().trim().min(2).max(200),
    intro: z.string().trim().min(2).max(800),
    storyHeading: z.string().trim().min(2).max(240),
    storyParagraphs: z.array(z.string().trim().min(1).max(3000)).min(1).max(20),
    principles: z.array(principleSchema).min(1).max(6),
    studioHeading: z.string().trim().min(2).max(200),
    studioCopy: z.string().trim().min(2).max(600),
    quote: z.string().trim().min(2).max(600),
    quoteAttribution: z.string().trim().min(2).max(160),
  }),
  faq: z.object({
    eyebrow: z.string().trim().max(80),
    heading: z.string().trim().min(2).max(200),
    accent: z.string().trim().min(2).max(200),
    intro: z.string().trim().min(2).max(600),
    items: z.array(faqItemSchema).min(1).max(40),
    cards: z.array(faqCardSchema).min(1).max(3),
  }),
  social: z.object({
    instagram: z.string().trim().max(300),
    facebook: z.string().trim().max(300),
    youtube: z.string().trim().max(300),
    whatsapp: z.string().trim().max(300),
  }),
});

export async function GET() {
  const current = await getCurrentUser();
  if (!current?.profile || !STAFF_ROLES.has(current.profile.role)) {
    return NextResponse.json({ message: "Not authorised." }, { status: 403 });
  }

  const { getPageContent } = await import("@/lib/page-content.server");
  return NextResponse.json({ ok: true, content: await getPageContent() });
}

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.profile || !STAFF_ROLES.has(current.profile.role)) {
    return NextResponse.json({ message: "Not authorised." }, { status: 403 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Some page content needs another look.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const content = normalisePageContent(parsed.data);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: "page_content",
        value: content,
        is_public: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (error) throw error;

    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "page_content.update",
      entity: "site_settings",
      entity_id: "page_content",
      after: {
        announcement: content.announcement,
        journalArticles: content.journal.articles.map((article) => article.slug),
        faqItems: content.faq.items.length,
      },
    });

    revalidatePath("/");
    revalidatePath("/journal");
    revalidatePath("/journal/[slug]", "page");
    revalidatePath("/about");
    revalidatePath("/faq");
    revalidatePath("/admin/content");

    return NextResponse.json({ ok: true, content });
  } catch (error) {
    console.error("Page content update failed", error);
    return NextResponse.json(
      { message: "The page content could not be saved." },
      { status: 500 },
    );
  }
}
