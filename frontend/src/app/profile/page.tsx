"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Edit3, Mail, User } from "lucide-react";

import { useSession } from "@/hooks/use-session";
import { buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, loading } = useSession(true);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const profileSteps = [
    {
      label: "Verify your email",
      completed: user.email_verified,
      href: "/verify-email",
      description: "Confirm your account to start selling and buying.",
    },
    {
      label: "Add a bio",
      completed: !!user.bio?.trim(),
      href: "/profile/edit",
      description: "Tell the community about your skills and experience.",
    },
    {
      label: "Set a profile picture",
      completed: !!user.avatar_url,
      href: "/profile/edit",
      description: "A friendly face helps build trust with clients.",
    },
  ];

  const completedSteps = profileSteps.filter((s) => s.completed).length;
  const progress = Math.round((completedSteps / profileSteps.length) * 100);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-widest text-primary/80">
            Account
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">Your Profile</h1>
        </div>
        <Link
          href="/profile/edit"
          className={cn(buttonVariants({ size: "sm" }), "rounded-full gap-2")}
        >
          <Edit3 className="size-4" />
          Edit Profile
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              <div className="h-24 bg-primary/10" />
              <div className="-mt-12 flex flex-col items-center p-6 text-center">
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatar_url}
                  size="xl"
                  className="size-24 border-4 border-card ring-1 ring-border shadow-xl"
                />
                <div className="mt-4 space-y-1">
                  <p className="text-xl font-bold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    {user.role}
                  </span>
                  {user.email_verified && (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-600">
                      <CheckCircle2 className="size-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">About</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                {user.bio?.trim() ? user.bio : "Share your story by adding a bio to your profile."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Task Focus & Completeness */}
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Profile Completeness</h2>
                <p className="text-muted-foreground">
                  Finish setting up your profile to stand out in the marketplace.
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black text-primary">{progress}%</span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-primary/20">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {profileSteps.map((step, i) => (
                <div
                  key={i}
                  className={cn(
                    "group relative flex items-start gap-4 rounded-2xl border p-4 transition-all",
                    step.completed 
                      ? "border-green-500/20 bg-green-500/5" 
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="mt-1 shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="size-6 text-green-500" />
                    ) : (
                      <Circle className="size-6 text-muted-foreground group-hover:text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn("font-bold", step.completed && "text-green-700 dark:text-green-400")}>
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {!step.completed && (
                    <Link
                      href={step.href}
                      className="absolute inset-0 z-10 rounded-2xl"
                      aria-label={`Complete step: ${step.label}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="size-6" />
              </div>
              <h3 className="font-bold text-lg">Communication</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage how you receive updates and notifications about your orders.
              </p>
              <Link href="/profile/edit" className="mt-4 inline-flex text-sm font-bold text-primary hover:underline underline-offset-4">
                Update Settings
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="size-6" />
              </div>
              <h3 className="font-bold text-lg">Account Identity</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep your professional identity up to date for potential clients.
              </p>
              <Link href="/profile/edit" className="mt-4 inline-flex text-sm font-bold text-primary hover:underline underline-offset-4">
                Update Identity
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />;
}
