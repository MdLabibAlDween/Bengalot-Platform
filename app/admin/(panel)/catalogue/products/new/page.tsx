import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductEditor, type ProductEditorValue } from "@/components/admin/product-editor";
import { departments, sizeGuideTemplates } from "@/lib/data";
import { getAllStoreCategories } from "@/lib/taxonomy-db";

export default async function NewProductPage() {
  const categories = await getAllStoreCategories();
  const firstDepartment = departments[0]?.slug ?? "men";
  const value: ProductEditorValue = {
    name: "",
    slug: "",
    department: firstDepartment,
    category:
      categories.find((category) => category.department === firstDepartment)?.slug ??
      "t-shirts",
    audience: "unisex",
    price: 0,
    compareAt: null,
    stock: 0,
    status: "draft",
    isDemo: false,
    sizes: [{ label: "One size", stock: 0 }],
    colors: [{ name: "Default", hex: "#3B2A8C" }],
    variants: [],
    images: [],
    seoTitle: "",
    seoDescription: "",
    imageUrl: "",
    hoverImageUrl: "",
    videoUrl: "",
    shortDescription: "",
    description: "",
    materials: "",
    care: "",
    tags: [],
    sets: ["new"],
    badge: "",
    sku: "",
    sizeGuideId: "men-tops",
    collectionSlug: "",
    collectionNote: "",
    highlights: [],
    materialLines: [],
    careLines: [],
    fitNote: "",
  };
  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Add product"
        description="Create the product, upload the gallery, generate variants and publish when ready."
      />
      <ProductEditor
        initial={value}
        departments={departments.map(({ slug, name }) => ({ slug, name }))}
        categories={categories.map(({ slug, name, department }) => ({ slug, name, department }))}
        sizeGuides={Object.values(sizeGuideTemplates).map(({ id, name }) => ({ id, name }))}
      />
    </div>
  );
}
