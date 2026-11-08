export const siteConfig = {
  name: "Bengalot",
  domain: "bengalot.com",
  slogan: "Bring a lot to learning.",
  description:
    "Notion templates, study cards, printable planners and quiet focus tools for students and independent learners in Bangladesh.",
  supportEmail: "support@bengalot.com",
  whatsappDisplay: "01341739202",
  whatsappNumber: "8801341739202",
  city: "Saltha, Faridpur, Bangladesh",
  delivery: {
    inside: 70,
    outside: 130,
    freeOver: 2000,
    currency: "BDT",
  },
} as const;

export function getWhatsAppUrl(message?: string) {
  const base = `https://wa.me/${siteConfig.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
