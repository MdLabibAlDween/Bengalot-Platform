import { ContentEditor } from "@/components/admin/content-editor";
import { requireStaff } from "@/lib/auth";
import { getPageContent } from "@/lib/page-content.server";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireStaff("/admin/content");
  const content = await getPageContent();

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-6">
        <p className="eyebrow">Content</p>
        <h1 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.045em] text-ink sm:text-[2.8rem]">
          The words{" "}
          <span className="display-italic text-teal">that carry it.</span>
        </h1>
        <p className="mt-2 max-w-[40rem] text-[0.76rem] leading-relaxed text-muted">
          Edit the announcement bar, Journal notes, Our Story and FAQ without
          touching code. Changes publish straight to the storefront.
        </p>
      </div>

      <ContentEditor content={content} />
    </div>
  );
}
