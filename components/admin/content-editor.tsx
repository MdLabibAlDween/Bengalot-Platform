"use client";

import {
  Check,
  FileText,
  HelpCircle,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import type {
  AboutPageContent,
  AnnouncementContent,
  FaqPageContent,
  JournalPageContent,
  PageContent,
} from "@/lib/page-content";
import type { JournalArticle } from "@/lib/journal";

type Tab = "announcement" | "journal" | "about" | "faq";

const tabs: { id: Tab; label: string; icon: typeof Megaphone }[] = [
  { id: "announcement", label: "Announcement", icon: Megaphone },
  { id: "journal", label: "Journal", icon: FileText },
  { id: "about", label: "Our story", icon: FileText },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

function splitParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugFromTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ContentEditor({ content }: { content: PageContent }) {
  const [draft, setDraft] = useState<PageContent>(content);
  const [tab, setTab] = useState<Tab>("announcement");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  function updateAnnouncement<K extends keyof AnnouncementContent>(
    key: K,
    value: AnnouncementContent[K],
  ) {
    setDraft((current) => ({
      ...current,
      announcement: { ...current.announcement, [key]: value },
    }));
    setState("idle");
  }

  function updateJournal<K extends keyof JournalPageContent>(
    key: K,
    value: JournalPageContent[K],
  ) {
    setDraft((current) => ({
      ...current,
      journal: { ...current.journal, [key]: value },
    }));
    setState("idle");
  }

  function updateAbout<K extends keyof AboutPageContent>(
    key: K,
    value: AboutPageContent[K],
  ) {
    setDraft((current) => ({
      ...current,
      about: { ...current.about, [key]: value },
    }));
    setState("idle");
  }

  function updateFaq<K extends keyof FaqPageContent>(
    key: K,
    value: FaqPageContent[K],
  ) {
    setDraft((current) => ({
      ...current,
      faq: { ...current.faq, [key]: value },
    }));
    setState("idle");
  }

  function updateArticle(index: number, patch: Partial<JournalArticle>) {
    updateJournal(
      "articles",
      draft.journal.articles.map((article, articleIndex) =>
        articleIndex === index ? { ...article, ...patch } : article,
      ),
    );
  }

  function addArticle() {
    const next = draft.journal.articles.length + 1;
    updateJournal("articles", [
      ...draft.journal.articles,
      {
        slug: `new-note-${next}`,
        category: "Field notes",
        title: "A new field note",
        excerpt: "A short description for the journal card.",
        readTime: "3 min read",
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        theme: "teal",
        pullQuote: "A line worth keeping from this note.",
        paragraphs: ["Write the note here."],
      },
    ]);
  }

  function removeArticle(index: number) {
    if (draft.journal.articles.length <= 1) return;
    updateJournal(
      "articles",
      draft.journal.articles.filter((_, articleIndex) => articleIndex !== index),
    );
  }

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await response.json()) as {
        message?: string;
        ok?: boolean;
        content?: PageContent;
        fields?: unknown;
      };
      if (!response.ok || !data.ok) {
        throw new Error(
          data.message ??
            (data.fields ? "Some fields need another look." : "Could not save."),
        );
      }
      setDraft(data.content ?? draft);
      setState("saved");
      setMessage("Saved. The storefront pages are updated.");
      window.setTimeout(() => setState("idle"), 2400);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[1.2rem] border border-line bg-cream p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[0.62rem] font-bold transition-colors ${
                tab === item.id
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-surface text-ink-soft hover:border-ink/30"
              }`}
            >
              <item.icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={state === "saving"}
          className="btn btn-primary btn-sm shrink-0"
        >
          {state === "saving" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : state === "saved" ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Save className="size-3.5" aria-hidden="true" />
          )}
          {state === "saving" ? "Saving" : state === "saved" ? "Saved" : "Save content"}
        </button>
      </div>

      {message ? (
        <div
          role={state === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-2.5 text-[0.7rem] font-medium ${
            state === "error"
              ? "border-coral/30 bg-coral/[0.08] text-coral-deep"
              : "border-teal/20 bg-teal-soft/40 text-teal"
          }`}
        >
          {message}
        </div>
      ) : null}

      {tab === "announcement" ? (
        <section className="rounded-[1.2rem] border border-line bg-cream p-5">
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
            Top announcement bar
          </p>
          <p className="mt-2 max-w-[42rem] text-[0.68rem] leading-relaxed text-muted">
            This is the strip above the header. Change the copy when pre-launch
            ends, or switch it off completely. The mobile text is used on small
            screens.
          </p>

          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-3">
            <span>
              <span className="block text-[0.7rem] font-semibold text-ink">
                Show the announcement bar
              </span>
              <span className="mt-0.5 block text-[0.58rem] text-muted">
                Turn this off when the store is fully live.
              </span>
            </span>
            <input
              type="checkbox"
              checked={draft.announcement.enabled}
              onChange={(event) =>
                updateAnnouncement("enabled", event.target.checked)
              }
              className="size-4 accent-[var(--teal)]"
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="announcement-desktop" className="field-label">
                Desktop text
              </label>
              <textarea
                id="announcement-desktop"
                rows={2}
                value={draft.announcement.desktopText}
                onChange={(event) =>
                  updateAnnouncement("desktopText", event.target.value)
                }
                className="field resize-y"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="announcement-mobile" className="field-label">
                Mobile text
              </label>
              <input
                id="announcement-mobile"
                value={draft.announcement.mobileText}
                onChange={(event) =>
                  updateAnnouncement("mobileText", event.target.value)
                }
                className="field"
              />
            </div>
            <div>
              <label htmlFor="announcement-cta" className="field-label">
                Link label
              </label>
              <input
                id="announcement-cta"
                value={draft.announcement.ctaLabel}
                onChange={(event) =>
                  updateAnnouncement("ctaLabel", event.target.value)
                }
                className="field"
              />
            </div>
            <div>
              <label htmlFor="announcement-href" className="field-label">
                Link URL
              </label>
              <input
                id="announcement-href"
                value={draft.announcement.ctaHref}
                onChange={(event) =>
                  updateAnnouncement("ctaHref", event.target.value)
                }
                className="field"
              />
            </div>
            <div>
              <label htmlFor="announcement-tone" className="field-label">
                Colour
              </label>
              <select
                id="announcement-tone"
                value={draft.announcement.tone}
                onChange={(event) =>
                  updateAnnouncement(
                    "tone",
                    event.target.value as AnnouncementContent["tone"],
                  )
                }
                className="field"
              >
                <option value="navy">Navy</option>
                <option value="teal">Teal</option>
                <option value="coral">Coral</option>
                <option value="butter">Butter</option>
              </select>
            </div>
          </div>

          <div
            className={`mt-5 rounded-xl px-4 py-3 text-center text-[0.58rem] font-bold uppercase tracking-[0.13em] ${
              draft.announcement.tone === "navy"
                ? "bg-navy text-cream"
                : draft.announcement.tone === "teal"
                  ? "bg-teal text-cream"
                  : draft.announcement.tone === "coral"
                    ? "bg-coral text-cream"
                    : "bg-butter text-ink"
            }`}
          >
            {draft.announcement.enabled
              ? draft.announcement.desktopText || "Announcement preview"
              : "Announcement bar is hidden"}
          </div>
        </section>
      ) : null}

      {tab === "journal" ? (
        <section className="space-y-4">
          <div className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Journal page header
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="journal-eyebrow" className="field-label">Eyebrow</label>
                <input
                  id="journal-eyebrow"
                  value={draft.journal.eyebrow}
                  onChange={(event) => updateJournal("eyebrow", event.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="journal-accent" className="field-label">Italic second line</label>
                <input
                  id="journal-accent"
                  value={draft.journal.accent}
                  onChange={(event) => updateJournal("accent", event.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="journal-heading" className="field-label">Heading (one line per row)</label>
                <textarea
                  id="journal-heading"
                  rows={2}
                  value={draft.journal.heading}
                  onChange={(event) => updateJournal("heading", event.target.value)}
                  className="field resize-y"
                />
              </div>
              <div>
                <label htmlFor="journal-intro" className="field-label">Intro</label>
                <textarea
                  id="journal-intro"
                  rows={3}
                  value={draft.journal.intro}
                  onChange={(event) => updateJournal("intro", event.target.value)}
                  className="field resize-y"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[1.2rem] border border-line bg-cream px-5 py-3">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-muted">
              {draft.journal.articles.length} notes
            </p>
            <button type="button" onClick={addArticle} className="btn btn-outline btn-sm">
              <Plus className="size-3.5" aria-hidden="true" />
              Add note
            </button>
          </div>

          {draft.journal.articles.map((article, index) => (
            <details
              key={`${index}-${article.slug}`}
              className="rounded-[1.2rem] border border-line bg-cream p-5"
              open={index === 0}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3">
                <span>
                  <span className="block text-[0.7rem] font-semibold text-ink">
                    {article.title || "Untitled note"}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.56rem] text-muted">
                    /journal/{article.slug}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    removeArticle(index);
                  }}
                  className="grid size-7 place-items-center rounded-full border border-line text-muted hover:border-coral/40 hover:text-coral"
                  aria-label={`Remove ${article.title}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </summary>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={`article-title-${index}`}>Title</label>
                  <input
                    id={`article-title-${index}`}
                    value={article.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      updateArticle(index, {
                        title,
                        slug: article.slug.startsWith("new-note-")
                          ? slugFromTitle(title) || article.slug
                          : article.slug,
                      });
                    }}
                    className="field"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor={`article-slug-${index}`}>Slug</label>
                  <input
                    id={`article-slug-${index}`}
                    value={article.slug}
                    onChange={(event) =>
                      updateArticle(index, {
                        slug: slugFromTitle(event.target.value),
                      })
                    }
                    className="field font-mono"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor={`article-category-${index}`}>Category</label>
                  <input
                    id={`article-category-${index}`}
                    value={article.category}
                    onChange={(event) => updateArticle(index, { category: event.target.value })}
                    className="field"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor={`article-read-${index}`}>Read time</label>
                  <input
                    id={`article-read-${index}`}
                    value={article.readTime}
                    onChange={(event) => updateArticle(index, { readTime: event.target.value })}
                    className="field"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor={`article-date-${index}`}>Date</label>
                  <input
                    id={`article-date-${index}`}
                    value={article.date}
                    onChange={(event) => updateArticle(index, { date: event.target.value })}
                    className="field"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor={`article-theme-${index}`}>Theme</label>
                  <select
                    id={`article-theme-${index}`}
                    value={article.theme}
                    onChange={(event) =>
                      updateArticle(index, {
                        theme: event.target.value as JournalArticle["theme"],
                      })
                    }
                    className="field"
                  >
                    <option value="teal">Teal</option>
                    <option value="coral">Coral</option>
                    <option value="lavender">Lavender</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={`article-excerpt-${index}`}>Excerpt</label>
                  <textarea
                    id={`article-excerpt-${index}`}
                    rows={2}
                    value={article.excerpt}
                    onChange={(event) => updateArticle(index, { excerpt: event.target.value })}
                    className="field resize-y"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={`article-quote-${index}`}>Pull quote</label>
                  <textarea
                    id={`article-quote-${index}`}
                    rows={2}
                    value={article.pullQuote}
                    onChange={(event) => updateArticle(index, { pullQuote: event.target.value })}
                    className="field resize-y"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={`article-body-${index}`}>
                    Body (separate paragraphs with a blank line)
                  </label>
                  <textarea
                    id={`article-body-${index}`}
                    rows={8}
                    value={article.paragraphs.join("\n\n")}
                    onChange={(event) =>
                      updateArticle(index, {
                        paragraphs: splitParagraphs(event.target.value),
                      })
                    }
                    className="field resize-y"
                  />
                </div>
              </div>
            </details>
          ))}
        </section>
      ) : null}

      {tab === "about" ? (
        <section className="space-y-4">
          <div className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Our story header
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="about-eyebrow" className="field-label">Eyebrow</label>
                <input id="about-eyebrow" value={draft.about.eyebrow} onChange={(event) => updateAbout("eyebrow", event.target.value)} className="field" />
              </div>
              <div>
                <label htmlFor="about-accent" className="field-label">Italic last line</label>
                <input id="about-accent" value={draft.about.accent} onChange={(event) => updateAbout("accent", event.target.value)} className="field" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="about-heading" className="field-label">Heading (one line per row)</label>
                <textarea id="about-heading" rows={2} value={draft.about.heading} onChange={(event) => updateAbout("heading", event.target.value)} className="field resize-y" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="about-intro" className="field-label">Intro</label>
                <textarea id="about-intro" rows={4} value={draft.about.intro} onChange={(event) => updateAbout("intro", event.target.value)} className="field resize-y" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="about-story-heading" className="field-label">Story heading</label>
                <input id="about-story-heading" value={draft.about.storyHeading} onChange={(event) => updateAbout("storyHeading", event.target.value)} className="field" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="about-story" className="field-label">Story (separate paragraphs with a blank line)</label>
                <textarea id="about-story" rows={8} value={draft.about.storyParagraphs.join("\n\n")} onChange={(event) => updateAbout("storyParagraphs", splitParagraphs(event.target.value))} className="field resize-y" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Three standards
            </p>
            <div className="mt-4 space-y-3">
              {draft.about.principles.map((principle, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[0.6fr_1.4fr]">
                  <input
                    value={principle.title}
                    onChange={(event) =>
                      updateAbout(
                        "principles",
                        draft.about.principles.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                    className="field"
                    aria-label={`Principle ${index + 1} title`}
                  />
                  <textarea
                    rows={2}
                    value={principle.copy}
                    onChange={(event) =>
                      updateAbout(
                        "principles",
                        draft.about.principles.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, copy: event.target.value } : item,
                        ),
                      )
                    }
                    className="field resize-y"
                    aria-label={`Principle ${index + 1} copy`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Studio note
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="about-studio-heading" className="field-label">Studio heading</label>
                <input id="about-studio-heading" value={draft.about.studioHeading} onChange={(event) => updateAbout("studioHeading", event.target.value)} className="field" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="about-studio-copy" className="field-label">Studio copy</label>
                <textarea id="about-studio-copy" rows={3} value={draft.about.studioCopy} onChange={(event) => updateAbout("studioCopy", event.target.value)} className="field resize-y" />
              </div>
              <div>
                <label htmlFor="about-quote" className="field-label">Quote</label>
                <textarea id="about-quote" rows={4} value={draft.about.quote} onChange={(event) => updateAbout("quote", event.target.value)} className="field resize-y" />
              </div>
              <div>
                <label htmlFor="about-attribution" className="field-label">Quote attribution</label>
                <input id="about-attribution" value={draft.about.quoteAttribution} onChange={(event) => updateAbout("quoteAttribution", event.target.value)} className="field" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "faq" ? (
        <section className="space-y-4">
          <div className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              FAQ page header
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="faq-eyebrow" className="field-label">Eyebrow</label>
                <input id="faq-eyebrow" value={draft.faq.eyebrow} onChange={(event) => updateFaq("eyebrow", event.target.value)} className="field" />
              </div>
              <div>
                <label htmlFor="faq-accent" className="field-label">Italic second line</label>
                <input id="faq-accent" value={draft.faq.accent} onChange={(event) => updateFaq("accent", event.target.value)} className="field" />
              </div>
              <div>
                <label htmlFor="faq-heading" className="field-label">Heading</label>
                <input id="faq-heading" value={draft.faq.heading} onChange={(event) => updateFaq("heading", event.target.value)} className="field" />
              </div>
              <div>
                <label htmlFor="faq-intro" className="field-label">Intro</label>
                <textarea id="faq-intro" rows={3} value={draft.faq.intro} onChange={(event) => updateFaq("intro", event.target.value)} className="field resize-y" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-line bg-cream p-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
                Questions
              </p>
              <button
                type="button"
                onClick={() =>
                  updateFaq("items", [
                    ...draft.faq.items,
                    { title: "A new question", body: "The answer goes here." },
                  ])
                }
                className="btn btn-outline btn-sm"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add question
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {draft.faq.items.map((item, index) => (
                <div key={index} className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateFaq(
                          "items",
                          draft.faq.items.map((faqItem, itemIndex) =>
                            itemIndex === index ? { ...faqItem, title: event.target.value } : faqItem,
                          ),
                        )
                      }
                      className="field !py-2"
                      aria-label={`Question ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateFaq(
                          "items",
                          draft.faq.items.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      disabled={draft.faq.items.length <= 1}
                      className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:border-coral/40 hover:text-coral disabled:opacity-40"
                      aria-label={`Remove question ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={item.body}
                    onChange={(event) =>
                      updateFaq(
                        "items",
                        draft.faq.items.map((faqItem, itemIndex) =>
                          itemIndex === index ? { ...faqItem, body: event.target.value } : faqItem,
                        ),
                      )
                    }
                    className="field mt-2 resize-y !text-[0.7rem]"
                    aria-label={`Answer ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Three small promises
            </p>
            <div className="mt-4 space-y-3">
              {draft.faq.cards.map((card, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[0.6fr_1.4fr]">
                  <input
                    value={card.title}
                    onChange={(event) =>
                      updateFaq(
                        "cards",
                        draft.faq.cards.map((faqCard, cardIndex) =>
                          cardIndex === index ? { ...faqCard, title: event.target.value } : faqCard,
                        ),
                      )
                    }
                    className="field"
                    aria-label={`Promise ${index + 1} title`}
                  />
                  <input
                    value={card.copy}
                    onChange={(event) =>
                      updateFaq(
                        "cards",
                        draft.faq.cards.map((faqCard, cardIndex) =>
                          cardIndex === index ? { ...faqCard, copy: event.target.value } : faqCard,
                        ),
                      )
                    }
                    className="field"
                    aria-label={`Promise ${index + 1} copy`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
