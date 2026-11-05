import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ContentEditor, type Json } from "@/components/admin/content-editor";
import { ensureSiteContent } from "@/lib/site-content";

export default async function AdminContentPage() {
  const content = await ensureSiteContent();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Storefront"
        title="Page content"
        description="Write the actual words customers see on Home, About, Contact, FAQ, Lookbook, the policies and the footer. Product and collection data stay in their own modules."
      />
      <ContentEditor initial={content as unknown as Record<string, Json>} />
    </div>
  );
}
