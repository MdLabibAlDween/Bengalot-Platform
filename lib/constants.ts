export const SITE = {
  name: "Bengalot",
  legalName: "Bengalot",
  domain: "bengalot.com",
  url: "https://bengalot.com",
  description:
    "Premium fashion from Bengal — heirloom-inspired clothing, footwear, bags and accessories. Delivery across Bangladesh.",
  email: "support@bengalot.com",
  infoEmail: "info@bengalot.com",
  whatsapp: "01341739202",
  whatsappIntl: "8801341739202",
  address: "Saltha, Faridpur, Bangladesh",
  addressShort: "Saltha · Faridpur · Bangladesh",
  timezone: "Asia/Dhaka",
  socials: {
    facebook: "https://facebook.com/bengalot",
    instagram: "",
    tiktok: "",
    youtube: "",
  },
};

export const WHATSAPP_LINK = `https://wa.me/${SITE.whatsappIntl}?text=${encodeURIComponent(
  "Hello Bengalot! I would like to know more about your collection."
)}`;

export function productWhatsAppLink({
  productName,
  sku,
  color,
  size,
  quantity,
  price,
  url,
}: {
  productName: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  price: string;
  url: string;
}) {
  const message = [
    "Hello Bengalot! I would like to ask about this order:",
    "",
    `Product: ${productName}`,
    `SKU: ${sku}`,
    `Colour: ${color}`,
    `Size: ${size}`,
    `Quantity: ${quantity}`,
    `Price: ${price}`,
    `Link: ${url}`,
  ].join("\n");

  return `https://wa.me/${SITE.whatsappIntl}?text=${encodeURIComponent(message)}`;
}

export const DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
  "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla",
  "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
  "Habiganj", "Jamalpur", "Jashore", "Jhalokathi", "Jhenaidah", "Joypurhat",
  "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur",
  "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar",
  "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
  "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh",
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
  "Tangail", "Thakurgaon",
];

export const ORDER_STATUS_META: Record<
  string,
  { label: string; tone: string; dot: string }
> = {
  "Order Placed": { label: "Order Placed", tone: "bg-amber-50 text-amber-800", dot: "bg-gold" },
  Pending: { label: "Pending", tone: "bg-amber-50 text-amber-800", dot: "bg-gold" },
  Confirmed: { label: "Confirmed", tone: "bg-indigo-50 text-indigo-800", dot: "bg-royal" },
  Processing: { label: "Processing", tone: "bg-indigo-50 text-indigo-800", dot: "bg-royal" },
  "Handed to Courier": { label: "Handed to Courier", tone: "bg-teal-50 text-teal-800", dot: "bg-teal" },
  "In Transit": { label: "In Transit", tone: "bg-teal-50 text-teal-800", dot: "bg-teal" },
  Delivered: { label: "Delivered", tone: "bg-emerald-50 text-emerald-800", dot: "bg-jade" },
  Returning: { label: "Returning", tone: "bg-amber-50 text-amber-800", dot: "bg-saffron" },
  Cancelled: { label: "Cancelled", tone: "bg-rose-50 text-rose-800", dot: "bg-magenta" },
  Returned: { label: "Returned", tone: "bg-rose-50 text-rose-800", dot: "bg-magenta" },
  "Failed Delivery": { label: "Failed Delivery", tone: "bg-rose-50 text-rose-800", dot: "bg-magenta" },
  Refunded: { label: "Refunded", tone: "bg-stone-100 text-stone-700", dot: "bg-stone" },
};

export const PAYMENT_BADGES = ["Cash on Delivery", "bKash", "Steadfast"];
