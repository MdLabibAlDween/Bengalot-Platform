import { AdminPageHeader } from "@/components/admin/admin-ui";
import { RedirectsManager } from "@/components/admin/redirects-manager";
import { getRedirects } from "@/lib/admin/settings";

export default async function AdminRedirectsPage() {
  const redirects = await getRedirects();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Storefront"
        title="URL redirects"
        description="Sort legacy links, map renamed pages and keep shared links working without touching next.config."
      />
      <RedirectsManager initial={redirects} />
    </div>
  );
}
