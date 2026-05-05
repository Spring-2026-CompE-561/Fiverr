"use client";

import Link from "next/link";

import { useSession } from "@/hooks/use-session";
import { buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, loading } = useSession(true);

  if (loading || !user) {
    return (
      <p className="text-sm text-muted-foreground">Loading profile…</p>
    );
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Your account</h1>
      </header>

      <div className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 border-b border-border pb-6 text-center sm:flex-row sm:text-left">
          <UserAvatar
            name={user.name}
            avatarUrl={user.avatar_url}
            size="lg"
            className="ring-primary/30"
          />
          <div className="flex-1 space-y-1">
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2 sm:justify-start">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold capitalize text-muted-foreground">
                {user.role}
              </span>
              {user.email_verified ? (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  Email verified
                </span>
              ) : (
                <Link
                  href="/verify-email"
                  className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300"
                >
                  Verify email
                </Link>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Bio</p>
          <p className="mt-1 text-base leading-relaxed text-muted-foreground">
            {user.bio?.trim() ? user.bio : "No bio yet."}
          </p>
        </div>

        <Link
          href="/profile/edit"
          className={cn(buttonVariants({ className: "inline-flex w-full sm:w-auto" }))}
        >
          Edit profile
        </Link>
      </div>
    </main>
  );
}
