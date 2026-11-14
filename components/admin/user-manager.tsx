"use client";

import {
  Check,
  Eye,
  KeyRound,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { Profile } from "@/lib/types";
import { cn, formatDate, initials } from "@/lib/utils";

type UserRow = Profile & {
  entitlementCount: number;
  orderCount: number;
};

const roleOptions = ["customer", "staff", "admin", "owner"] as const;

const roleTone: Record<string, string> = {
  customer: "bg-sand text-ink-soft",
  staff: "bg-lavender text-ink",
  admin: "bg-butter text-ink",
  owner: "bg-teal text-cream",
};

export function UserManager({
  users,
  canManage,
  currentUserId,
}: {
  users: UserRow[];
  canManage: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState<Record<string, Profile["role"]>>({});
  const [busyId, setBusyId] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "error" | "ok">("idle");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "customer" as Profile["role"],
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      `${user.full_name ?? ""} ${user.email} ${user.role}`
        .toLowerCase()
        .includes(needle),
    );
  }, [query, users]);

  const stats = useMemo(
    () => [
      { label: "Total users", value: users.length, icon: UsersRound },
      {
        label: "Customers",
        value: users.filter((user) => user.role === "customer").length,
        icon: UsersRound,
      },
      {
        label: "Studio team",
        value: users.filter((user) => user.role !== "customer").length,
        icon: ShieldCheck,
      },
      {
        label: "Library grants",
        value: users.reduce((sum, user) => sum + user.entitlementCount, 0),
        icon: KeyRound,
      },
    ],
    [users],
  );

  const hasDemoOwner = users.some(
    (user) => user.email.toLowerCase() === "admin@bengalot.com",
  );

  function notify(nextState: "error" | "ok", text: string) {
    setState(nextState);
    setMessage(text);
  }

  async function post(body: Record<string, unknown>) {
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { message?: string; ok?: boolean };
    if (!response.ok || !data.ok) {
      throw new Error(data.message ?? "The action could not be completed.");
    }
    return data;
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setState("idle");
    setMessage("");
    try {
      await post({ action: "create", ...form });
      setForm({ fullName: "", email: "", password: "", role: "customer" });
      notify("ok", "Account created. They can sign in immediately.");
      router.refresh();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "The account could not be created.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function saveRole(user: UserRow) {
    const nextRole = roles[user.id] ?? user.role;
    if (nextRole === user.role) return;
    setBusyId(user.id);
    setState("idle");
    try {
      await post({
        action: "update",
        userId: user.id,
        fullName: user.full_name ?? user.email.split("@")[0],
        role: nextRole,
        phone: user.phone,
        city: user.city,
      });
      notify("ok", `${user.full_name ?? user.email} is now ${nextRole}.`);
      router.refresh();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "The role could not be changed.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function resetPassword(user: UserRow) {
    setBusyId(user.id);
    setState("idle");
    try {
      const data = await post({ action: "reset", userId: user.id });
      notify("ok", data.message ?? `Reset link sent to ${user.email}.`);
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "The reset link could not be sent.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function deleteUser(user: UserRow) {
    if (
      !window.confirm(
        `Delete ${user.full_name ?? user.email}? Their library access and profile will be removed. This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusyId(user.id);
    setState("idle");
    try {
      await post({ action: "delete", userId: user.id });
      notify("ok", `${user.email} was deleted.`);
      router.refresh();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "The user could not be deleted.",
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.2rem] border border-line bg-cream p-4">
            <div className="flex items-start justify-between">
              <span className="grid size-8 place-items-center rounded-full bg-teal text-cream">
                <stat.icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted">
                {stat.label}
              </span>
            </div>
            <p className="price mt-4 font-display text-[1.7rem] leading-none tracking-[-0.04em] text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {hasDemoOwner ? (
        <div className="rounded-[1.2rem] border border-butter/60 bg-butter-soft/50 p-4 text-[0.66rem] leading-relaxed text-ink-soft">
          <strong className="text-ink">The demo owner account is still active.</strong>{" "}
          Create your own owner account below, sign in with it, then delete
          `admin@bengalot.com` from this page. The storefront demo customer has
          been removed.
        </div>
      ) : null}

      {message ? (
        <div
          role={state === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl border px-4 py-2.5 text-[0.7rem] font-medium",
            state === "error"
              ? "border-coral/30 bg-coral/[0.08] text-coral-deep"
              : "border-teal/20 bg-teal-soft/40 text-teal",
          )}
        >
          {message}
        </div>
      ) : null}

      {canManage ? (
        <section className="rounded-[1.2rem] border border-line bg-cream p-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-teal text-cream">
              <UserPlus className="size-3.5" aria-hidden="true" />
            </span>
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Create an account
            </p>
          </div>
          <form onSubmit={createUser} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="new-user-name" className="field-label">Full name</label>
              <input
                id="new-user-name"
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="new-user-email" className="field-label">Email</label>
              <input
                id="new-user-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="new-user-password" className="field-label">
                Temporary password
              </label>
              <input
                id="new-user-password"
                type="text"
                minLength={8}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                className="field font-mono"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div>
              <label htmlFor="new-user-role" className="field-label">Role</label>
              <select
                id="new-user-role"
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as Profile["role"],
                  }))
                }
                className="field"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="btn btn-primary btn-sm"
              >
                {creating ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-3.5" aria-hidden="true" />
                )}
                {creating ? "Creating account" : "Create account"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-[1.2rem] border border-line bg-cream">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <input
              id="user-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or role…"
              className="field !min-h-9 !py-1.5 !pl-9 !text-[0.76rem]"
            />
          </div>
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted">
            {filtered.length} shown
          </span>
        </div>

        <div className="divide-y divide-line">
          {filtered.map((user) => {
            const name = user.full_name ?? user.email.split("@")[0] ?? user.email;
            const role = roles[user.id] ?? user.role;
            const busy = busyId === user.id;
            return (
              <div key={user.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full text-[0.58rem] font-extrabold text-ink"
                    style={{ backgroundColor: `hsl(${user.avatar_hue} 58% 78%)` }}
                    aria-hidden="true"
                  >
                    {initials(name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.72rem] font-semibold text-ink">{name}</p>
                    <p className="truncate text-[0.58rem] text-muted">{user.email}</p>
                    <p className="mt-0.5 text-[0.54rem] text-muted">
                      Joined {formatDate(user.created_at)} · {user.orderCount} order
                      {user.orderCount === 1 ? "" : "s"} · {user.entitlementCount} library
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.06em]", roleTone[user.role])}>
                    {user.role}
                  </span>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-ink-soft transition-colors hover:border-teal hover:text-teal"
                  >
                    <Eye className="size-3" aria-hidden="true" />
                    View
                  </Link>
                  {canManage ? (
                    <>
                      <select
                        value={role}
                        onChange={(event) =>
                          setRoles((current) => ({
                            ...current,
                            [user.id]: event.target.value as Profile["role"],
                          }))
                        }
                        className="h-8 rounded-full border border-line bg-surface px-2 text-[0.62rem] font-semibold capitalize text-ink"
                        aria-label={`Role for ${name}`}
                      >
                        {roleOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {role !== user.role ? (
                        <button
                          type="button"
                          onClick={() => saveRole(user)}
                          disabled={busy}
                          className="inline-flex items-center gap-1 rounded-full bg-teal px-2.5 py-1.5 text-[0.55rem] font-bold text-cream"
                        >
                          {busy ? (
                            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                          ) : (
                            <Check className="size-3" aria-hidden="true" />
                          )}
                          Save role
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => resetPassword(user)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-ink-soft transition-colors hover:border-teal hover:text-teal"
                      >
                        <KeyRound className="size-3" aria-hidden="true" />
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(user)}
                        disabled={busy || user.id === currentUserId}
                        title={
                          user.id === currentUserId
                            ? "You cannot delete your own account"
                            : `Delete ${name}`
                        }
                        className="grid size-7 place-items-center rounded-full border border-line text-muted transition-colors hover:border-coral/40 hover:text-coral disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Delete ${name}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {!filtered.length ? (
          <p className="px-5 py-10 text-center text-[0.72rem] text-muted">
            No users match that search.
          </p>
        ) : null}
      </section>
    </div>
  );
}
