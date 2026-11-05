import { AdminPageHeader } from "@/components/admin/admin-ui";
import { InboxManager } from "@/components/admin/inbox-manager";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminInboxPage() {
  await requireAdminPageRole(["super_admin", "manager", "support"]);
  const admin = createAdminSupabaseClient();
  const [contact, support, newsletter, returns] = admin
    ? await Promise.all([
        admin.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(300),
        admin.from("support_messages").select("*").order("created_at", { ascending: false }).limit(300),
        admin.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(1000),
        admin.from("return_requests").select("*").order("created_at", { ascending: false }).limit(300),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Customer care"
        title="Inbox"
        description="Contact requests, support messages, return claims and newsletter subscribers in one queue."
      />
      <InboxManager
        initial={{
          contact: contact.data ?? [],
          support: support.data ?? [],
          newsletter: newsletter.data ?? [],
          returns: returns.data ?? [],
        }}
      />
    </div>
  );
}
