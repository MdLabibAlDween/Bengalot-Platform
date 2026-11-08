import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that apply when you shop with Bengalot.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Terms" title="The agreement, in plain language." updated="1 November 2026">
      <LegalSection title="Buying from Bengalot">
        <p>
          By placing an order you are making an offer to purchase the products in
          your bag. We confirm the order when you receive an order number. If we
          cannot fulfil an order — for example because a physical item is out of
          stock — we will contact you and arrange a replacement or refund.
        </p>
      </LegalSection>
      <LegalSection title="Prices and payment">
        <p>
          All prices are in Bangladeshi Taka and include applicable taxes unless
          stated otherwise. Delivery is shown separately at checkout. We accept
          cash on delivery for physical orders and manual bKash payments. For
          bKash orders, we send payment instructions after you place the order.
          Access is granted once payment is confirmed.
        </p>
      </LegalSection>
      <LegalSection title="Digital licences">
        <p>
          Digital products are licensed for personal use by the purchaser. You
          may duplicate a Notion template into your own workspace and print PDF
          resources for your own study. You may not resell, redistribute or
          publish the files, or share access links with another person. Access
          is tied to your account and may be reviewed if unusual activity is
          detected.
        </p>
      </LegalSection>
      <LegalSection title="Delivery">
        <p>
          Physical orders are usually dispatched within one working day.
          Delivery is typically 2–4 working days across Bangladesh. Delivery
          charges are ৳70 inside Faridpur district and ৳130 elsewhere, with free
          delivery above ৳2,000. Delays caused by couriers or weather are outside
          our direct control, but we will help you follow up.
        </p>
      </LegalSection>
      <LegalSection title="Returns and exchanges">
        <p>
          Physical items can be exchanged if they arrive damaged or incorrect.
          Contact us within 48 hours of delivery with photographs and your order
          number. Items should be unused and in their original packaging. Digital
          resources are non-refundable once access has been opened, because the
          file or template cannot be returned. If an access link is broken, we
          will repair or replace it.
        </p>
      </LegalSection>
      <LegalSection title="Intellectual property">
        <p>
          The Bengalot name, product artwork, writing and design system belong to
          Bengalot. Product concepts and templates are original work unless a
          product page says otherwise. Please do not use our brand or artwork
          without written permission.
        </p>
      </LegalSection>
      <LegalSection title="Support and disputes">
        <p>
          If something goes wrong, message support@bengalot.com or WhatsApp
          01341739202 with your order number. We will work in good faith to
          resolve the issue. These terms are governed by the laws of Bangladesh.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
