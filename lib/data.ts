import type {
  Audience,
  Category,
  ColorOption,
  Coupon,
  Department,
  Order,
  Product,
  Review,
  SizeGuideTemplate,
  SizeOption,
} from "./types";
import { STORE_SETTINGS } from "./settings";

/* -------------------------------------------------------------------------- */
/*  Departments                                                               */
/* -------------------------------------------------------------------------- */

export const departments: Department[] = [
  {
    slug: "men",
    name: "Men",
    nameBn: "পুরুষ",
    tagline: "Quiet confidence, cut in cloth.",
    description:
      "From hand-finished panjabis to everyday essentials, a wardrobe built on restraint, texture and the kind of detail you feel before you see.",
    accent: "#3B2A8C",
    accentDeep: "#211756",
    icon: "panjabi",
    heroPalette: ["#171038", "#4B35B8"],
    editorial: "Tailoring with a Bengali soul.",
    sort: 1,
    groups: [
      { title: "Topwear", categories: ["t-shirts", "polo-shirts", "shirts"] },
      { title: "Layers & Knitwear", categories: ["hoodies-sweatshirts", "jackets"] },
      { title: "Ethnic", categories: ["panjabi-fatua"] },
      { title: "Bottoms", categories: ["pants-chinos", "shorts", "joggers"] },
      { title: "Essentials", categories: ["innerwear", "socks"] },
    ],
  },
  {
    slug: "women",
    name: "Women",
    nameBn: "নারী",
    tagline: "Heritage, worn beautifully.",
    description:
      "South Asian craft meets a modern, modest sensibility. Handloom sarees, considered kurtis and pieces designed to move through life with you.",
    accent: "#C2255C",
    accentDeep: "#6E1234",
    icon: "saree",
    heroPalette: ["#3E0D27", "#B02258"],
    editorial: "For the women who carry their roots lightly.",
    sort: 2,
    groups: [
      { title: "Ethnic", categories: ["sarees", "three-piece", "kurtis-tunics"] },
      { title: "Modest", categories: ["borka-abaya", "hijabs-scarves", "modest-wear"] },
      { title: "Everyday", categories: ["tops-tees", "hoodies", "palazzo-pants"] },
      { title: "Essentials", categories: ["innerwear", "hand-socks"] },
    ],
  },
  {
    slug: "kids",
    name: "Kids",
    nameBn: "শিশু",
    tagline: "Little clothes, big character.",
    description:
      "Soft fibres, easy fastenings and joyful little details — made for play, festivals and every ordinary wonderful day in between.",
    accent: "#E9A93A",
    accentDeep: "#81560F",
    icon: "kids",
    heroPalette: ["#B07408", "#E9A93A"],
    editorial: "Small pieces, made with the same care.",
    sort: 3,
    groups: [
      { title: "Wardrobe", categories: ["boys-wear", "girls-wear", "hoodies", "nightwear"] },
      { title: "Ethnic", categories: ["panjabi-ethnic"] },
      { title: "Little Ones", categories: ["baby-essentials"] },
    ],
  },
  {
    slug: "footwear",
    name: "Footwear",
    nameBn: "জুতা",
    tagline: "A good step, well made.",
    description:
      "Leather sneakers, hand-finished formals and easy sandals — designed with the heat, the streets and the long days of Bangladesh in mind.",
    accent: "#0E8F8A",
    accentDeep: "#064945",
    icon: "sneaker",
    heroPalette: ["#06302F", "#0E8F8A"],
    editorial: "Made to walk further.",
    sort: 4,
    groups: [
      { title: "Men's Footwear", categories: ["sneakers", "sandals", "slippers", "formal"] },
      { title: "Women & Kids", categories: ["womens-footwear", "kids-footwear"] },
    ],
  },
  {
    slug: "bags",
    name: "Bags",
    nameBn: "ব্যাগ",
    tagline: "Carry something worth keeping.",
    description:
      "Handwoven jute from our home soil, full-grain leather and quiet hardware. Bags for work, weekends and the road out of town.",
    accent: "#D9693F",
    accentDeep: "#7B3520",
    icon: "jute",
    heroPalette: ["#B8502A", "#D9693F"],
    editorial: "Woven here. Carried everywhere.",
    sort: 5,
    groups: [
      { title: "Everyday", categories: ["jute-bags", "tote-bags"] },
      { title: "Travel", categories: ["backpacks", "travel-bags"] },
      { title: "Small Goods", categories: ["wallets"] },
    ],
  },
  {
    slug: "accessories",
    name: "Accessories",
    nameBn: "এক্সেসরিজ",
    tagline: "The last five percent.",
    description:
      "Watches, gold-toned jewellery, attar and small leather goods — the finishing touches that turn an outfit into a point of view.",
    accent: "#2E7D5B",
    accentDeep: "#154332",
    icon: "jewelry",
    heroPalette: ["#0B2C20", "#2E7D5B"],
    editorial: "Details, in a quieter language.",
    sort: 6,
    groups: [
      { title: "Finishing Touches", categories: ["watches", "jewelry", "belts", "mufflers-gloves"] },
      { title: "Face & Head", categories: ["sunglasses", "caps-hats"] },
      { title: "Fragrance", categories: ["perfumes-attar"] },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Categories                                                               */
/* -------------------------------------------------------------------------- */

const audienceForDepartment = (department: string): Audience => {
  if (department === "men" || department === "women" || department === "kids") {
    return department;
  }
  return "unisex";
};

type CategorySeed = [slug: string, name: string, nameBn: string, department: string, icon: Product["art"], tagline: string];

const categorySeeds: CategorySeed[] = [
  // Men
  ["t-shirts", "T-Shirts", "টি-শার্ট", "men", "tshirt", "Everyday cotton, cut just right."],
  ["polo-shirts", "Polo Shirts", "পোলো শার্ট", "men", "polo", "A collar that means business."],
  ["shirts", "Shirts", "শার্ট", "men", "shirt", "Linen, poplin and everything between."],
  ["hoodies-sweatshirts", "Hoodies & Sweatshirts", "হুডি", "men", "hoodie", "Soft structure for slow days."],
  ["jackets", "Jackets", "জ্যাকেট", "men", "jacket", "The layer that finishes it."],
  ["panjabi-fatua", "Panjabi & Fatua", "পাঞ্জাবি", "men", "panjabi", "Festivity, without the fuss."],
  ["pants-chinos", "Pants & Chinos", "প্যান্ট", "men", "pants", "Clean lines, easy movement."],
  ["shorts", "Shorts", "শর্টস", "men", "shorts", "Warm-weather ease."],
  ["joggers", "Joggers", "জগার", "men", "joggers", "Off-duty, but considered."],
  ["innerwear", "Innerwear", "ইনারওয়্যার", "men", "innerwear", "The quiet foundation."],
  ["socks", "Socks", "মোজা", "men", "socks", "Small comfort, good cotton."],
  // Women
  ["kurtis-tunics", "Kurtis & Tunics", "কুর্তি", "women", "kurti", "The modern everyday staple."],
  ["three-piece", "Three-Piece", "থ্রি-পিস", "women", "dress", "Occasion-ready sets."],
  ["sarees", "Sarees", "শাড়ি", "women", "saree", "Handloom heirlooms."],
  ["tops-tees", "Tops & Tees", "টপস", "women", "tshirt", "Easy tops, thoughtful cuts."],
  ["hoodies", "Hoodies", "হুডি", "women", "hoodie", "Warmth with a little polish."],
  ["palazzo-pants", "Palazzo & Pants", "প্যালাজো", "women", "pants", "Breezy, beautiful bottoms."],
  ["borka-abaya", "Borka & Abaya", "বোরকা", "women", "dress", "Modest, modern silhouettes."],
  ["hijabs-scarves", "Hijabs & Scarves", "হিজাব", "women", "hijab", "Color for every mood."],
  ["modest-wear", "Modest Wear", "মডেস্ট ওয়্যার", "women", "dress", "Covered, never compromised."],
  ["innerwear", "Innerwear", "ইনারওয়্যার", "women", "innerwear", "Softness where it matters."],
  ["hand-socks", "Hand Socks", "হ্যান্ড সকস", "women", "socks", "Soft, warm and made to layer."],
  // Kids
  ["boys-wear", "Boys Wear", "ছেলেদের পোশাক", "kids", "tshirt", "Play-proof pieces."],
  ["girls-wear", "Girls Wear", "মেয়েদের পোশাক", "kids", "dress", "Little celebrations."],
  ["baby-essentials", "Baby Essentials", "শিশুর পোশাক", "kids", "onesie", "Gentle on new skin."],
  ["hoodies", "Hoodies", "হুডি", "kids", "hoodie", "Cosy little layers."],
  ["panjabi-ethnic", "Panjabi & Ethnic", "পাঞ্জাবি", "kids", "panjabi", "Festive, made tiny."],
  ["nightwear", "Nightwear", "নাইটওয়্যার", "kids", "nightwear", "Sweet dreams included."],
  // Footwear
  ["sneakers", "Sneakers", "স্নিকার্স", "footwear", "sneaker", "Leather, laced and easy."],
  ["sandals", "Sandals", "স্যান্ডেল", "footwear", "sandal", "Off-duty feet."],
  ["slippers", "Slippers", "স্লিপার", "footwear", "slipper", "Cushion for the house."],
  ["formal", "Formal", "ফরমাল", "footwear", "formal", "Polished, never stiff."],
  ["womens-footwear", "Women's Footwear", "নারীদের জুতা", "footwear", "heel", "A little lift."],
  ["kids-footwear", "Kids Footwear", "শিশুদের জুতা", "footwear", "sneaker", "Built for running."],
  // Bags
  ["jute-bags", "Jute Bags", "পাটের ব্যাগ", "bags", "jute", "Our golden fibre."],
  ["backpacks", "Backpacks", "ব্যাকপ্যাক", "bags", "backpack", "For the daily carry."],
  ["tote-bags", "Tote Bags", "টোট ব্যাগ", "bags", "tote", "Everything, beautifully."],
  ["wallets", "Wallets", "ওয়ালেট", "bags", "wallet", "Small, considered goods."],
  ["travel-bags", "Travel Bags", "ট্রাভেল ব্যাগ", "bags", "duffel", "Weekend, packed well."],
  // Accessories
  ["caps-hats", "Caps & Hats", "ক্যাপ", "accessories", "cap", "Sun-smart finishing."],
  ["watches", "Watches", "ঘড়ি", "accessories", "watch", "Time, well kept."],
  ["belts", "Belts", "বেল্ট", "accessories", "belt", "The quiet structure."],
  ["sunglasses", "Sunglasses", "সানগ্লাস", "accessories", "sunglasses", "Golden-hour armour."],
  ["jewelry", "Jewelry", "জুয়েলারি", "accessories", "jewelry", "A little heritage, daily."],
  ["perfumes-attar", "Perfumes & Attar", "আতর", "accessories", "perfume", "Scent as memory."],
  ["mufflers-gloves", "Mufflers & Gloves", "মাফলার", "accessories", "muffler", "Winter, softly."],
];

export const categories: Category[] = categorySeeds.map(
  ([slug, name, nameBn, department, icon, tagline]) => ({
    slug,
    name,
    nameBn,
    department,
    audience: audienceForDepartment(department),
    isDemo: true,
    icon,
    tagline,
  })
);

/* -------------------------------------------------------------------------- */
/*  Product helpers                                                           */
/* -------------------------------------------------------------------------- */

const CLOTHING_COLORS: ColorOption[] = [
  { name: "Midnight", nameBn: "মিডনাইট", hex: "#14102B" },
  { name: "Ivory", nameBn: "আইভরি", hex: "#EFE5D2" },
  { name: "Royal Indigo", nameBn: "রয়েল ইন্ডিগো", hex: "#3B2A8C" },
];

const WOMEN_COLORS: ColorOption[] = [
  { name: "Rosewood", nameBn: "রোজউড", hex: "#9E2049" },
  { name: "Ivory", nameBn: "আইভরি", hex: "#EFE5D2" },
  { name: "Emerald", nameBn: "এমারেল্ড", hex: "#175C4A" },
];

const KIDS_COLORS: ColorOption[] = [
  { name: "Saffron", nameBn: "জাফরান", hex: "#D89A32" },
  { name: "Sky", nameBn: "আকাশ", hex: "#4E7FA8" },
  { name: "Rose", nameBn: "গোলাপ", hex: "#C25A73" },
];

const SHOE_COLORS: ColorOption[] = [
  { name: "Espresso", nameBn: "এসপ্রেসো", hex: "#4A3527" },
  { name: "Onyx", nameBn: "অনিক্স", hex: "#1C1A1A" },
  { name: "Sand", nameBn: "বালি", hex: "#B7A184" },
];

const BAG_COLORS: ColorOption[] = [
  { name: "Natural Jute", nameBn: "প্রাকৃতিক পাট", hex: "#B99458" },
  { name: "Espresso", nameBn: "এসপ্রেসো", hex: "#3E2C20" },
  { name: "Midnight", nameBn: "মিডনাইট", hex: "#1A1626" },
];

const ACC_COLORS: ColorOption[] = [
  { name: "Gold", nameBn: "সোনালি", hex: "#C89B45" },
  { name: "Onyx", nameBn: "অনিক্স", hex: "#1C1A1A" },
  { name: "Emerald", nameBn: "এমারেল্ড", hex: "#1F5C48" },
];

const clothingSizes = (stocks: number[] = [7, 14, 12, 8, 4]): SizeOption[] =>
  ["S", "M", "L", "XL", "XXL"].map((label, i) => ({ label, stock: stocks[i] }));

const ethnicSizes = (stocks: number[] = [4, 10, 12, 7, 3]): SizeOption[] =>
  ["S", "M", "L", "XL", "XXL"].map((label, i) => ({ label, stock: stocks[i] }));

const kidsSizes = (): SizeOption[] =>
  ["S", "M", "L", "XL", "XXL"].map((label, i) => ({
    label,
    stock: [6, 9, 7, 4, 2][i],
  }));

const shoeSizes = (women = false): SizeOption[] => {
  const labels = women
    ? ["36", "37", "38", "39", "40", "41"]
    : ["39", "40", "41", "42", "43", "44"];
  return labels.map((label, i) => ({ label, stock: [3, 6, 8, 5, 4, 2][i] }));
};

const kidsShoeSizes = (): SizeOption[] =>
  ["28", "29", "30", "31", "32", "33", "34"].map((label, i) => ({
    label,
    stock: [4, 6, 7, 5, 4, 3, 2][i],
  }));

const oneSize = (stock = 18): SizeOption[] => [{ label: "One Size", stock }];

type Seed = {
  slug: string;
  name: string;
  nameBn: string;
  department: string;
  category: string;
  price: number;
  compareAt?: number;
  art: Product["art"];
  palette: [string, string];
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description?: string;
  materials: string;
  care?: string;
  tags: string[];
  colors?: ColorOption[];
  sizes?: SizeOption[];
  badge?: Product["badge"];
  sets?: Product["sets"];
  sizeGuideId?: string;
  createdAt: string;
};

const seeds: Seed[] = [
  /* -------------------------------- MEN ---------------------------------- */
  {
    slug: "royal-nocturne-panjabi",
    name: "Royal Nocturne Panjabi",
    nameBn: "রয়েল নকটার্ন পাঞ্জাবি",
    department: "men",
    category: "panjabi-fatua",
    price: 4850,
    compareAt: 5900,
    art: "panjabi",
    palette: ["#161033", "#4130A0"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A midnight panjabi with tonal threadwork at the placket — formal enough for an occasion, quiet enough for every one after.",
    description:
      "Cut from a soft cotton-silk blend, the Royal Nocturne is a festive silhouette. A narrow band collar, a covered placket and hand-finished tonal embroidery give it an understated presence. The drape is generous without volume, falling cleanly from shoulder to hem.",
    materials: "Cotton-silk blend · Hand-finished tonal embroidery · Corozo buttons",
    tags: ["Festive", "Panjabi", "Hand-finished"],
    colors: [
      { name: "Midnight", hex: "#14102B" },
      { name: "Deep Indigo", hex: "#2E2266" },
      { name: "Ivory", hex: "#EFE5D2" },
    ],
    sizes: ethnicSizes([5, 12, 14, 8, 3]),
    badge: "New",
    sets: ["new", "best"],
    createdAt: "2026-10-18",
  },
  {
    slug: "ivory-jamdani-panjabi",
    name: "Ivory Jamdani Panjabi",
    nameBn: "আইভরি জামদানি পাঞ্জাবি",
    department: "men",
    category: "panjabi-fatua",
    price: 6200,
    art: "panjabi",
    palette: ["#3B3223", "#8A6C37"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Handwoven jamdani panels, warm ivory ground and a gold-thread motif that only reveals itself up close.",
    description:
      "A limited run of handwoven jamdani, made on pit looms in Narayanganj and tailored into a modern panjabi. Each piece carries slight variations in the weave — the signature of a hand, not a machine. Finished with a soft cotton lining and mother-of-pearl buttons.",
    materials: "Handwoven jamdani cotton · Cotton lining · Mother-of-pearl buttons",
    tags: ["Heritage", "Limited", "Jamdani"],
    colors: [
      { name: "Ivory", hex: "#EFE5D2" },
      { name: "Gold", hex: "#C8A15A" },
    ],
    sizes: ethnicSizes([3, 7, 9, 5, 2]),
    sets: ["best", "trending"],
    createdAt: "2026-09-02",
  },
  {
    slug: "midnight-oversized-tee",
    name: "Midnight Oversized Tee",
    nameBn: "মিডনাইট ওভারসাইজড টি-শার্ট",
    department: "men",
    category: "t-shirts",
    price: 1450,
    art: "tshirt",
    palette: ["#100D22", "#2A1F52"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Heavyweight cotton with a dropped shoulder and a small gold-crest embroidery. The one you reach for first.",
    materials: "240 GSM combed cotton · Pre-shrunk · Gold-crest embroidery",
    tags: ["Everyday", "Oversized", "Cotton"],
    sizes: clothingSizes([8, 18, 20, 12, 5]),
    sets: ["best"],
    createdAt: "2026-08-11",
  },
  {
    slug: "indigo-polo-club",
    name: "Indigo Polo Club",
    nameBn: "ইন্ডিগো পোলো ক্লাব",
    department: "men",
    category: "polo-shirts",
    price: 1890,
    art: "polo",
    palette: ["#191538", "#3A3282"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A piqué polo in deep indigo, with a soft rib collar and our tiny embroidered bengal motif at the chest.",
    materials: "Cotton piqué · Ribbed collar · Embroidered crest",
    tags: ["Smart casual", "Polo", "Everyday"],
    colors: CLOTHING_COLORS,
    sizes: clothingSizes([5, 15, 18, 10, 4]),
    badge: "New",
    sets: ["new"],
    createdAt: "2026-10-01",
  },
  {
    slug: "bengal-tiger-hoodie",
    name: "Bengal Tiger Hoodie",
    nameBn: "বেঙ্গল টাইগার হুডি",
    department: "men",
    category: "hoodies-sweatshirts",
    price: 3250,
    compareAt: 3900,
    art: "hoodie",
    palette: ["#241124", "#5A2044"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A brushed-fleece hoodie with a tonal tiger-stripe jacquard, cut relaxed with a little extra length.",
    materials: "Brushed cotton fleece · Tonal jacquard · Metal-tipped drawcord",
    tags: ["Winter", "Hoodie", "Signature"],
    sizes: clothingSizes([6, 16, 18, 11, 4]),
    sets: ["best", "trending"],
    createdAt: "2026-07-20",
  },
  {
    slug: "dusk-bomber-jacket",
    name: "Dusk Bomber Jacket",
    nameBn: "ডাস্ক বোম্বার জ্যাকেট",
    department: "men",
    category: "jackets",
    price: 5400,
    art: "jacket",
    palette: ["#12101F", "#3B2B5E"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A matte shell bomber in a dusk-purple that reads almost black at night. Light, warm, quietly technical.",
    materials: "Water-resistant cotton shell · Satin lining · Ribbed trims",
    tags: ["Outerwear", "New season", "Travel"],
    sizes: clothingSizes([4, 10, 12, 7, 3]),
    badge: "New",
    sets: ["new", "trending"],
    createdAt: "2026-10-12",
  },
  {
    slug: "linen-resort-shirt",
    name: "Linen Resort Shirt",
    nameBn: "লিনেন রিসোর্ট শার্ট",
    department: "men",
    category: "shirts",
    price: 2450,
    compareAt: 3100,
    art: "shirt",
    palette: ["#233A34", "#0E8F8A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Washed linen in a deep lagoon green. Cut easy, with a camp collar and just enough room to breathe.",
    materials: "100% washed European linen · Camp collar · Natural horn buttons",
    tags: ["Summer", "Linen", "Resort"],
    colors: [
      { name: "Lagoon", hex: "#1E5A55" },
      { name: "Ivory", hex: "#EFE5D2" },
      { name: "Terracotta", hex: "#C15E3C" },
    ],
    sizes: clothingSizes([5, 12, 14, 9, 4]),
    createdAt: "2026-06-14",
  },
  {
    slug: "charcoal-tailored-chino",
    name: "Charcoal Tailored Chino",
    nameBn: "চারকোল টেইলর্ড চিনো",
    department: "men",
    category: "pants-chinos",
    price: 2750,
    art: "pants",
    palette: ["#1B1923", "#454150"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A clean, tapered chino with a touch of stretch — the trouser equivalent of a firm handshake.",
    materials: "Cotton twill with 2% elastane · Tapered leg · Hidden waistband",
    tags: ["Tailored", "Everyday", "Stretch"],
    sizes: clothingSizes([6, 14, 16, 10, 4]),
    sets: ["best"],
    createdAt: "2026-05-30",
  },
  {
    slug: "everyday-luxe-jogger",
    name: "Everyday Luxe Jogger",
    nameBn: "এভরিডে লাক্স জগার",
    department: "men",
    category: "joggers",
    price: 1980,
    art: "joggers",
    palette: ["#1E1830", "#493764"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Brushed cotton, a neat cuff and no logos in sight. Comfort that still looks put together.",
    materials: "Loopback cotton · Elastic cuff · Side seam pockets",
    tags: ["Loungewear", "Jogger", "Everyday"],
    sizes: clothingSizes([7, 16, 18, 10, 5]),
    createdAt: "2026-09-22",
  },
  {
    slug: "gold-thread-fatua",
    name: "Gold Thread Fatua",
    nameBn: "গোল্ড থ্রেড ফতুয়া",
    department: "men",
    category: "panjabi-fatua",
    price: 3600,
    art: "panjabi",
    palette: ["#3A2A10", "#8A6424"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A short, hand-embroidered fatua in warm ecru, finished with a fine gold thread at the neckline.",
    materials: "Handloom cotton · Zari neckline · Side vents",
    tags: ["Festive", "Limited", "Hand-embroidered"],
    sizes: ethnicSizes([3, 8, 9, 5, 2]),
    sets: ["new"],
    createdAt: "2026-10-05",
  },
  {
    slug: "ivory-linen-shirt",
    name: "Ivory Linen Shirt",
    nameBn: "আইভরি লিনেন শার্ট",
    department: "men",
    category: "shirts",
    price: 2650,
    art: "shirt",
    palette: ["#3A3428", "#7C6E52"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "The eternal ivory linen shirt, softened with a garment wash and finished with a relaxed spread collar.",
    materials: "100% garment-washed linen · Spread collar · Shell buttons",
    tags: ["Linen", "Classic", "Summer"],
    sizes: clothingSizes([5, 13, 15, 9, 4]),
    createdAt: "2026-04-18",
  },
  {
    slug: "sunday-linen-shorts",
    name: "Sunday Linen Shorts",
    nameBn: "সানডে লিনেন শর্টস",
    department: "men",
    category: "shorts",
    price: 1650,
    art: "shorts",
    palette: ["#233A38", "#267C74"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A 7-inch linen short with a drawcord waist — for slow Sundays, sea air and everything in between.",
    materials: "Washed linen-cotton · Drawcord waist · 7-inch inseam",
    tags: ["Summer", "Shorts", "Relaxed"],
    sizes: clothingSizes([6, 14, 15, 8, 3]),
    badge: "New",
    sets: ["new"],
    createdAt: "2026-10-20",
  },

  /* ------------------------------- WOMEN --------------------------------- */
  {
    slug: "heirloom-jamdani-saree",
    name: "Heirloom Jamdani Saree",
    nameBn: "হেরিলুম জামদানি শাড়ি",
    department: "women",
    category: "sarees",
    price: 8900,
    art: "saree",
    palette: ["#3B1029", "#861F4C"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A deep rosewood jamdani, handwoven over three weeks with a gold zari border. An heirloom from the first wear.",
    description:
      "This saree carries the quiet irregularity of true handwork. The body is a deep rosewood with a fine gold zari border and traditional buti motifs scattered across the drape. It arrives with a matching unstitched blouse piece and a cotton storage sleeve.",
    materials: "Handwoven jamdani cotton · Gold zari border · Unstitched blouse piece",
    care: "Dry clean only. Air in shade, fold with muslin between layers.",
    tags: ["Jamdani", "Handloom", "Bridal"],
    colors: [
      { name: "Rosewood", hex: "#861F4C" },
      { name: "Indigo", hex: "#2C3D7A" },
      { name: "Emerald", hex: "#175C4A" },
    ],
    sizes: [{ label: "Free Size", stock: 12 }],
    sets: ["best", "trending"],
    createdAt: "2026-08-28",
  },
  {
    slug: "rosewood-handloom-kurti",
    name: "Rosewood Handloom Kurti",
    nameBn: "রোজউড হ্যান্ডলুম কুর্তি",
    department: "women",
    category: "kurtis-tunics",
    price: 2650,
    art: "kurti",
    palette: ["#3D1024", "#8A224B"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A straight-cut handloom kurti in a saturated rosewood, with a notched neckline and side slits.",
    materials: "Handloom cotton · Notched neckline · Side pockets",
    tags: ["Handloom", "Everyday", "Kurti"],
    colors: WOMEN_COLORS,
    sizes: clothingSizes([6, 16, 18, 11, 5]),
    badge: "New",
    sets: ["new", "best"],
    createdAt: "2026-10-15",
  },
  {
    slug: "saffron-silk-three-piece",
    name: "Saffron Silk Three-Piece",
    nameBn: "স্যাফরন সিল্ক থ্রি-পিস",
    department: "women",
    category: "three-piece",
    price: 5750,
    art: "dress",
    palette: ["#4A2E0C", "#B07A22"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A saffron silk-blend set with delicate gold block print — made for celebrations that run late.",
    materials: "Silk-cotton blend · Hand block print · Dupatta included",
    tags: ["Festive", "Three-piece", "Silk"],
    sizes: clothingSizes([4, 11, 13, 8, 3]),
    sets: ["best", "trending"],
    createdAt: "2026-09-10",
  },
  {
    slug: "ivory-chikankari-kurti",
    name: "Ivory Chikankari Kurti",
    nameBn: "আইভরি চিকনকারি কুর্তি",
    department: "women",
    category: "kurtis-tunics",
    price: 3100,
    art: "kurti",
    palette: ["#3A3123", "#6E5E42"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Soft ivory cotton with fine hand chikankari at the yoke. Understated, breathable, endlessly wearable.",
    materials: "Cotton mul · Hand chikankari · Mother-of-pearl buttons",
    tags: ["Hand-embroidery", "Ivory", "Kurti"],
    sizes: clothingSizes([5, 13, 15, 9, 4]),
    createdAt: "2026-07-04",
  },
  {
    slug: "emerald-evening-borka",
    name: "Emerald Evening Borka",
    nameBn: "এমারেল্ড ইভিনিং বোরকা",
    department: "women",
    category: "borka-abaya",
    price: 4200,
    art: "dress",
    palette: ["#0C2A24", "#175C4A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "An emerald crepe borka with a softly sculpted drape and a trim of tonal gold piping.",
    materials: "Premium crepe · Concealed zip · Tonal gold piping",
    tags: ["Modest", "Borka", "Occasion"],
    colors: [
      { name: "Emerald", hex: "#175C4A" },
      { name: "Midnight", hex: "#14102B" },
      { name: "Espresso", hex: "#3E2C20" },
    ],
    sizes: clothingSizes([5, 12, 14, 9, 4]),
    sets: ["best"],
    createdAt: "2026-08-19",
  },
  {
    slug: "terracotta-palazzo",
    name: "Terracotta Palazzo",
    nameBn: "টেরাকোটা প্যালাজো",
    department: "women",
    category: "palazzo-pants",
    price: 1850,
    art: "pants",
    palette: ["#3B1B12", "#A9502F"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Wide-leg palazzos in a warm terracotta cotton, finished with a comfortable smocked waist.",
    materials: "Cotton voile · Smocked waist · Wide leg",
    tags: ["Breezy", "Palazzo", "Everyday"],
    sizes: [{ label: "S–M", stock: 14 }, { label: "L–XL", stock: 11 }, { label: "XXL", stock: 4 }],
    createdAt: "2026-06-29",
  },
  {
    slug: "peacock-silk-hijab",
    name: "Peacock Silk Hijab",
    nameBn: "পিকক সিল্ক হিজাব",
    department: "women",
    category: "hijabs-scarves",
    price: 690,
    art: "hijab",
    palette: ["#082E2C", "#0E8F8A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A liquid-soft peacock silk hijab with a hand-rolled edge. The color is the whole point.",
    materials: "Premium mulberry silk · Hand-rolled edge · 180 × 75 cm",
    tags: ["Hijab", "Silk", "Everyday"],
    colors: [
      { name: "Peacock", hex: "#0E7C78" },
      { name: "Rosewood", hex: "#9E2049" },
      { name: "Saffron", hex: "#C8922F" },
      { name: "Ivory", hex: "#EFE5D2" },
    ],
    sizes: oneSize(42),
    badge: "New",
    sets: ["new", "best"],
    createdAt: "2026-10-22",
  },
  {
    slug: "midnight-bloom-abaya",
    name: "Midnight Bloom Abaya",
    nameBn: "মিডনাইট ব্লুম আবায়া",
    department: "women",
    category: "borka-abaya",
    price: 4950,
    compareAt: 6200,
    art: "dress",
    palette: ["#120E26", "#3B1A48"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Fluid midnight crepe with a subtle tonal bloom print, cut in a generous A-line that moves beautifully.",
    materials: "Premium Nida crepe · Tonal print · Side pockets",
    tags: ["Modest", "Abaya", "New season"],
    sizes: clothingSizes([4, 9, 11, 7, 3]),
    badge: "New",
    sets: ["new", "trending"],
    createdAt: "2026-10-19",
  },
  {
    slug: "modest-coord-set",
    name: "Modest Co-ord Set",
    nameBn: "মডেস্ট কো-অর্ড সেট",
    department: "women",
    category: "modest-wear",
    price: 3450,
    compareAt: 4300,
    art: "dress",
    palette: ["#2A1730", "#6B2A4E"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A longline tunic and wide trouser in a soft plum crepe — polished enough for work, easy enough for everything after.",
    materials: "Crepe de chine · Longline tunic · Coordinated trouser",
    tags: ["Co-ord", "Modest", "Workwear"],
    sizes: clothingSizes([5, 11, 13, 8, 3]),
    sets: ["best"],
    createdAt: "2026-09-18",
  },
  {
    slug: "silk-wrap-top",
    name: "Silk Wrap Top",
    nameBn: "সিল্ক র‍্যাপ টপ",
    department: "women",
    category: "tops-tees",
    price: 2250,
    art: "kurti",
    palette: ["#3A2414", "#8A5732"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A softly draped wrap top in bronze silk-touch fabric. Tuck it in, or let it fall.",
    materials: "Silk-touch weave · Wrap front · Adjustable tie",
    tags: ["Silk", "Top", "Occasion"],
    sizes: clothingSizes([5, 12, 14, 8, 3]),
    createdAt: "2026-07-27",
  },
  {
    slug: "garden-rose-kurti",
    name: "Garden Rose Kurti",
    nameBn: "গার্ডেন রোজ কুর্তি",
    department: "women",
    category: "kurtis-tunics",
    price: 2850,
    art: "kurti",
    palette: ["#3A1420", "#8A2A44"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A garden-rose print on airy cotton, with a gentle A-line and hand-finished sleeves.",
    materials: "Cotton cambric · Hand-finished sleeve · A-line cut",
    tags: ["Print", "Kurti", "Everyday"],
    sizes: clothingSizes([6, 15, 17, 10, 4]),
    createdAt: "2026-05-12",
  },
  {
    slug: "peacock-palazzo-set",
    name: "Peacock Palazzo Set",
    nameBn: "পিকক প্যালাজো সেট",
    department: "women",
    category: "palazzo-pants",
    price: 3250,
    art: "pants",
    palette: ["#0A2C2C", "#147A78"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A matching kurta and palazzo in peacock teal, made for long lunches and warmer evenings.",
    materials: "Cotton-silk blend · Matching set · Hand-finished hem",
    tags: ["Set", "Peacock", "Summer"],
    sizes: clothingSizes([4, 9, 11, 7, 3]),
    sets: ["new"],
    createdAt: "2026-10-08",
  },

  /* -------------------------------- KIDS --------------------------------- */
  {
    slug: "little-raja-panjabi",
    name: "Little Raja Panjabi",
    nameBn: "লিটল রাজা পাঞ্জাবি",
    department: "kids",
    category: "panjabi-ethnic",
    price: 2150,
    art: "panjabi",
    palette: ["#3A260C", "#9A6B1E"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A tiny festive panjabi in soft cotton, with a gold band collar and pearl buttons. For the smallest royal in the room.",
    materials: "Soft cotton · Pearl buttons · Machine washable",
    tags: ["Festive", "Kids", "Panjabi"],
    colors: KIDS_COLORS,
    sizes: kidsSizes(),
    badge: "New",
    sets: ["new", "best"],
    createdAt: "2026-10-02",
  },
  {
    slug: "mini-bengal-hoodie",
    name: "Mini Bengal Hoodie",
    nameBn: "মিনি বেঙ্গল হুডি",
    department: "kids",
    category: "hoodies",
    price: 1650,
    art: "hoodie",
    palette: ["#2A1020", "#7A2348"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A fleecy little hoodie with a soft-lined hood and a tiny embroidered tiger on the chest.",
    materials: "Brushed cotton fleece · Soft-lined hood · Embroidered tiger",
    tags: ["Kids", "Hoodie", "Winter"],
    colors: KIDS_COLORS,
    sizes: kidsSizes(),
    sets: ["best"],
    createdAt: "2026-08-05",
  },
  {
    slug: "junior-play-tee",
    name: "Junior Play Tee",
    nameBn: "জুনিয়র প্লে টি-শার্ট",
    department: "kids",
    category: "boys-wear",
    price: 790,
    art: "tshirt",
    palette: ["#0E2432", "#1E5E7A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A breathable cotton tee with a little room to grow and a print that survives the wash.",
    materials: "100% combed cotton · Water-based print · Pre-shrunk",
    tags: ["Kids", "Everyday", "Cotton"],
    colors: KIDS_COLORS,
    sizes: kidsSizes(),
    createdAt: "2026-06-21",
  },
  {
    slug: "baby-cloud-onesie",
    name: "Baby Cloud Onesie",
    nameBn: "বেবি ক্লাউড ওয়ানসি",
    department: "kids",
    category: "baby-essentials",
    price: 1250,
    art: "onesie",
    palette: ["#3A2A12", "#C08B2E"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "An enzyme-washed cotton onesie, soft as a cloud, with snap openings for easy changes.",
    materials: "Enzyme-washed organic cotton · Nickel-free snaps · OEKO-TEX",
    tags: ["Baby", "Organic", "Soft"],
    sizes: [
      { label: "0–3M", stock: 8 },
      { label: "3–6M", stock: 10 },
      { label: "6–12M", stock: 6 },
      { label: "12–18M", stock: 4 },
    ],
    createdAt: "2026-09-14",
  },
  {
    slug: "little-rani-ethnic-set",
    name: "Little Rani Ethnic Set",
    nameBn: "লিটল রানী এথনিক সেট",
    department: "kids",
    category: "girls-wear",
    price: 2450,
    art: "dress",
    palette: ["#3A1030", "#8A2A62"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A little festive set in rosewood, with a hand-smocked yoke and a soft tulle dupatta.",
    materials: "Cotton silk · Hand smocking · Tulle dupatta included",
    tags: ["Kids", "Festive", "Set"],
    colors: KIDS_COLORS,
    sizes: kidsSizes(),
    badge: "New",
    sets: ["new"],
    createdAt: "2026-10-16",
  },
  {
    slug: "starry-night-set",
    name: "Starry Night Set",
    nameBn: "স্টারি নাইট সেট",
    department: "kids",
    category: "nightwear",
    price: 1150,
    art: "nightwear",
    palette: ["#141A3A", "#2C3A7A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A two-piece cotton night set printed with tiny gold stars. Bedtime, but make it an occasion.",
    materials: "100% cotton jersey · Elastic waist · Gold star print",
    tags: ["Kids", "Nightwear", "Cotton"],
    sizes: kidsSizes(),
    createdAt: "2026-07-11",
  },
  {
    slug: "tiny-tiger-tee",
    name: "Tiny Tiger Tee",
    nameBn: "টাইনি টাইগার টি-শার্ট",
    department: "kids",
    category: "boys-wear",
    price: 890,
    art: "tshirt",
    palette: ["#2E2412", "#C08B2E"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A sunny mustard tee with a small painted tiger. Designed for climbing, running and general mischief.",
    materials: "Combed cotton · Non-toxic water-based print",
    tags: ["Kids", "Play", "Cotton"],
    sizes: kidsSizes(),
    sets: ["new"],
    createdAt: "2026-10-11",
  },

  /* ------------------------------ FOOTWEAR -------------------------------- */
  {
    slug: "rajshahi-leather-sneaker",
    name: "Rajshahi Leather Sneaker",
    nameBn: "রাজশাহী লেদার স্নিকার",
    department: "footwear",
    category: "sneakers",
    price: 4650,
    art: "sneaker",
    palette: ["#2A211B", "#6B5442"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Full-grain leather, a natural crepe sole and a profile clean enough for the office, easy enough for the weekend.",
    description:
      "Made in a small leather workshop in Rajshahi, these sneakers use full-grain leather that softens with wear. The footbed is cushioned memory foam, the sole is natural crepe rubber, and the stitching is double-stitched at every stress point.",
    materials: "Full-grain leather · Natural crepe sole · Memory-foam footbed",
    care: "Wipe with a damp cloth. Condition leather monthly. Air-dry away from direct heat.",
    tags: ["Leather", "Sneaker", "Handmade"],
    colors: SHOE_COLORS,
    sizes: shoeSizes(),
    sets: ["best", "trending"],
    createdAt: "2026-08-14",
  },
  {
    slug: "dhaka-slide-sandal",
    name: "Dhaka Slide Sandal",
    nameBn: "ঢাকা স্লাইড স্যান্ডেল",
    department: "footwear",
    category: "sandals",
    price: 1290,
    art: "sandal",
    palette: ["#162826", "#2F5C55"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Wide leather straps and a moulded footbed. The easiest shoe you'll own this summer.",
    materials: "Vegetable-tanned leather · Moulded EVA footbed · Rubber sole",
    tags: ["Sandals", "Leather", "Summer"],
    colors: SHOE_COLORS,
    sizes: shoeSizes(),
    createdAt: "2026-05-22",
  },
  {
    slug: "atelier-formal-oxford",
    name: "Atelier Formal Oxford",
    nameBn: "অ্যাটেলিয়ার ফরমাল অক্সফোর্ড",
    department: "footwear",
    category: "formal",
    price: 5900,
    art: "formal",
    palette: ["#1A1410", "#4A3527"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A hand-finished leather oxford on a slim last. Made to be resoled, not replaced.",
    materials: "Full-grain calf leather · Blake-stitched leather sole · Calf lining",
    care: "Use shoe trees. Polish with neutral cream. Resole at a leather specialist.",
    tags: ["Formal", "Oxford", "Handmade"],
    colors: [
      { name: "Espresso", hex: "#3E2B1D" },
      { name: "Onyx", hex: "#1C1A1A" },
    ],
    sizes: shoeSizes(),
    sets: ["best"],
    createdAt: "2026-07-09",
  },
  {
    slug: "everyday-cushion-slipper",
    name: "Everyday Cushion Slipper",
    nameBn: "এভরিডে কুশন স্লিপার",
    department: "footwear",
    category: "slippers",
    price: 850,
    art: "slipper",
    palette: ["#2A1B2E", "#5E3A60"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A soft quilted slide with a memory-foam sole. For the house, the balcony and quick errands.",
    materials: "Quilted cotton upper · Memory-foam sole · Non-slip base",
    tags: ["Slipper", "Home", "Soft"],
    colors: [
      { name: "Plum", hex: "#5E3A60" },
      { name: "Ivory", hex: "#EFE5D2" },
      { name: "Onyx", hex: "#1C1A1A" },
    ],
    sizes: shoeSizes(),
    createdAt: "2026-06-08",
  },
  {
    slug: "lotus-heel-sandal",
    name: "Lotus Heel Sandal",
    nameBn: "লোটাস হিল স্যান্ডেল",
    department: "footwear",
    category: "womens-footwear",
    price: 2750,
    art: "heel",
    palette: ["#3A1024", "#8A2A50"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A sculpted block heel with a fine ankle strap — comfortable enough to actually dance in.",
    materials: "Suede upper · Sculpted 6cm block heel · Padded insole",
    tags: ["Heels", "Occasion", "For her"],
    colors: [
      { name: "Rosewood", hex: "#9E2049" },
      { name: "Gold", hex: "#C89B45" },
      { name: "Onyx", hex: "#1C1A1A" },
    ],
    sizes: shoeSizes(true),
    badge: "New",
    sets: ["new"],
    createdAt: "2026-10-06",
  },
  {
    slug: "junior-runner",
    name: "Junior Runner",
    nameBn: "জুনিয়র রানার",
    department: "footwear",
    category: "kids-footwear",
    price: 1890,
    art: "sneaker",
    palette: ["#102A32", "#1E6B78"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A lightweight kids' runner with a wide toe box and a velcro strap they can do up themselves.",
    materials: "Recycled mesh · Bungee laces · Velcro strap",
    tags: ["Kids", "Runner", "Play"],
    colors: KIDS_COLORS,
    sizes: kidsShoeSizes(),
    createdAt: "2026-09-04",
  },

  /* -------------------------------- BAGS --------------------------------- */
  {
    slug: "golden-hour-jute-tote",
    name: "Golden Hour Jute Tote",
    nameBn: "গোল্ডেন আওয়ার জুট টোট",
    department: "bags",
    category: "jute-bags",
    price: 1750,
    art: "jute",
    palette: ["#3A2C14", "#A57B2E"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Handwoven jute, a warm gold stripe and a surprising amount of room. Our signature piece.",
    description:
      "Woven in a cooperative in Faridpur from locally grown jute, this tote is lined in unbleached cotton with a generous inner pocket. Each bag takes a weaver roughly two days to complete. The gold stripe is dyed by hand, so no two bags are exactly alike.",
    materials: "Handwoven jute · Unbleached cotton lining · Leather handles",
    tags: ["Jute", "Handmade", "Signature"],
    colors: BAG_COLORS,
    sizes: oneSize(26),
    sets: ["best", "trending"],
    createdAt: "2026-08-30",
  },
  {
    slug: "midnight-leather-backpack",
    name: "Midnight Leather Backpack",
    nameBn: "মিডনাইট লেদার ব্যাকপ্যাক",
    department: "bags",
    category: "backpacks",
    price: 4350,
    art: "backpack",
    palette: ["#161020", "#3E2C4E"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A slim leather backpack with a padded laptop sleeve and hardware in a soft antique brass.",
    materials: "Full-grain leather · Padded laptop sleeve · Cotton twill lining",
    tags: ["Leather", "Backpack", "Travel"],
    colors: [
      { name: "Midnight", hex: "#1A1626" },
      { name: "Espresso", hex: "#3E2C20" },
      { name: "Tan", hex: "#9A7046" },
    ],
    sizes: oneSize(17),
    sets: ["new", "trending"],
    createdAt: "2026-10-04",
  },
  {
    slug: "saffron-weekend-duffel",
    name: "Saffron Weekend Duffel",
    nameBn: "স্যাফরন উইকএন্ড ডাফল",
    department: "bags",
    category: "travel-bags",
    price: 3950,
    art: "duffel",
    palette: ["#3A260A", "#B07A20"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A 32-litre duffel in saffron canvas and leather trim — the right size for two nights away.",
    materials: "Waxed cotton canvas · Leather trim · Detachable shoulder strap",
    tags: ["Travel", "Duffel", "Weekend"],
    colors: BAG_COLORS,
    sizes: oneSize(13),
    badge: "New",
    sets: ["new"],
    createdAt: "2026-10-13",
  },
  {
    slug: "minimal-card-wallet",
    name: "Minimal Card Wallet",
    nameBn: "মিনিমাল কার্ড ওয়ালেট",
    department: "bags",
    category: "wallets",
    price: 1150,
    art: "wallet",
    palette: ["#1E281C", "#4A5C3A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Six cards, folded notes and nothing else. Smooth vegetable-tanned leather that will age beautifully.",
    materials: "Vegetable-tanned leather · Six card slots · Hand-stitched",
    tags: ["Wallet", "Leather", "Minimal"],
    colors: ACC_COLORS,
    sizes: oneSize(45),
    createdAt: "2026-06-17",
  },
  {
    slug: "woven-jute-shopper",
    name: "Woven Jute Shopper",
    nameBn: "উইভেন জুট শপার",
    department: "bags",
    category: "jute-bags",
    price: 1450,
    art: "jute",
    palette: ["#3A2E18", "#8A6A32"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A softer, slouchier jute shopper in natural ecru with a single braided handle.",
    materials: "Handwoven jute · Braided handle · Cotton lining",
    tags: ["Jute", "Shopper", "Everyday"],
    colors: BAG_COLORS,
    sizes: oneSize(20),
    badge: "New",
    sets: ["new"],
    createdAt: "2026-10-09",
  },
  {
    slug: "canvas-day-tote",
    name: "Canvas Day Tote",
    nameBn: "ক্যানভাস ডে টোট",
    department: "bags",
    category: "tote-bags",
    price: 1290,
    art: "tote",
    palette: ["#2A2620", "#6B6152"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A sturdy everyday canvas tote with an inner zip pocket and a gold-crest print.",
    materials: "18oz cotton canvas · Inner zip pocket · Gold-crest print",
    tags: ["Canvas", "Tote", "Everyday"],
    colors: BAG_COLORS,
    sizes: oneSize(31),
    createdAt: "2026-05-08",
  },

  /* ----------------------------- ACCESSORIES ----------------------------- */
  {
    slug: "royal-bengal-watch",
    name: "Royal Bengal Watch",
    nameBn: "রয়েল বেঙ্গল ঘড়ি",
    department: "accessories",
    category: "watches",
    price: 7850,
    art: "watch",
    palette: ["#2A2010", "#8A6A24"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A 38mm brushed-steel watch with a deep indigo dial and a fine gold second hand.",
    materials: "316L stainless steel · Sapphire crystal · Japanese quartz movement",
    care: "Water-resistant to 5 ATM. Wipe with a soft cloth.",
    tags: ["Watch", "Steel", "Gift"],
    colors: [
      { name: "Indigo Dial", hex: "#243069" },
      { name: "Onyx Dial", hex: "#1C1A1A" },
    ],
    sizes: oneSize(9),
    sets: ["best", "trending"],
    createdAt: "2026-08-07",
  },
  {
    slug: "gold-alpona-pendant",
    name: "Gold Alpona Pendant",
    nameBn: "গোল্ড আলপনা পেন্ডেন্ট",
    department: "accessories",
    category: "jewelry",
    price: 3250,
    art: "jewelry",
    palette: ["#3A2C10", "#B8862A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A hand-carved alpona motif in gold-plated brass, hung on a fine 45cm chain.",
    materials: "18k gold-plated brass · 45cm chain · Hand-carved motif",
    tags: ["Jewelry", "Gold", "Gift"],
    sizes: oneSize(22),
    badge: "New",
    sets: ["new", "best"],
    createdAt: "2026-10-17",
  },
  {
    slug: "heritage-silk-muffler",
    name: "Heritage Silk Muffler",
    nameBn: "হেরিটেজ সিল্ক মাফলার",
    department: "accessories",
    category: "mufflers-gloves",
    price: 1150,
    art: "muffler",
    palette: ["#2A1024", "#7A2248"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A featherlight silk muffler in rosewood with a hand-knotted fringe. Warm without the bulk.",
    materials: "100% mulberry silk · Hand-knotted fringe · 180 × 35 cm",
    tags: ["Silk", "Muffler", "Winter"],
    colors: WOMEN_COLORS,
    sizes: oneSize(16),
    createdAt: "2026-09-26",
  },
  {
    slug: "midnight-leather-belt",
    name: "Midnight Leather Belt",
    nameBn: "মিডনাইট লেদার বেল্ট",
    department: "accessories",
    category: "belts",
    price: 1450,
    art: "belt",
    palette: ["#18131E", "#40324A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A 30mm leather belt with a brushed antique-brass buckle. Quiet hardware, good weight.",
    materials: "Full-grain leather · Antique brass buckle · 30mm width",
    tags: ["Leather", "Belt", "Everyday"],
    colors: [
      { name: "Midnight", hex: "#1A1626" },
      { name: "Espresso", hex: "#3E2C20" },
    ],
    sizes: [
      { label: "S / 30–32", stock: 8 },
      { label: "M / 32–34", stock: 12 },
      { label: "L / 34–36", stock: 9 },
      { label: "XL / 36–38", stock: 4 },
    ],
    createdAt: "2026-05-15",
  },
  {
    slug: "amber-oud-attar",
    name: "Amber & Oud Attar",
    nameBn: "অ্যাম্বার ও উদ আতর",
    department: "accessories",
    category: "perfumes-attar",
    price: 2250,
    art: "perfume",
    palette: ["#3A2410", "#A05E22"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A warm, resinous attar of amber, oud and a breath of rose. Alcohol-free, in a hand-blown bottle.",
    materials: "Alcohol-free attar oil · 12ml hand-blown glass · Amber, oud, rose",
    tags: ["Attar", "Fragrance", "Gift"],
    sizes: oneSize(24),
    sets: ["trending"],
    createdAt: "2026-08-23",
  },
  {
    slug: "classic-crest-cap",
    name: "Classic Crest Cap",
    nameBn: "ক্লাসিক ক্রেস্ট ক্যাপ",
    department: "accessories",
    category: "caps-hats",
    price: 850,
    art: "cap",
    palette: ["#16202E", "#2E4A6B"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "A six-panel cotton cap with a raised gold Bengalot crest and an adjustable brass clasp.",
    materials: "Cotton twill · Raised crest embroidery · Brass clasp",
    tags: ["Cap", "Everyday", "Gold crest"],
    colors: [
      { name: "Navy", hex: "#22344D" },
      { name: "Ivory", hex: "#EFE5D2" },
      { name: "Onyx", hex: "#1C1A1A" },
    ],
    sizes: oneSize(37),
    createdAt: "2026-07-02",
  },
  {
    slug: "onyx-sunglasses",
    name: "Onyx Sunglasses",
    nameBn: "অনিক্স সানগ্লাস",
    department: "accessories",
    category: "sunglasses",
    price: 1950,
    compareAt: 2450,
    art: "sunglasses",
    palette: ["#1A1A1A", "#3A3A3A"],
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "An angular acetate frame with gold hinges and category-3 UV lenses. Sun, handled.",
    materials: "Italian acetate · UV400 lenses · Gold-tone hinges",
    tags: ["Sunglasses", "UV400", "Summer"],
    sizes: oneSize(21),
    createdAt: "2026-06-02",
  },
];

const defaultCare =
  "Gentle machine wash cold with like colors. Do not bleach. Line-dry in shade. Warm iron on reverse.";

/**
 * Every product points at a reusable guide template. This is the same shape the
 * admin panel will use later: create/select a template, save it once, reuse it.
 */
function defaultSizeGuideId(department: string, category: string) {
  if (department === "footwear") {
    if (category === "womens-footwear") return "footwear-women";
    if (category === "kids-footwear") return "footwear-kids";
    return "footwear-men";
  }
  if (department === "kids") return "kids";
  if (department === "bags") return "bags";
  if (department === "accessories") {
    if (category === "watches") return "watches";
    if (category === "belts") return "belts";
    if (category === "caps-hats") return "caps";
    if (category === "jewelry") return "jewelry";
    return "one-size";
  }
  if (department === "men") {
    if (category === "panjabi-fatua") return "men-ethnic";
    if (["pants-chinos", "shorts", "joggers"].includes(category)) return "men-bottoms";
    return "men-tops";
  }
  if (department === "women") {
    if (category === "sarees") return "saree";
    if (category === "hijabs-scarves") return "hijab";
    if (category === "palazzo-pants") return "women-bottoms";
    if (["three-piece", "borka-abaya", "modest-wear"].includes(category)) {
      return "women-ethnic";
    }
    return "women-tops";
  }
  return "one-size";
}

const allProducts: Product[] = seeds.map((seed) => ({
  id: seed.slug,
  slug: seed.slug,
  name: seed.name,
  nameBn: seed.nameBn,
  department: seed.department,
  category: seed.category,
  audience: audienceForDepartment(seed.department),
  isDemo: true,
  price: seed.price,
  compareAt: seed.compareAt,
  rating: seed.rating,
  reviewCount: seed.reviewCount,
  colors: seed.colors ?? CLOTHING_COLORS,
  sizes: seed.sizes ?? clothingSizes(),
  art: seed.art,
  palette: seed.palette,
  badge: seed.badge,
  shortDescription: seed.shortDescription,
  description: seed.description ?? seed.shortDescription,
  materials: seed.materials,
  care: seed.care ?? defaultCare,
  tags: seed.tags,
  sku: `BGL-${seed.slug
    .split("-")
    .map((w) => w.slice(0, 2).toUpperCase())
    .join("")
    .slice(0, 8)}`,
  createdAt: seed.createdAt,
  stock: (seed.sizes ?? []).reduce((sum, s) => sum + s.stock, 0),
  sets: seed.sets ?? [],
  sizeGuideId: seed.sizeGuideId ?? defaultSizeGuideId(seed.department, seed.category),
}));

export const products: Product[] = STORE_SETTINGS.hideDemoContent
  ? allProducts.filter((product) => !product.isDemo)
  : allProducts;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export const getDepartment = (slug: string) =>
  departments.find((d) => d.slug === slug);

export const getCategory = (department: string, slug: string) =>
  categories.find((c) => c.department === department && c.slug === slug);

export const categoriesFor = (department: string) =>
  categories.filter((c) => c.department === department);

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

export const productsFor = (department: string, category?: string) =>
  products.filter(
    (p) => p.department === department && (!category || p.category === category)
  );

export const featuredProducts = (set: "new" | "best" | "trending", limit = 8) =>
  products.filter((p) => p.sets.includes(set)).slice(0, limit);

export const relatedProducts = (product: Product, limit = 4) =>
  products
    .filter(
      (p) =>
        p.department === product.department &&
        p.slug !== product.slug &&
        (p.category === product.category || p.tags.some((t) => product.tags.includes(t)))
    )
    .slice(0, limit);

export const categoryProducts = (department: string, category: string) =>
  productsFor(department, category);

export const countForCategory = (department: string, category: string) =>
  products.filter((p) => p.department === department && p.category === category).length;

export const departmentProductCount = (department: string) =>
  products.filter((p) => p.department === department).length;

export const searchProducts = (query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter((p) =>
    [p.name, p.department, p.category, p.shortDescription, ...p.tags]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
};

export const allNewArrivals = [...products]
  .filter((p) => p.sets.includes("new") || p.badge === "New")
  .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

export const allBestSellers = products.filter((p) => p.sets.includes("best"));

export const allOnSale = products.filter((p) => p.compareAt && p.compareAt > p.price);

export const trendingSearches = [
  "Jamdani saree",
  "Panjabi",
  "Leather sneaker",
  "Jute tote",
  "Kurti",
  "Attar",
  "Hijab",
  "Watch",
];

/* -------------------------------------------------------------------------- */
/*  Reviews                                                                   */
/* -------------------------------------------------------------------------- */

const reviewSeeds: Review[] = [];

// Seeded reviews are intentionally empty. Real reviews should be loaded from
// the database and filtered to approved entries before they reach the storefront.
export const reviews: Review[] = reviewSeeds;

export const reviewsFor = (slug: string) =>
  reviews.filter((r) => r.productSlug === slug);

/* -------------------------------------------------------------------------- */
/*  Coupons & Offers                                                          */
/* -------------------------------------------------------------------------- */

const couponSeeds: Coupon[] = [
  {
    code: "BENGALOT10",
    title: "10% off your first order",
    description: "A little welcome from the house. Applies sitewide on orders over ৳2,000.",
    type: "percent",
    value: 10,
    minSpend: 2000,
    expires: "2026-12-31",
    tone: "royal",
    isDemo: true,
  },
  {
    code: "FREESHIP",
    title: "Complimentary delivery",
    description: "Delivery on us, anywhere in Bangladesh. No minimum spend.",
    type: "shipping",
    value: 0,
    minSpend: 0,
    expires: "2026-12-31",
    tone: "teal",
    isDemo: true,
  },
];

export const coupons: Coupon[] = couponSeeds.filter(
  (coupon) => !STORE_SETTINGS.hideDemoContent || !coupon.isDemo
);

/* -------------------------------------------------------------------------- */
/*  Demo account & orders                                                     */
/* -------------------------------------------------------------------------- */

export const demoUser = {
  name: "Ayesha Rahman",
  firstName: "Ayesha",
  email: "ayesha.rahman@example.com",
  phone: "01711223344",
  birthday: "1996-06-14",
  points: 1240,
  tier: "Gold",
  referral: "AYESHA-GOLD",
  memberSince: "March 2025",
};

const productItem = (slug: string, size: string, color: string, qty = 1) => {
  const p = getProduct(slug)!;
  return {
    productSlug: slug,
    name: p.name,
    size,
    color,
    qty,
    price: p.price,
  };
};

export const demoOrders: Order[] = [
  {
    orderNo: "BG-2610-1842",
    date: "2026-10-24",
    status: "In Transit",
    items: [
      productItem("heirloom-jamdani-saree", "Free Size", "Rosewood"),
      productItem("peacock-silk-hijab", "One Size", "Peacock"),
    ],
    subtotal: 9590,
    discount: 500,
    delivery: 0,
    total: 9090,
    payment: "Cash on Delivery",
    paymentStatus: "Unpaid",
    district: "Dhaka",
    address: "House 14, Road 7, Dhanmondi, Dhaka 1205",
    customer: "Ayesha Rahman",
    phone: "01711223344",
    courier: "Steadfast",
    trackingCode: "SF-8841-2207",
    events: [
      { status: "Order Placed", date: "2026-10-24T10:20:00", note: "Order received. Thank you." },
      { status: "Confirmed", date: "2026-10-24T11:05:00", note: "Confirmed by the atelier." },
      { status: "Processing", date: "2026-10-24T16:40:00", note: "Prepared and packed." },
      { status: "Handed to Courier", date: "2026-10-25T09:15:00", note: "Collected by Steadfast." },
      { status: "In Transit", date: "2026-10-26T08:30:00", note: "Arrived at the Dhaka sorting hub." },
    ],
  },
  {
    orderNo: "BG-2609-1590",
    date: "2026-09-12",
    status: "Delivered",
    items: [
      productItem("rajshahi-leather-sneaker", "42", "Espresso"),
      productItem("classic-crest-cap", "One Size", "Navy"),
    ],
    subtotal: 5500,
    discount: 0,
    delivery: 0,
    total: 5500,
    payment: "bKash",
    paymentStatus: "Paid",
    district: "Dhaka",
    address: "House 14, Road 7, Dhanmondi, Dhaka 1205",
    customer: "Ayesha Rahman",
    phone: "01711223344",
    courier: "Steadfast",
    trackingCode: "SF-8712-1104",
    events: [
      { status: "Order Placed", date: "2026-09-12T14:10:00", note: "Order received." },
      { status: "Confirmed", date: "2026-09-12T14:45:00", note: "Payment verified via bKash." },
      { status: "Processing", date: "2026-09-13T10:00:00", note: "Packed at the atelier." },
      { status: "Handed to Courier", date: "2026-09-13T17:20:00", note: "Collected by Steadfast." },
      { status: "In Transit", date: "2026-09-14T09:00:00", note: "Out for delivery." },
      { status: "Delivered", date: "2026-09-14T15:42:00", note: "Delivered. Thank you for shopping with Bengalot." },
    ],
  },
  {
    orderNo: "BG-2608-0987",
    date: "2026-08-03",
    status: "Delivered",
    items: [productItem("golden-hour-jute-tote", "One Size", "Natural Jute", 2)],
    subtotal: 3500,
    discount: 350,
    delivery: 130,
    total: 3280,
    payment: "Cash on Delivery",
    paymentStatus: "Paid",
    district: "Faridpur",
    address: "Saltha Bazar Road, Saltha, Faridpur",
    customer: "Ayesha Rahman",
    phone: "01711223344",
    courier: "Steadfast",
    trackingCode: "SF-8601-8842",
    events: [
      { status: "Order Placed", date: "2026-08-03T09:00:00", note: "Order received." },
      { status: "Confirmed", date: "2026-08-03T09:30:00", note: "Confirmed." },
      { status: "Handed to Courier", date: "2026-08-03T16:00:00", note: "Collected by Steadfast." },
      { status: "Delivered", date: "2026-08-04T12:15:00", note: "Delivered." },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Lookbook & editorial                                                      */
/* -------------------------------------------------------------------------- */

export const lookbook = [
  {
    slug: "the-jamdani-collection",
    title: "The Jamdani Collection",
    subtitle: "Heritage, rewoven",
    description:
      "Handloom textures and considered details, chosen for modern dressing.",
    productSlug: "heirloom-jamdani-saree",
    accent: "#C2255C",
    palette: ["#2B0C1D", "#8A1F4B"] as [string, string],
    span: "large",
    isDemo: true,
  },
  {
    slug: "midnight-royal",
    title: "Midnight Royal",
    subtitle: "After dark",
    description: "Deep indigo, brushed cotton and a little gold.",
    productSlug: "royal-nocturne-panjabi",
    accent: "#3B2A8C",
    palette: ["#0F0B1E", "#3B2A8C"] as [string, string],
    span: "tall",
    isDemo: true,
  },
  {
    slug: "golden-fibre",
    title: "Golden Fibre",
    subtitle: "Jute, reimagined",
    description: "Warm texture, woven for every day.",
    productSlug: "golden-hour-jute-tote",
    accent: "#D9693F",
    palette: ["#3A1A0C", "#B2572F"] as [string, string],
    span: "small",
    isDemo: true,
  },
  {
    slug: "everyday-icons",
    title: "Everyday Icons",
    subtitle: "The new essentials",
    description: "Soft cotton, clean lines and nothing loud.",
    productSlug: "midnight-oversized-tee",
    accent: "#0E8F8A",
    palette: ["#082A2A", "#0E7C78"] as [string, string],
    span: "small",
    isDemo: true,
  },
].filter((tile) => !STORE_SETTINGS.hideDemoContent || !tile.isDemo);

/* -------------------------------------------------------------------------- */
/*  Size guide                                                                */
/* -------------------------------------------------------------------------- */

export const sizeGuideTemplates: Record<string, SizeGuideTemplate> = {
  "men-tops": {
    id: "men-tops",
    name: "Men's tops",
    note: "Chest is measured around the fullest part. Our tops are cut with 1–2 inches (2.5–5 cm) of ease. Use the IN / CM switch to view measurements in either unit.",
    unit: "Inches",
    columns: ["Size", "Chest", "Waist", "Hip", "Shoulder"],
    rows: [
      ["S", "36–38", "30–32", "36–38", "17"],
      ["M", "38–40", "32–34", "38–40", "17.5"],
      ["L", "40–42", "34–36", "40–42", "18"],
      ["XL", "42–44", "36–38", "42–44", "18.5"],
      ["XXL", "44–46", "38–40", "44–46", "19"],
    ],
    howTo: [
      "Chest — measure around the fullest part of the chest, keeping the tape level.",
      "Waist — measure around the natural waistline, just above the hip bone.",
      "Hip — stand with feet together and measure around the fullest part.",
      "Shoulder — measure from shoulder seam to shoulder seam across the back.",
    ],
  },
  "men-ethnic": {
    id: "men-ethnic",
    name: "Men's ethnic",
    note: "Panjabis and fatuas are cut for a relaxed drape. Length is measured from the high point of the shoulder to the hem. Use the IN / CM switch to view measurements in either unit.",
    unit: "Inches",
    columns: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      ["S", "38–40", "40", "17", "23"],
      ["M", "40–42", "42", "17.5", "23.5"],
      ["L", "42–44", "44", "18", "24"],
      ["XL", "44–46", "45", "18.5", "24.5"],
      ["XXL", "46–48", "46", "19", "25"],
    ],
    howTo: [
      "Chest — measure around the fullest part of the chest with the tape level.",
      "Shoulder — measure across the back from shoulder seam to shoulder seam.",
      "Sleeve — measure from the shoulder seam down to the cuff.",
      "Length — measure from the high shoulder point down to the hem you prefer.",
    ],
  },
  "men-bottoms": {
    id: "men-bottoms",
    name: "Men's bottoms",
    note: "Waist is a body measurement. Trousers and joggers include a hidden comfort waistband with 1–2 inches (2.5–5 cm) of ease. Use the IN / CM switch to view measurements in either unit.",
    unit: "Inches",
    columns: ["Size", "Waist", "Hip", "Inseam", "Length"],
    rows: [
      ["S", "30–32", "38–40", "30", "40"],
      ["M", "32–34", "40–42", "30.5", "41"],
      ["L", "34–36", "42–44", "31", "42"],
      ["XL", "36–38", "44–46", "31.5", "43"],
      ["XXL", "38–40", "46–48", "32", "44"],
    ],
    howTo: [
      "Waist — measure around the narrowest part of your waist, keeping one finger of ease.",
      "Hip — measure around the fullest part, roughly 8 inches (20 cm) below the waist.",
      "Inseam — measure from the crotch seam to the desired trouser hem.",
      "Length — measure from waistband to hem on a pair that fits you well.",
    ],
  },
  "women-tops": {
    id: "women-tops",
    name: "Women's tops",
    note: "Kurtis and tops are cut for a relaxed fit. Use the IN / CM switch to view measurements in either unit.",
    unit: "Inches",
    columns: ["Size", "Bust", "Waist", "Hip", "Length"],
    rows: [
      ["S", "33–35", "27–29", "36–38", "41"],
      ["M", "35–37", "29–31", "38–40", "42"],
      ["L", "37–39", "31–33", "40–42", "43"],
      ["XL", "39–41", "33–35", "42–44", "44"],
      ["XXL", "41–43", "35–37", "44–46", "45"],
    ],
    howTo: [
      "Bust — measure around the fullest part, keeping the tape parallel to the floor.",
      "Waist — find your natural waist, usually the narrowest point.",
      "Hip — measure around the fullest part, about 8 inches (20 cm) below the waist.",
      "Length — measured from the shoulder seam to the hem.",
    ],
  },
  "women-ethnic": {
    id: "women-ethnic",
    name: "Women's ethnic",
    note: "Three-piece and borka lengths are measured from shoulder to hem. Dupattas are 2.5 m. Use the IN / CM switch to view measurements in either unit.",
    unit: "Inches",
    columns: ["Size", "Bust", "Waist", "Hip", "Length"],
    rows: [
      ["S", "33–35", "27–29", "36–38", "45"],
      ["M", "35–37", "29–31", "38–40", "46"],
      ["L", "37–39", "31–33", "40–42", "47"],
      ["XL", "39–41", "33–35", "42–44", "48"],
      ["XXL", "41–43", "35–37", "44–46", "49"],
    ],
    howTo: [
      "Bust — measure around the fullest part with the tape level.",
      "Waist — measure around your natural waist with one finger of ease.",
      "Hip — measure around the fullest part, keeping the tape parallel.",
      "Length — decide where you want the hem, then measure from the shoulder.",
    ],
  },
  "women-bottoms": {
    id: "women-bottoms",
    name: "Women's bottoms",
    note: "Palazzos and trousers have a soft, adjustable waist. Use the IN / CM switch to view measurements in either unit.",
    unit: "Inches",
    columns: ["Size", "Waist", "Hip", "Length", "Inseam"],
    rows: [
      ["S", "26–28", "36–38", "40", "27.5"],
      ["M", "28–30", "38–40", "41", "28"],
      ["L", "30–32", "40–42", "42", "28.5"],
      ["XL", "32–34", "42–44", "43", "29"],
      ["XXL", "34–36", "44–46", "44", "29.5"],
    ],
    howTo: [
      "Waist — measure around the natural waist, where the waistband will sit.",
      "Hip — measure around the fullest part, roughly 8 inches (20 cm) below the waist.",
      "Inseam — measure from the crotch seam to your preferred hem.",
      "Length — measure from waistband to hem on a similar pair you own.",
    ],
  },
  saree: {
    id: "saree",
    name: "Saree sizing",
    note: "The saree is free size and arrives with an unstitched blouse piece. Tailoring is not included.",
    unit: "Details",
    columns: ["Measure", "Details"],
    rows: [
      ["Saree length", "5.5 m"],
      ["Blouse piece", "0.8 m · unstitched"],
      ["Saree width", "1.2 m"],
      ["Border", "Hand-finished zari"],
    ],
    howTo: [
      "The saree is free size and draped to suit you — no sizing required.",
      "Take the included blouse piece to your tailor for a fitted blouse.",
      "Store folded in the cotton sleeve provided, with muslin between folds.",
    ],
  },
  hijab: {
    id: "hijab",
    name: "Hijab & scarf sizing",
    note: "One size, designed for an easy drape. Measurements are approximate as each piece is hand-finished.",
    unit: "Details",
    columns: ["Measure", "Details"],
    rows: [
      ["Length", "180 cm"],
      ["Width", "75 cm"],
      ["Fabric", "Mulberry silk"],
      ["Finish", "Hand-rolled edge"],
    ],
    howTo: [
      "Hold the scarf at the centre of the long edge and place it over your head.",
      "Pin or wrap according to your preferred style — no cutting required.",
      "Hand-wash cold or dry clean to protect the hand-rolled edge.",
    ],
  },
  kids: {
    id: "kids",
    name: "Kids' measurements",
    note: "Sized S–XXL by age and height. Use the IN / CM switch to view measurements in either unit. When in doubt, size up for room to grow.",
    unit: "Inches",
    columns: ["Size", "Age", "Height", "Chest", "Waist"],
    rows: [
      ["S", "2–3Y", "36–39\"", "21–22\"", "20–21\""],
      ["M", "4–5Y", "39–43\"", "22–24\"", "21–22\""],
      ["L", "6–7Y", "43–47\"", "24–26\"", "22–23\""],
      ["XL", "8–9Y", "47–51\"", "26–28\"", "23–25\""],
      ["XXL", "10–11Y", "51–55\"", "28–30\"", "25–27\""],
    ],
    howTo: [
      "Height — stand your child against a wall and measure without shoes.",
      "Chest — measure around the fullest part, under the arms.",
      "Waist — measure around the natural waist with one finger of ease.",
    ],
  },
  "footwear-men": {
    id: "footwear-men",
    name: "Men's footwear",
    note: "Our shoes run true to size. If between sizes, choose the larger for sneakers.",
    unit: "EU sizing",
    columns: ["EU", "UK", "US Men", "US Women", "Foot length (cm)"],
    rows: [
      ["39", "6", "6.5", "8", "24.5"],
      ["40", "6.5", "7", "8.5", "25.1"],
      ["41", "7.5", "8", "9.5", "25.8"],
      ["42", "8", "8.5", "10", "26.5"],
      ["43", "9", "9.5", "11", "27.1"],
      ["44", "9.5", "10", "11.5", "27.8"],
    ],
    howTo: [
      "Trace your foot on paper while standing, heel to wall.",
      "Measure from heel to longest toe in centimetres.",
      "Add 0.5 cm for comfort; match to the foot length column.",
    ],
  },
  "footwear-women": {
    id: "footwear-women",
    name: "Women's footwear",
    note: "Our women's styles run true to size. If between sizes, choose the larger for closed shoes.",
    unit: "EU sizing",
    columns: ["EU", "UK", "US Women", "Foot length (cm)"],
    rows: [
      ["36", "3", "5.5", "22.5"],
      ["37", "4", "6.5", "23.2"],
      ["38", "5", "7.5", "23.8"],
      ["39", "6", "8.5", "24.5"],
      ["40", "6.5", "9", "25.1"],
      ["41", "7.5", "10", "25.8"],
    ],
    howTo: [
      "Trace your foot on paper while standing, heel to wall.",
      "Measure from heel to longest toe in centimetres.",
      "Match to the foot length column; add 0.5 cm for closed toes.",
    ],
  },
  "footwear-kids": {
    id: "footwear-kids",
    name: "Kids' footwear",
    note: "Leave 0.5–1 cm of growing room. When between sizes, size up.",
    unit: "EU sizing",
    columns: ["EU", "Approx. age", "Foot length (cm)"],
    rows: [
      ["28", "3–4Y", "17.5"],
      ["29", "4–5Y", "18.2"],
      ["30", "5–6Y", "18.8"],
      ["31", "6–7Y", "19.5"],
      ["32", "7–8Y", "20.1"],
      ["33", "8–9Y", "20.8"],
      ["34", "9–10Y", "21.5"],
    ],
    howTo: [
      "Stand your child on paper and mark the heel and longest toe.",
      "Measure the distance in centimetres.",
      "Add 0.5–1 cm for growth before choosing the size.",
    ],
  },
  bags: {
    id: "bags",
    name: "Bag dimensions",
    note: "Dimensions vary slightly by style and handwoven batch. The exact piece is checked before dispatch.",
    unit: "Centimetres",
    columns: ["Measure", "Approx. size"],
    rows: [
      ["Width", "38 cm"],
      ["Height", "42 cm"],
      ["Depth", "12 cm"],
      ["Handle drop", "22 cm"],
    ],
    howTo: [
      "Check the width and height against a bag you already carry.",
      "The handle drop is measured from the top of the handle to the bag opening.",
      "Handwoven jute can relax slightly with use; this is normal.",
    ],
  },
  belts: {
    id: "belts",
    name: "Belt sizing",
    note: "Choose by your trouser waist size. If between sizes, take the larger.",
    unit: "Centimetres",
    columns: ["Size", "Body waist", "Belt length"],
    rows: [
      ["S", "30–32 in", "100 cm"],
      ["M", "32–34 in", "110 cm"],
      ["L", "34–36 in", "120 cm"],
      ["XL", "36–38 in", "130 cm"],
    ],
    howTo: [
      "Measure your waist where you wear your belt.",
      "Alternatively, measure an existing belt from buckle to favourite hole.",
      "The belt length includes the buckle.",
    ],
  },
  caps: {
    id: "caps",
    name: "Cap sizing",
    note: "One size with an adjustable brass clasp. Fits most head sizes comfortably.",
    unit: "Centimetres",
    columns: ["Measure", "Details"],
    rows: [
      ["Fit", "One size"],
      ["Adjustable range", "54–60 cm circumference"],
      ["Brim", "7 cm"],
      ["Crown", "Structured cotton twill"],
    ],
    howTo: [
      "Measure around your head just above the ears.",
      "Adjust the brass clasp at the back for a comfortable fit.",
      "The brim can be gently shaped by hand.",
    ],
  },
  watches: {
    id: "watches",
    name: "Watch sizing",
    note: "One case size with a quality quartz movement and a comfortable strap.",
    unit: "Millimetres",
    columns: ["Measure", "Details"],
    rows: [
      ["Case diameter", "38 mm"],
      ["Case thickness", "8.5 mm"],
      ["Strap width", "20 mm"],
      ["Fits wrist", "14–21 cm"],
    ],
    howTo: [
      "Measure your wrist just below the wrist bone with a soft tape.",
      "If you are between 14 and 21 cm, the strap will fit comfortably.",
      "Links can be adjusted by any local watch service.",
    ],
  },
  jewelry: {
    id: "jewelry",
    name: "Jewellery sizing",
    note: "One length, designed to sit just below the collarbone. The pendant is hand-finished.",
    unit: "Centimetres",
    columns: ["Measure", "Details"],
    rows: [
      ["Chain length", "45 cm"],
      ["Pendant", "2.2 cm"],
      ["Closure", "Lobster clasp"],
      ["Finish", "18k gold-plated brass"],
    ],
    howTo: [
      "The 45 cm chain sits just below the collarbone on most necks.",
      "For a layered look, wear it with a shorter chain you already own.",
      "Keep away from perfume and water to preserve the plating.",
    ],
  },
  "one-size": {
    id: "one-size",
    name: "One-size details",
    note: "This piece is one size and ready to wear. Check the product details for specific dimensions.",
    unit: "Details",
    columns: ["Measure", "Details"],
    rows: [
      ["Fit", "One size"],
      ["Fabric", "See product details"],
      ["Care", "See the care card included"],
    ],
    howTo: [
      "This piece is designed as one size and needs no size selection.",
      "If you would like exact dimensions, ask us on WhatsApp.",
      "Follow the care card included with your order.",
    ],
  },
};

export function getSizeGuide(id?: string): SizeGuideTemplate {
  return sizeGuideTemplates[id ?? "one-size"] ?? sizeGuideTemplates["one-size"];
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export const faqs = [
  {
    q: "How long does delivery take?",
    a: "Orders within Faridpur district usually arrive in 1–2 working days. Elsewhere in Bangladesh, 2–4 working days. All orders are shipped with Steadfast and you will receive a tracking code by SMS as soon as your parcel is collected.",
  },
  {
    q: "What are the delivery charges?",
    a: STORE_SETTINGS.freeDeliveryEnabled
      ? `Delivery is ৳70 inside Faridpur district and ৳130 for all other districts in Bangladesh. Delivery is complimentary on orders over ৳${STORE_SETTINGS.freeDeliveryThreshold.toLocaleString("en-US")}.`
      : "Delivery is ৳70 inside Faridpur district and ৳130 for all other districts in Bangladesh.",
  },
  {
    q: "Can I pay cash on delivery?",
    a: "Yes. Cash on Delivery is available across Bangladesh. Pay the courier when your parcel arrives.",
  },
  {
    q: "Do you offer exchanges?",
    a:
      STORE_SETTINGS.exchangeWindowEnabled && STORE_SETTINGS.exchangeWindowDays > 0
        ? `Yes — unused items with tags intact can be exchanged within ${STORE_SETTINGS.exchangeWindowDays} days of delivery. Contact us on WhatsApp at 01341739202 or email support@bengalot.com to arrange a pickup.`
        : "Contact us on WhatsApp at 01341739202 or email support@bengalot.com and we will check the options for your item under the current return policy.",
  },
  {
    q: "Are your sarees and panjabis handmade?",
    a: "Our jamdani pieces are handwoven. Small variations in the weave are a signature of handwork, not a defect.",
  },
  {
    q: "How do I find my size?",
    a: "Every product page has a size guide with garment measurements. If you are between sizes, our team is happy to advise on WhatsApp — send us your height and usual size and we will help.",
  },
  {
    q: "Can I order for someone else?",
    a: "Absolutely. At checkout, simply enter the recipient's name, phone number and address. You can add a gift note and we will leave the price off the packing slip.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with your order number and phone number. You can also reply to your confirmation SMS or message us on WhatsApp for a live update.",
  },
];

export const trustPoints = [
  { title: "Cash on Delivery", text: "Pay at your door, anywhere in Bangladesh." },
  { title: "Direct support", text: "Reach a real person on WhatsApp." },
  { title: "Steadfast delivery", text: "Tracked delivery across Bangladesh." },
  { title: "Secure checkout", text: "Your details stay private and protected." },
];
