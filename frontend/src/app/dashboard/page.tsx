"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import type { GigPublic, OrderPublic } from "@/lib/types";
import { GigCard } from "@/components/gig-card";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loading } = useSession(true);
  const [orders, setOrders] = useState<OrderPublic[]>([]);
  const [myGigs, setMyGigs] = useState<GigPublic[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    void (async () => {
      try {
        const list = await apiFetch<OrderPublic[]>("/api/v1/orders");
        if (!cancelled) setOrders(Array.isArray(list) ? list : []);

        if (user.role === "seller") {
          const gigs = await apiFetch<GigPublic[]>(
            `/api/v1/gigs?sellerId=${encodeURIComponent(user.id)}`,
          );
          if (!cancelled) setMyGigs(Array.isArray(gigs) ? gigs : []);
        } else {
          if (!cancelled) setMyGigs([]);
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
          setMyGigs([]);
          toast.error("Could not load dashboard stats");
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);

  return (
    <main className="flex flex-col gap-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Hi, {user.name}
        </h1>
        <p className="text-muted-foreground">
          You&apos;re signed in as a{" "}
          <span className="font-medium text-foreground">{user.role}</span>. Use
          the shortcuts below to keep work moving.
        </p>
      </header>

      {!user.email_verified ? (
        <div className="rounded-xl border border-amber-500/45 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-50">
          <p className="font-medium">Verify your email</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
            Post gigs, place orders, and leave reviews after you confirm your
            address (required when SMTP is configured on the API).
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/verify-email"
              className="font-semibold text-primary underline underline-offset-4"
            >
              Verification help
            </Link>
            <Link href="/profile" className="font-semibold underline underline-offset-4">
              Profile
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Open orders</p>
          {statsLoading ? (
            <Skeleton className="mt-2 h-8 w-12" />
          ) : (
            <p className="mt-1 text-2xl font-semibold">{orders.length}</p>
          )}
        </div>
        {user.role === "seller" ? (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Your live gigs</p>
            {statsLoading ? (
              <Skeleton className="mt-2 h-8 w-12" />
            ) : (
              <p className="mt-1 text-2xl font-semibold">{myGigs.length}</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Marketplace</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Find top sellers and request work.
            </p>
          </div>
        )}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-muted-foreground">Quick action</p>
          <Link
            href="/browse"
            className={cn(buttonVariants({ className: "mt-3 w-full sm:w-auto", variant: "outline", size: "sm" }))}
          >
            Explore gigs
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          {orders.length > 0 && (
            <Link
              href="/orders"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          )}
        </div>
        {statsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <EmptyState
            icon={History}
            title="No recent activity"
            description="Your recent orders will appear here once you start using GigLink."
            className="min-h-[300px]"
          />
        ) : (
          <ul className="space-y-2">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{o.id.slice(0, 8)}
                  </span>
                  <span className="capitalize">{o.status}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {user.role === "seller" && myGigs.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Your gigs</h2>
            <Link
              href="/my-gigs"
              className="text-sm font-medium text-primary hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {myGigs.slice(0, 4).map((g) => (
              <GigCard key={g.id} gig={g} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
