import { CalendarDays, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

import { PasswordReset } from "@/components/account/password-reset";
import { ProfileForm } from "@/components/account/profile-form";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const { profile } = await requireUser("/account/profile");

  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center">
        <p className="text-sm text-muted">Your profile is still being prepared. Refresh in a moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-6">
        <p className="eyebrow">Your details</p>
        <h2 className="mt-2 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-ink sm:text-[2.6rem]">
          A little about you.
        </h2>
        <p className="mt-3 max-w-[34rem] text-[0.8rem] leading-[1.7] text-muted">
          These details help us send the right updates and keep your digital
          access connected to the right person.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-[1.4rem] border border-line bg-cream p-5 sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <span className="grid size-8 place-items-center rounded-full bg-teal text-cream">
              <UserRound className="size-3.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.72rem] font-bold text-ink">Profile details</p>
              <p className="text-[0.6rem] text-muted">Update what you share with Bengalot.</p>
            </div>
          </div>
          <div className="mt-5">
            <ProfileForm profile={profile} />
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-[1.4rem] border border-line bg-cream p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-butter-soft text-ink">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.72rem] font-bold text-ink">Account security</p>
                <p className="text-[0.6rem] text-muted">Keep your access private.</p>
              </div>
            </div>
            <p className="mt-4 text-[0.7rem] leading-relaxed text-muted">
              We use Supabase authentication. Your password is never visible to
              the Bengalot team.
            </p>
            <div className="mt-4">
              <PasswordReset email={profile.email} />
            </div>
          </section>

          <section className="rounded-[1.4rem] border border-line bg-ivory p-5">
            <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Account at a glance
            </p>
            <dl className="mt-4 space-y-3 text-[0.7rem]">
              <div className="flex items-center gap-2.5">
                <Mail className="size-3.5 text-teal" aria-hidden="true" />
                <dt className="sr-only">Email</dt>
                <dd className="truncate text-ink-soft">{profile.email}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <CalendarDays className="size-3.5 text-teal" aria-hidden="true" />
                <dt className="sr-only">Joined</dt>
                <dd className="text-ink-soft">Joined {formatDate(profile.created_at)}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <LockKeyhole className="size-3.5 text-teal" aria-hidden="true" />
                <dt className="sr-only">Role</dt>
                <dd className="capitalize text-ink-soft">{profile.role} account</dd>
              </div>
            </dl>
          </section>

          <div className="rounded-[1.4rem] bg-teal p-5 text-cream">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-butter-soft">
              Need a human?
            </p>
            <p className="mt-2 text-[0.74rem] leading-relaxed text-cream/85">
              If you change your email or lose access to a resource, message us
              with your order number.
            </p>
            <a
              href="https://wa.me/8801341739202"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-butter-soft"
            >
              WhatsApp support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
