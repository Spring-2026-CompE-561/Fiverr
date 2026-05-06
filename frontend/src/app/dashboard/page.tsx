"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, History, LayoutDashboard, PlusCircle, Search, ShoppingBag } from "lucide-react";
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
      <div className="space-y-8 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  return (
    <main className="flex flex-col gap-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-bold uppercase tracking-widest text-primary/80">
            Overview
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Hi, {user.name}
          </h1>
          <p className="text-muted-foreground">
            You are signed in as a <span className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4">{user.role}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}>
            View Profile
          </Link>
          <Link href="/orders" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
            Manage Orders
          </Link>
        </div>
      </header>

      {/* Primary Action Callout */}
      <section className="relative overflow-hidden rounded-2xl bg-primary/5 p-8 border border-primary/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              {user.role === "seller" 
                ? (myGigs.length === 0 ? "Start your seller journey" : (pendingOrders > 0 ? "New orders need attention" : "Everything is up to date"))
                : (orders.length === 0 ? "Ready for your first gig?" : "Track your active requests")}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {user.role === "seller"
                ? (myGigs.length === 0 ? "You haven't posted any gigs yet. Create your first listing to start reaching buyers." : `You have ${pendingOrders} pending orders that need your review.`)
                : (orders.length === 0 ? "Explore our marketplace to find the perfect service for your next project." : "Check the status of your recent requests and follow up with sellers.")}
            </p>
          </div>
          <Link 
            href={user.role === "seller" ? (myGigs.length === 0 ? "/post" : "/orders") : (orders.length === 0 ? "/browse" : "/orders")}
            className={cn(buttonVariants({ size: "lg" }), "group gap-2 rounded-full shadow-lg transition-all hover:shadow-primary/20")}
          >
            {user.role === "seller" 
              ? (myGigs.length === 0 ? "Post a Gig" : "View Orders") 
              : (orders.length === 0 ? "Browse Marketplace" : "View Orders")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-12 -top-12 size-64 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {!user.email_verified && (
        <div className="rounded-xl border border-amber-500/45 bg-amber-500/5 px-6 py-4 transition-colors hover:bg-amber-500/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-100">Action Required: Verify Email</p>
              <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                Confirm your address to unlock all features like posting gigs and placing orders.
              </p>
            </div>
            <Link
              href="/verify-email"
              className={cn(buttonVariants({ size: "sm" }), "bg-amber-600 hover:bg-amber-700 text-white border-none")}
            >
              Verify Now
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Open orders</p>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-12" />
          ) : (
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
          )}
        </div>
        {user.role === "seller" ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your live gigs</p>
            {statsLoading ? (
              <Skeleton className="mt-2 h-9 w-12" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{myGigs.length}</p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Marketplace</p>
            <div className="mt-2 flex items-center justify-between">
               <p className="text-sm text-muted-foreground">Find top sellers</p>
               <Search className="size-5 text-primary opacity-50" />
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-semibold">Online</p>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <section className="space-y-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recent Orders</h2>
            {orders.length > 0 && (
              <Link
                href="/orders"
                className="text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                View all orders
              </Link>
            )}
          </div>
          {statsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={History}
              title="No recent activity"
              description="Your recent orders will appear here once you start using GigLink."
              className="min-h-[300px] rounded-2xl border-2"
            />
          ) : (
            <ul className="grid gap-3">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      o.status === "pending" ? "bg-amber-500/10 text-amber-600" : 
                      o.status === "accepted" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                    )}>
                      <ShoppingBag className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Order #{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                    o.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
                    o.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"
                  )}>
                    {o.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-6 lg:col-span-2">
           <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
          </div>
          <div className="grid gap-3">
             <Link href="/browse" className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search className="size-5" />
                </div>
                <div>
                   <p className="text-sm font-bold">Find Services</p>
                   <p className="text-xs text-muted-foreground">Browse the marketplace</p>
                </div>
             </Link>
             {user.role === "seller" && (
                <Link href="/post" className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PlusCircle className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Post a Gig</p>
                    <p className="text-xs text-muted-foreground">Create a new listing</p>
                  </div>
                </Link>
             )}
             <Link href="/profile/edit" className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LayoutDashboard className="size-5" />
                </div>
                <div>
                   <p className="text-sm font-bold">Update Profile</p>
                   <p className="text-xs text-muted-foreground">Manage your information</p>
                </div>
             </Link>
          </div>
        </section>
      </div>

      {user.role === "seller" && myGigs.length > 0 ? (
        <section className="space-y-6 border-t border-border pt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Gigs</h2>
            <Link
              href="/my-gigs"
              className="text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              Manage all gigs
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {myGigs.slice(0, 4).map((g) => (
              <GigCard key={g.id} gig={g} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
