import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Bengalot",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-screen bg-[var(--color-sand)]">{children}</div>;
}
