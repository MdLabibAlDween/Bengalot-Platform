export type PolicyCard = {
  label: string;
  value: string;
  note: string;
};

export type PolicySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
  cards?: PolicyCard[];
};

export type PolicyPageContent = {
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  updated?: string;
  sections: PolicySection[];
};

export type PolicyKey = "privacy" | "shipping" | "returns" | "terms";

export const DEFAULT_POLICIES: Record<PolicyKey, PolicyPageContent> = {
  privacy: {
    eyebrow: "Privacy",
    title: "Your details, respected.",
    shortTitle: "Privacy policy",
    description:
      "We collect only what we need to deliver your order and improve the shop. We never sell your data. Here is the plain-language version.",
    updated: "4 November 2026",
    sections: [
      {
        id: "collect",
        title: "What we collect",
        paragraphs: [],
        bullets: [
          "Order details: name, phone number, email (optional), delivery address, order contents and notes.",
          "Account details: if you create an account, your name, email, phone, addresses and reward activity.",
          "Technical data: browser type, device and anonymous usage data to understand what is working on the site.",
          "Messages: anything you send through the contact form, WhatsApp or email.",
        ],
      },
      {
        id: "use",
        title: "How we use it",
        paragraphs: ["Your information is used to:"],
        bullets: [
          "Process and deliver your order.",
          "Send order confirmations, tracking updates and service messages.",
          "Provide customer support and handle exchanges.",
          "Improve our products and website experience.",
          "Send marketing only if you have opted in — you can unsubscribe any time.",
        ],
      },
      {
        id: "sharing",
        title: "Who we share with",
        paragraphs: [
          "We share only what is necessary with trusted service providers: Steadfast Courier for delivery, our SMS and email providers for notifications, and our payment provider if you pay by bKash. They are not permitted to use your data for their own marketing.",
          "We do not sell, rent or trade your personal information. We may disclose data if required by law or to protect the rights and safety of Bengalot and our customers.",
        ],
        bullets: [],
      },
      {
        id: "cookies",
        title: "Cookies",
        paragraphs: [
          "We use essential cookies to keep your bag, wishlist and preferences working. With your consent, we may also use analytics cookies to understand how people browse the site. You can clear or block cookies in your browser settings; essential shopping features may stop working if you do.",
        ],
        bullets: [],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: [
          "You may ask us for a copy of your data, request corrections, or ask us to delete your account and personal data. You can delete your account from the security page of your account, or email {{email}} with the subject “Privacy request”.",
          "We keep order records for as long as required for accounting and tax purposes, and then delete or anonymise them.",
        ],
        bullets: [],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "Data is stored with reputable infrastructure providers, protected by encryption in transit and access controls. Payment credentials are never stored on our servers. Two-factor authentication and device-session controls are available in your account.",
          "This policy may be updated as the shop grows. The “last updated” date at the top always reflects the current version.",
        ],
        bullets: [],
      },
    ],
  },
  shipping: {
    eyebrow: "Shipping & delivery",
    title: "From our door to yours.",
    shortTitle: "Shipping policy",
    description:
      "Everything you need to know about how Bengalot parcels travel — charges, timings, tracking and cash on delivery.",
    updated: "4 November 2026",
    sections: [
      {
        id: "charges",
        title: "Delivery charges",
        paragraphs: [
          "We keep delivery simple and fair across Bangladesh. The charge depends only on your district, not on the size of your order.",
        ],
        bullets: [],
        cards: [
          {
            label: "Inside Faridpur",
            value: "{{deliveryInside}}",
            note: "Saltha, Faridpur Sadar and all upazilas of Faridpur district.",
          },
          {
            label: "Everywhere else",
            value: "{{deliveryOutside}}",
            note: "All other districts in Bangladesh, door to door.",
          },
        ],
      },
      {
        id: "charges-note",
        title: "How charges are applied",
        paragraphs: [
          "Delivery is charged by district and shown at checkout. If a free-delivery coupon or a reward is active, it will override the district charge.",
        ],
        bullets: [
          "Orders over {{freeThreshold}} may qualify for complimentary delivery when that feature is enabled.",
          "Gift-card balances can be used against the order total, including delivery.",
          "Reward codes are applied at checkout like any other coupon.",
        ],
      },
      {
        id: "timing",
        title: "Delivery times",
        paragraphs: [
          "Orders placed before 2:00 pm are usually packed and handed to our courier the same working day. Orders after 2:00 pm go out the next working day.",
          "Friday and public holidays may add a day. During festival weeks, we will always tell you if there is a delay before you order.",
        ],
        bullets: [
          "Inside Faridpur district: 1–2 working days.",
          "Elsewhere in Bangladesh: 2–4 working days.",
          "Remote or island areas may take an additional 1–2 days depending on the courier route.",
        ],
      },
      {
        id: "courier",
        title: "Courier and tracking",
        paragraphs: [
          "Every Bengalot parcel is shipped with Steadfast Courier and is tracked from collection to delivery. As soon as your parcel leaves the atelier, we send you a tracking code by SMS (and email if provided).",
          "You can also use the Track Order page with your order number and phone number to see the latest status. Signed-in customers can follow every status change in account notifications.",
          "If the courier cannot reach you, they will try again the next working day. Please keep your phone reachable on the delivery day.",
        ],
        bullets: [],
      },
      {
        id: "cod",
        title: "Cash on delivery",
        paragraphs: [
          "Cash on Delivery is available across Bangladesh. Pay the courier when your parcel arrives.",
          "Online payment through bKash will appear as an option once merchant credentials are configured. Cash on Delivery remains the live payment path today.",
        ],
        bullets: [],
      },
      {
        id: "online-only",
        title: "Online only",
        paragraphs: [
          "Bengalot is an online-only fashion house. We do not have a physical shop, showroom or pickup counter. Our team works from Saltha, Faridpur, and all orders are placed through this website or WhatsApp.",
          "For delivery or order questions, message us on WhatsApp at {{whatsapp}} or email {{email}}.",
        ],
        bullets: [],
      },
    ],
  },
  returns: {
    eyebrow: "Returns & exchanges",
    title: "A simple, human exchange.",
    shortTitle: "Return policy",
    description:
      "If the fit or the feeling isn't right, we want to make it right. Here's how exchanges work at Bengalot.",
    updated: "4 November 2026",
    sections: [
      {
        id: "window",
        title: "The return window",
        paragraphs: [
          "You may request an exchange or return within {{exchangeWindow}} days of delivery. The item must be unused, unwashed, and have all original tags and packaging intact.",
          "To start, message us on WhatsApp at {{whatsapp}} with your order number and a photo of the piece. You can also open a return from your account under Returns & claims. We will arrange a pickup through Steadfast.",
        ],
        bullets: [],
      },
      {
        id: "eligible",
        title: "What can be exchanged",
        paragraphs: [
          "For hygiene reasons, innerwear, earrings and opened fragrance or attar cannot be returned unless faulty.",
        ],
        bullets: [
          "Unused clothing, footwear and accessories with tags attached.",
          "Sale pieces may be exchanged for a different size only, not a refund.",
          "Items received damaged or incorrect — contact us as soon as possible.",
        ],
      },
      {
        id: "process",
        title: "How it works",
        paragraphs: [
          "Exchanges typically take 5–8 working days from pickup to replacement delivery.",
        ],
        bullets: [
          "Submit the request from your account or message us with your order number and reason.",
          "We confirm availability of your preferred size.",
          "We book a pickup; keep the parcel packed and ready.",
          "Once we receive and inspect it, we dispatch your replacement. Delivery is free for exchanges within Bangladesh.",
        ],
      },
      {
        id: "refunds",
        title: "Refunds",
        paragraphs: [
          "We primarily offer exchanges, store credit or a replacement. Refunds are considered case by case, especially for faulty items. If approved, refunds are made through bank transfer after inspection.",
          "Original delivery charges are not refundable unless the item was faulty or the wrong piece was sent. Gift-card balances used on a cancelled or returned order are restored automatically.",
        ],
        bullets: [],
      },
      {
        id: "handmade",
        title: "A note on handmade pieces",
        paragraphs: [
          "Handloom and hand-finished pieces naturally carry small variations in weave, dye and finish. These are not defects; they are evidence of a human hand. If a variation is significant, we will always show it in the product photos or note it on the page.",
        ],
        bullets: [],
      },
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "The agreement, simply.",
    shortTitle: "Terms & conditions",
    description:
      "These are the terms that apply when you browse or order from Bengalot. We have written them as plainly as possible.",
    updated: "4 November 2026",
    sections: [
      {
        id: "using",
        title: "Using this site",
        paragraphs: [
          "By using bengalot.com you agree to these terms. You must be at least 18, or have permission from a parent or guardian, to place an order. You agree not to misuse the site, attempt to disrupt it, or submit false information.",
        ],
        bullets: [],
      },
      {
        id: "orders",
        title: "Orders and pricing",
        paragraphs: [
          "All prices are in Bangladeshi Taka and include applicable taxes. Delivery is charged separately and shown at checkout.",
          "An order is accepted when we confirm it. We reserve the right to cancel an order if the item is out of stock, the details appear fraudulent, or a pricing error is obvious. If we cancel, you will be informed and any payment returned in full.",
        ],
        bullets: [],
      },
      {
        id: "payment",
        title: "Payment",
        paragraphs: [
          "We currently accept Cash on Delivery. When bKash is enabled, payments are processed through bKash's secure checkout. You are responsible for paying the correct amount at the door for COD orders.",
        ],
        bullets: [],
      },
      {
        id: "delivery",
        title: "Delivery and risk",
        paragraphs: [
          "We deliver across Bangladesh through Steadfast. Risk passes to you on delivery. If your parcel arrives damaged, note it with the courier where possible and contact us.",
        ],
        bullets: [],
      },
      {
        id: "returns",
        title: "Returns and exchanges",
        paragraphs: [
          "Our returns and exchanges are governed by our Return Policy. In short: unused with tags, free size exchanges within the stated window, and a fair review of any faults.",
        ],
        bullets: [],
      },
      {
        id: "intellectual",
        title: "Our content",
        paragraphs: [
          "All photography, illustrations, patterns, text, logos and product designs on this site belong to Bengalot or our partners. You may not reproduce or use them commercially without written permission.",
        ],
        bullets: [],
      },
      {
        id: "liability",
        title: "Liability and law",
        paragraphs: [
          "We are not liable for indirect losses arising from use of the site. Nothing in these terms removes rights you have under Bangladeshi consumer law. These terms are governed by the laws of Bangladesh.",
          "Questions about these terms? Write to {{email}}.",
        ],
        bullets: [],
      },
    ],
  },
};
