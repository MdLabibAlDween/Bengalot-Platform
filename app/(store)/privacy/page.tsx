import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Bengalot collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="Your information, handled with care." updated="1 November 2026">
      <LegalSection title="What we collect">
        <p>
          When you create an account we collect your name, email address and
          password (stored securely by our authentication provider). When you
          place an order we also collect a delivery address, phone number and
          any note you choose to add. For digital resources we keep a record of
          which product was granted to your library and when it was last opened.
        </p>
        <p>
          We do not collect payment card numbers. Cash on delivery and manual
          bKash payments mean payment details are handled outside the website.
        </p>
      </LegalSection>
      <LegalSection title="Why we use it">
        <p>
          Your information is used to fulfil orders, provide access to digital
          resources, answer support messages and send essential order updates.
          If you join the Bengalot note, we use your email to send occasional
          studio letters. You can unsubscribe from any letter.
        </p>
      </LegalSection>
      <LegalSection title="Where it lives">
        <p>
          Account, order and newsletter data is stored in our Supabase database,
          hosted on infrastructure we control. Access is limited to authorised
          studio staff. We use appropriate technical measures, including row-level
          security, to prevent customers from seeing another person&apos;s data.
        </p>
      </LegalSection>
      <LegalSection title="Cookies and local storage">
        <p>
          We use essential cookies for signing in and remembering your session.
          Your bag is kept in your browser&apos;s local storage unless you clear
          it. We do not run advertising trackers or sell browsing data.
        </p>
      </LegalSection>
      <LegalSection title="Your choices">
        <p>
          You can update your profile details from your account, request a copy
          of the information we hold, or ask us to delete your account and
          associated personal data. Some order records may need to be retained
          for accounting and legal reasons. Write to support@bengalot.com and we
          will help.
        </p>
      </LegalSection>
      <LegalSection title="Children">
        <p>
          Bengalot is designed for students and independent learners. If you are
          under 18, please place orders with the knowledge of a parent or
          guardian. We do not knowingly collect extra information from children.
        </p>
      </LegalSection>
      <LegalSection title="Changes">
        <p>
          If these practices change in a meaningful way, we will update this
          page and note the new date at the top. Questions are always welcome.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
