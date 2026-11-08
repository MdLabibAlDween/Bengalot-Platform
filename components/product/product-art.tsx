import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type ArtProduct = Pick<
  Product,
  "title" | "slug" | "format" | "art_key" | "palette" | "preview" | "includes"
>;

type ArtView = "front" | "back" | "detail";

function getPreview<T extends Record<string, unknown>>(
  product: ArtProduct,
  kind: string,
): T | null {
  const preview = product.preview as Record<string, unknown>;
  return preview && preview.kind === kind ? (preview as T) : null;
}

function Caption({ product }: { product: ArtProduct }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 bg-gradient-to-t from-black/45 via-black/10 to-transparent p-[5%] pt-[16%]">
      <div>
        <p className="art-caption text-[1.35cqw] text-cream/70">Bengalot · study tools</p>
        <p className="mt-[0.8cqw] max-w-[70%] font-display text-[3.1cqw] leading-[1.05] tracking-[-0.03em] text-cream">
          {product.title}
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-cream/25 bg-cream/10 px-[1.8cqw] py-[0.9cqw] text-[1.25cqw] font-semibold uppercase tracking-[0.12em] text-cream/80 backdrop-blur-sm">
        {product.format.split("·")[0]?.trim()}
      </span>
    </div>
  );
}

function NotionScene({ product, view }: { product: ArtProduct; view: ArtView }) {
  const preview = getPreview<{
    kind: string;
    modules: { title: string; meta: string }[];
  }>(product, "notion");
  const modules = preview?.modules ?? [
    { title: "Today", meta: "3 focused tasks" },
    { title: "Semester 4", meta: "6 courses" },
    { title: "Revision queue", meta: "12 topics due" },
    { title: "Weekly review", meta: "Sunday" },
  ];

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute left-[3%] top-[10%] size-[20%] rounded-full border border-cream/15" />
      <div className="absolute bottom-[15%] right-[2%] size-[12%] rounded-full bg-cream/10 blur-[1px]" />

      <div className="relative w-[88%] -rotate-[2.5deg] transition-transform duration-500 ease-out group-hover:-rotate-[0.8deg] group-hover:scale-[1.015]">
        <div className="overflow-hidden rounded-[2.1cqw] border border-white/50 bg-[#ffffff] shadow-[0_5cqw_10cqw_-4cqw_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-[1.2cqw] border-b border-[#e3e9e7] bg-[#f1f5f3] px-[2.4cqw] py-[1.6cqw]">
            <span className="size-[1.15cqw] rounded-full bg-[#e86147]" />
            <span className="size-[1.15cqw] rounded-full bg-[#f3c95f]" />
            <span className="size-[1.15cqw] rounded-full bg-[#0d6f6d]" />
            <span className="ml-[1.4cqw] h-[1.6cqw] w-[42%] rounded-full bg-[#e1e7e5]" />
          </div>
          <div className="grid grid-cols-[27%_1fr]">
            <div className="border-r border-[#e5eae8] bg-[#f3f6f5] p-[2cqw]">
              <div className="flex items-center gap-[1cqw]">
                <span className="flex size-[2.7cqw] items-center justify-center rounded-[0.7cqw] bg-[#0d6f6d] text-[1.4cqw] font-bold text-cream">
                  B
                </span>
                <span className="h-[0.8cqw] w-[55%] rounded-full bg-[#c3cdca]" />
              </div>
              <div className="mt-[2.4cqw] space-y-[1.35cqw]">
                {[0, 1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-[0.9cqw]">
                    <span
                      className={cn(
                        "size-[1.2cqw] rounded-[0.3cqw]",
                        item === 0 ? "bg-[#0d6f6d]" : "bg-[#d2dcd9]",
                      )}
                    />
                    <span
                      className={cn(
                        "h-[0.7cqw] rounded-full",
                        item === 0 ? "w-[70%] bg-[#8c9996]" : "w-[56%] bg-[#d2dcd9]",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-[2.6cqw]">
              <p className="text-[1.25cqw] font-semibold uppercase tracking-[0.16em] text-[#0d6f6d]">
                Monday · Week 07
              </p>
              <p className="mt-[0.7cqw] font-display text-[3.6cqw] leading-none tracking-[-0.04em] text-[#152232]">
                {view === "back" ? "Inside the workspace" : "A clear day ahead."}
              </p>
              <div className="mt-[2.3cqw] grid grid-cols-2 gap-[1.2cqw]">
                {modules.slice(0, 2).map((module) => (
                  <div
                    key={module.title}
                    className="rounded-[1.1cqw] border border-[#e5eae8] bg-[#f7f9f8] p-[1.4cqw]"
                  >
                    <p className="text-[1.15cqw] font-bold uppercase tracking-[0.1em] text-[#7c8a87]">
                      {module.title}
                    </p>
                    <p className="mt-[0.6cqw] font-display text-[1.85cqw] text-[#152232]">
                      {module.meta}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-[1.5cqw] space-y-[1cqw]">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="flex items-center gap-[1.1cqw] rounded-[0.8cqw] border border-[#efe5d5] px-[1.2cqw] py-[0.9cqw]"
                  >
                    <span className="flex size-[1.5cqw] items-center justify-center rounded-[0.35cqw] border border-[#0d6f6d]/40 bg-[#0d6f6d]/10">
                      <span className="size-[0.55cqw] rounded-full bg-[#0d6f6d]" />
                    </span>
                    <span className="h-[0.65cqw] flex-1 rounded-full bg-[#ded2bf]" />
                    <span className="h-[0.65cqw] w-[13%] rounded-full bg-[#efd9a1]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-[5%] -top-[8%] rotate-[7deg] rounded-[1.2cqw] border border-black/5 bg-[#f3c95f] px-[2cqw] py-[1.2cqw] shadow-[0_1.5cqw_2cqw_-1cqw_rgba(0,0,0,0.4)]">
          <p className="text-[1.2cqw] font-extrabold uppercase tracking-[0.12em] text-[#43330b]">
            {view === "back" ? "6 systems" : "18 pages"}
          </p>
        </div>
      </div>
    </div>
  );
}

function CardsScene({ product, view }: { product: ArtProduct; view: ArtView }) {
  const preview = getPreview<{
    kind: string;
    cards: { front: string; hint?: string; back: string; example?: string }[];
  }>(product, "flashcards");
  const first = preview?.cards?.[0] ?? {
    front: "serendipity",
    hint: "/ˌser.ənˈdɪp.ə.ti/",
    back: "Finding something good without looking for it.",
    example: "A happy serendipity brought me to that little bookshop.",
  };
  const second = preview?.cards?.[1] ?? {
    front: "deliberate",
    hint: "/dɪˈlɪb.ər.ət/",
    back: "Done consciously and intentionally.",
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute left-[6%] top-[12%] size-[16%] rounded-full border border-white/20" />
      <div className="relative h-[74%] w-[70%]">
        <div className="absolute inset-0 -rotate-[15deg] rounded-[2cqw] border border-white/25 bg-[#152232]/35 p-[4cqw] shadow-xl">
          <p className="art-caption text-[1.3cqw] text-cream/60">{second.front}</p>
          <div className="mt-[2cqw] h-[0.8cqw] w-[70%] rounded-full bg-cream/25" />
          <div className="mt-[1.2cqw] h-[0.8cqw] w-[48%] rounded-full bg-cream/20" />
        </div>
        <div className="absolute inset-0 rotate-[7deg] rounded-[2cqw] border border-white/40 bg-[#ffffff] p-[4.5cqw] shadow-[0_4cqw_8cqw_-3cqw_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <span className="text-[1.1cqw] font-extrabold uppercase tracking-[0.16em] text-[#8a7c69]">
              {view === "back" ? "Answer" : "Study cards"}
            </span>
            <span className="size-[1.3cqw] rounded-full bg-[#e86147]" />
          </div>
          {view === "back" ? (
            <>
              <p className="mt-[6cqw] font-display text-[5.1cqw] leading-[1.02] tracking-[-0.04em] text-[#152232]">
                {first.back}
              </p>
              <p className="mt-[2.4cqw] text-[1.5cqw] italic leading-relaxed text-[#7c7163]">
                “{first.example}”
              </p>
            </>
          ) : (
            <>
              <p className="mt-[5.8cqw] font-display text-[7cqw] italic leading-none tracking-[-0.045em] text-[#152232]">
                {first.front}
              </p>
              <p className="mt-[1.7cqw] text-[1.55cqw] font-medium text-[#7c7163]">
                {first.hint}
              </p>
              <div className="mt-[3cqw] h-px bg-[#e0e7e4]" />
              <p className="mt-[1.3cqw] text-[1.3cqw] leading-relaxed text-[#7c7163]">
                Turn the card. Say the meaning before you check.
              </p>
            </>
          )}
          <div className="absolute inset-x-[4.5cqw] bottom-[4cqw] flex items-center justify-between">
            <span className="text-[1.05cqw] font-bold uppercase tracking-[0.15em] text-[#9b8d79]">
              Bengalot
            </span>
            <span className="text-[1.05cqw] font-semibold text-[#9b8d79]">01 / 120</span>
          </div>
        </div>
        <div className="absolute -bottom-[9%] left-[14%] w-[58%] rotate-[-4deg] rounded-[1.4cqw] border border-black/5 bg-[#f3c95f] px-[2.4cqw] py-[1.5cqw] shadow-[0_2cqw_3.5cqw_-2cqw_rgba(0,0,0,0.4)]">
          <p className="text-[1.3cqw] font-extrabold uppercase tracking-[0.1em] text-[#45350b]">
            Active recall · 120 cards
          </p>
        </div>
      </div>
    </div>
  );
}

function PlannerScene({ view }: { product: ArtProduct; view: ArtView }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute right-[0%] top-[10%] size-[26%] rotate-12 rounded-full bg-white/20" />
      <div className="relative w-[90%] rotate-[3deg] transition-transform duration-500 ease-out group-hover:rotate-[1deg] group-hover:scale-[1.015]">
        <div className="relative overflow-hidden rounded-[2.4cqw] bg-[#ffffff] shadow-[0_5cqw_9cqw_-3cqw_rgba(20,50,45,0.45)]">
          <div className="absolute inset-y-0 left-1/2 w-px bg-[#e0e7e4]" />
          <div className="absolute inset-y-0 left-[3%] flex flex-col justify-center gap-[2.2cqw]">
            {[0, 1, 2, 3, 4, 5].map((ring) => (
              <span
                key={ring}
                className="size-[1.1cqw] -translate-x-1/2 rounded-full border-[0.3cqw] border-[#adb9b5] bg-[#ffffff]"
              />
            ))}
          </div>
          <div className="grid grid-cols-2">
            <div className="p-[4cqw] pl-[6cqw]">
              <p className="text-[1.1cqw] font-extrabold uppercase tracking-[0.16em] text-[#0d6f6d]">
                {view === "back" ? "The weekly spread" : "Week 03"}
              </p>
              <p className="mt-[1cqw] font-display text-[3.5cqw] leading-none tracking-[-0.03em] text-[#152232]">
                Focus, then rest.
              </p>
              <div className="mt-[2.5cqw] grid grid-cols-7 gap-[0.7cqw]">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center">
                    <p className="text-[0.95cqw] font-bold text-[#9a8a74]">{day}</p>
                    <div
                      className={cn(
                        "mt-[0.6cqw] rounded-[0.5cqw] border border-[#e4d8c5] p-[0.5cqw]",
                        index > 4 && "bg-[#f2ecf8]",
                      )}
                    >
                      <div className="h-[0.55cqw] rounded-full bg-[#ded1bd]" />
                      <div className="mt-[0.55cqw] h-[0.55cqw] w-[70%] rounded-full bg-[#e9decb]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-[2.4cqw] space-y-[1cqw]">
                {["Biology · cells", "Math · functions", "English · essay"].map(
                  (item, index) => (
                    <div key={item} className="flex items-center gap-[0.9cqw]">
                      <span
                        className={cn(
                          "size-[1.3cqw] rounded-[0.3cqw] border",
                          index === 0
                            ? "border-[#0d6f6d] bg-[#0d6f6d]"
                            : "border-[#cbbfa9]",
                        )}
                      />
                      <span className="text-[1.2cqw] text-[#6f6354]">{item}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="bg-[#f8f2e6] p-[4cqw]">
              <p className="text-[1.05cqw] font-extrabold uppercase tracking-[0.16em] text-[#9a8a74]">
                One thing
              </p>
              <div className="mt-[1.5cqw] rotate-[-2deg] bg-[#f3c95f] p-[2.4cqw] shadow-[0_1.8cqw_2.5cqw_-1.5cqw_rgba(0,0,0,0.2)]">
                <p className="text-[1.5cqw] font-semibold leading-snug text-[#43330b]">
                  Finish the chapter summary before lunch.
                </p>
              </div>
              <div className="mt-[3cqw] space-y-[1.35cqw]">
                {["Prepare the desk", "Phone in another room", "25 minutes of real work", "Ten-minute review"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-[0.9cqw]">
                      <span className="size-[1.2cqw] rounded-full border border-[#b9ab94]" />
                      <span className="text-[1.15cqw] text-[#6f6354]">{item}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-[2%] bottom-[4%] h-[38%] w-[3.5%] rotate-[8deg] rounded-full bg-[#e86147] shadow-md">
          <div className="mx-auto mt-[8%] h-[10%] w-[70%] rounded-full bg-[#ca4b33]" />
        </div>
      </div>
    </div>
  );
}

function TimerScene({ product, view }: { product: ArtProduct; view: ArtView }) {
  const preview = getPreview<{ kind: string; timer: string }>(product, "timer");
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute inset-[8%] rounded-full border border-dashed border-cream/20" />
      <div className="relative flex flex-col items-center">
        <div className="absolute -top-[17%] h-[18%] w-[18%] rounded-t-full border border-white/30 bg-[#ffffff] shadow-md" />
        <div
          className="relative flex aspect-square w-[68cqw] max-w-[62%] items-center justify-center rounded-full border border-white/35 p-[8%] shadow-[0_6cqw_10cqw_-3cqw_rgba(0,0,0,0.55)]"
          style={{
            background:
              "linear-gradient(145deg, #ffffff 0%, #eef2f1 55%, #cfd9d6 100%)",
          }}
        >
          <div className="absolute inset-[3%] rounded-full border-[0.4cqw] border-[#cfd9d6]" />
          <div className="relative flex aspect-square w-full flex-col items-center justify-center rounded-full bg-[#f7f9f8] shadow-[inset_0_1.5cqw_3cqw_rgba(0,0,0,0.12)]">
            <span className="text-[1.45cqw] font-extrabold uppercase tracking-[0.18em] text-[#8b7d68]">
              {view === "back" ? "Phone away" : "Focus block"}
            </span>
            <span className="mt-[1cqw] font-display text-[9cqw] leading-none tracking-[-0.06em] text-[#152232]">
              {preview?.timer ?? "25:00"}
            </span>
            <span className="mt-[1.5cqw] text-[1.2cqw] font-semibold uppercase tracking-[0.14em] text-[#0d6f6d]">
              One honest hour
            </span>
          </div>
          <span className="absolute left-1/2 top-[2.5%] h-[7%] w-[1.2%] -translate-x-1/2 rounded-full bg-[#e86147]" />
        </div>
        <div className="mt-[6%] flex items-center gap-[2cqw]">
          <span className="h-px w-[8cqw] bg-cream/30" />
          <span className="text-[1.2cqw] font-bold uppercase tracking-[0.16em] text-cream/70">
            Screen-free
          </span>
          <span className="h-px w-[8cqw] bg-cream/30" />
        </div>
      </div>
    </div>
  );
}

function GuideScene({ product, view }: { product: ArtProduct; view: ArtView }) {
  const preview = getPreview<{
    kind: string;
    chapters: string[];
    quote: string;
  }>(product, "guide");
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute left-[8%] top-[12%] size-[20%] rounded-full border border-white/15" />
      <div className="relative flex h-[76%] w-[62%] items-end">
        <div className="absolute inset-0 translate-x-[12%] translate-y-[4%] rotate-[5deg] rounded-[1.2cqw] bg-[#e86147]/90 shadow-lg" />
        <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.2cqw] bg-[#ffffff] p-[4.5cqw] shadow-[0_5cqw_9cqw_-3cqw_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between">
            <span className="text-[1.1cqw] font-extrabold uppercase tracking-[0.16em] text-[#e86147]">
              {view === "back" ? "The method" : "A Bengalot guide"}
            </span>
            <span className="font-display text-[2.2cqw] italic text-[#152232]">01</span>
          </div>
          {view === "back" ? (
            <div className="space-y-[1.15cqw]">
              {(preview?.chapters ?? ["Before the session", "One clear target"]).map(
                (chapter, index) => (
                  <div key={chapter} className="flex items-start gap-[1.2cqw]">
                    <span className="font-display text-[1.6cqw] italic text-[#e86147]">
                      0{index + 1}
                    </span>
                    <span className="font-display text-[2.2cqw] leading-tight text-[#152232]">
                      {chapter}
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div>
              <p className="font-display text-[7.5cqw] leading-[0.9] tracking-[-0.055em] text-[#152232]">
                Deep
                <br />
                <span className="italic">work.</span>
              </p>
              <p className="mt-[2cqw] max-w-[85%] text-[1.35cqw] leading-relaxed text-[#716557]">
                A short guide for the study session that keeps slipping away.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-[#e0e7e4] pt-[1.8cqw]">
            <span className="text-[1.05cqw] font-bold uppercase tracking-[0.16em] text-[#9b8d79]">
              Bengalot
            </span>
            <span className="text-[1.05cqw] font-semibold text-[#9b8d79]">32 pages</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[9%] right-[2%] w-[38%] rotate-[-5deg] rounded-[1.2cqw] border border-black/5 bg-[#f3c95f] px-[2cqw] py-[1.4cqw] shadow-md">
        <p className="text-[1.15cqw] font-extrabold uppercase leading-tight tracking-[0.1em] text-[#45350b]">
          Focus is a room you prepare.
        </p>
      </div>
    </div>
  );
}

function BundleScene({ product, view }: { product: ArtProduct; view: ArtView }) {
  const preview = getPreview<{ kind: string; items: string[] }>(product, "bundle");
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute left-[3%] top-[8%] size-[24%] rounded-full bg-white/10" />
      <div className="absolute bottom-[10%] right-[0%] size-[18%] rotate-12 rounded-[20%] border border-cream/20" />
      <div className="relative w-[86%]">
        <div className="absolute -right-[2%] top-[-26%] z-20 w-[32%] rotate-[8deg] rounded-[1.2cqw] border border-white/40 bg-[#ffffff] px-[1.8cqw] py-[1.5cqw] shadow-lg">
          <p className="text-[1.05cqw] font-extrabold uppercase tracking-[0.14em] text-[#0d6f6d]">
            Save 17%
          </p>
          <p className="mt-[0.6cqw] font-display text-[1.8cqw] leading-tight text-[#152232]">
            the complete start
          </p>
        </div>
        <div className="absolute left-[6%] top-[-16%] z-10 h-[30%] w-[26%] -rotate-[8deg] rounded-[1cqw] border border-white/40 bg-[#f3c95f] p-[1.5cqw] shadow-md">
          <p className="text-[1cqw] font-bold uppercase tracking-[0.12em] text-[#45350b]">
            Study cards
          </p>
          <div className="mt-[1cqw] h-[0.6cqw] w-[70%] rounded-full bg-[#45350b]/25" />
        </div>
        <div className="absolute left-[34%] top-[-22%] z-10 h-[32%] w-[28%] rotate-[4deg] rounded-[1cqw] border border-white/30 bg-[#0d6f6d] p-[1.5cqw] shadow-md">
          <div className="h-[0.6cqw] w-[40%] rounded-full bg-cream/50" />
          <div className="mt-[1.1cqw] h-[0.6cqw] w-[70%] rounded-full bg-cream/30" />
          <div className="mt-[1.1cqw] h-[0.6cqw] w-[55%] rounded-full bg-cream/30" />
        </div>
        <div className="relative z-10 flex aspect-[1.35] flex-col justify-between overflow-hidden rounded-[1.8cqw] border border-white/30 bg-[#ffffff] p-[4cqw] shadow-[0_5cqw_10cqw_-3cqw_rgba(0,0,0,0.55)]">
          <div>
            <p className="text-[1.1cqw] font-extrabold uppercase tracking-[0.16em] text-[#e86147]">
              {view === "back" ? "Inside the box" : "The bundle"}
            </p>
            <p className="mt-[1.5cqw] font-display text-[5.5cqw] leading-[0.92] tracking-[-0.04em] text-[#152232]">
              {view === "back" ? "Everything you need." : "Better together."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-[2cqw] gap-y-[1.1cqw]">
            {(preview?.items ?? product.includes.slice(0, 3)).slice(0, 4).map((item) => (
              <div key={item} className="flex items-center gap-[0.8cqw]">
                <span className="size-[1cqw] rounded-full bg-[#0d6f6d]" />
                <span className="text-[1.15cqw] font-medium text-[#6f6354]">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-[2.5%] flex items-center justify-between px-[2%]">
          <span className="text-[1.1cqw] font-bold uppercase tracking-[0.16em] text-cream/60">
            Bengalot · complete kit
          </span>
          <span className="h-px flex-1 mx-[3%] bg-cream/20" />
          <span className="text-[1.1cqw] font-semibold text-cream/60">3 resources</span>
        </div>
      </div>
    </div>
  );
}

function Scene({ product, view }: { product: ArtProduct; view: ArtView }) {
  switch (product.art_key) {
    case "notion":
      return <NotionScene product={product} view={view} />;
    case "cards":
      return <CardsScene product={product} view={view} />;
    case "planner":
      return <PlannerScene product={product} view={view} />;
    case "timer":
      return <TimerScene product={product} view={view} />;
    case "guide":
      return <GuideScene product={product} view={view} />;
    case "bundle":
      return <BundleScene product={product} view={view} />;
    default:
      return <NotionScene product={product} view={view} />;
  }
}

export function ProductArt({
  product,
  view = "front",
  className,
  showCaption = false,
  children,
}: {
  product: ArtProduct;
  view?: ArtView;
  className?: string;
  showCaption?: boolean;
  children?: ReactNode;
}) {
  const palette = product.palette?.length
    ? product.palette
    : ["#0d6f6d", "#0e7c7b", "#f6d365"];
  const p1 = palette[0] ?? "#0d6f6d";
  const p2 = palette[1] ?? "#0e7c7b";
  const p3 = palette[2] ?? "#f6d365";

  const style = {
    "--p1": p1,
    "--p2": p2,
    "--p3": p3,
    backgroundImage: `linear-gradient(145deg, ${p1} 0%, ${p2} 58%, ${p3} 160%)`,
    containerType: "inline-size",
  } as CSSProperties;

  return (
    <div
      role="img"
      aria-label={`${product.title} — original Bengalot product artwork`}
      className={cn(
        "relative isolate h-full w-full overflow-hidden rounded-[inherit] grain",
        className,
      )}
      style={style}
    >
      <div
        className="absolute inset-0 dot-paper opacity-30 mix-blend-soft-light"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 75% at 15% 10%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(80% 80% at 100% 100%, rgba(0,0,0,0.25), transparent 55%)",
        }}
        aria-hidden="true"
      />
      <div className="relative h-full w-full p-[4%] pb-[10%]">
        <Scene product={product} view={view} />
      </div>
      {showCaption ? <Caption product={product} /> : null}
      {children}
    </div>
  );
}

