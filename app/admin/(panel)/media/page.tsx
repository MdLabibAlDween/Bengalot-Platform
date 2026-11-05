import { AdminPageHeader } from "@/components/admin/admin-ui";
import { MediaManager } from "@/components/admin/media-manager";
import { getMediaSlots } from "@/lib/admin/settings";

export default async function AdminMediaPage() {
  const media = await getMediaSlots();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Artwork"
        title="Media & image slots"
        description="Upload or paste an image, press Save, and the matching storefront surface updates immediately. Hero, department, category, product, lookbook, gift-card and reel poster slots are connected."
      />
      <MediaManager initial={media} />
    </div>
  );
}
