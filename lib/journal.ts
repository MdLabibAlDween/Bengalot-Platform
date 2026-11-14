export type JournalArticle = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  theme: "teal" | "coral" | "lavender";
  paragraphs: string[];
  pullQuote: string;
};

export const journalArticles: JournalArticle[] = [
  {
    slug: "the-ten-minute-review",
    category: "Focus",
    title: "The ten-minute review that changes the next session",
    excerpt:
      "A small closing ritual that turns one honest study block into a better next one.",
    readTime: "5 min read",
    date: "28 October 2026",
    theme: "teal",
    pullQuote:
      "The end of a session is not the end of the work. It is the handover to the next you.",
    paragraphs: [
      "Most study advice begins at the beginning: prepare the desk, silence the phone, choose the hour. All of it matters. But the smallest change I have made to my own study routine happens at the end. I close the session with ten quiet minutes of notes, and the next session starts with less friction than before.",
      "The review has three questions. What moved forward? What is still unclear? What is the first action next time? The answers do not need to be elegant. A sentence each is enough. The point is to leave a trail for the person who returns to the desk tomorrow.",
      "The final question is the one that pays for itself. Instead of ending with a vague promise to continue, you leave an exact first move. Open the chapter to page 84. Rewrite the third paragraph. Test yourself on the five words you missed. Beginning becomes a decision you have already made.",
      "Bengalot's Deep Work Study Guide includes a one-page review sheet built around these three questions. Keep it near the thing you use to study. Ten minutes is enough. The next session will thank you.",
    ],
  },
  {
    slug: "a-paper-plan-for-a-digital-semester",
    category: "Study",
    title: "A paper plan for a digital semester",
    excerpt:
      "Why the most useful part of a digital study system might still be a printed planner.",
    readTime: "6 min read",
    date: "21 October 2026",
    theme: "coral",
    pullQuote:
      "Paper is not anti-digital. It is simply a different distance from the work.",
    paragraphs: [
      "There is a particular kind of tiredness that comes from doing everything inside the same glowing rectangle. Classes, notes, messages, reading, deadlines and rest all arrive through the same screen. A printed page is a useful interruption to that sameness.",
      "We designed the Weekly Study Planner as a tear-off pad of single weekly sheets — not a thick planner, not a system with a system. Each sheet holds the classes, the two or three pieces of real work that matter, and the rest you are protecting. The constraint is the point. A page that asks for everything gets abandoned by Wednesday.",
      "The planner works best beside a digital workspace, not instead of one. Let Notion hold the links, the long notes and the archive. Let paper hold the shape of this week. The screen can stay open without becoming the place where you keep checking whether the week is working.",
      "Tear off one sheet. Put it where you work. At the end of the week, make a note of what you actually finished and carry only that honesty into the next sheet.",
    ],
  },
  {
    slug: "why-durable-study-cards",
    category: "Design",
    title: "Why we print study cards on durable, quality paper",
    excerpt:
      "The small decisions behind a deck that feels good enough to use every day.",
    readTime: "4 min read",
    date: "14 October 2026",
    theme: "lavender",
    pullQuote:
      "A learning tool has to survive the bag, the commute and the third month.",
    paragraphs: [
      "A study card is not a poster. It is handled, shuffled, dropped, wedged into a book and returned to a box. The paper has to be light enough to carry but substantial enough to feel worth keeping. We tested thinner stock first. It worked, technically. It simply did not make you want to pick it up.",
      "Our paper sits in the useful middle: dense, durable and genuinely good quality. It holds a soft-touch matte finish, stays opaque enough that the answer does not show through from the other side, and is still pleasant to write on with a pencil. The corners are rounded because a deck that lives in a bag should not punish the bag.",
      "We also chose a box rather than a band. A band is cheaper and photographs well. A box survives. The cards stay in order, the dividers have somewhere to live, and the whole thing can sit on a shelf without becoming a pile.",
      "These are small choices. But the tools we return to are often the ones that quietly respect the way they will be used. That is the standard we want for every Bengalot object.",
    ],
  },
];

export function getJournalArticle(slug: string) {
  return journalArticles.find((article) => article.slug === slug) ?? null;
}
