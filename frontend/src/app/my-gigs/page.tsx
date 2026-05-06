"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlusCircle, Rocket, ShieldAlert } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import type { GigPublic } from "@/lib/types";
import { GigCard } from "@/components/gig-card";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MyGigsPage() {
  const { user, loading } = useSession(true);
  const [gigs, setGigs] = useState<GigPublic[]>([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "seller") return;
    let cancelled = false;

    void (async () => {
      try {
        const data = await apiFetch<GigPublic[]>(
          `/api/v1/gigs?sellerId=${encodeURIComponent(user.id)}`,
        );
        if (!cancelled) setGigs(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setGigs([]);
      } finally {
        if (!cancelled) setListLoading(false);
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
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (user.role !== "seller") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
           <ShieldAlert className="size-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Seller Access Required</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The &quot;My Gigs&quot; management dashboard is only available for accounts with the seller role.
        </p>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-10">
      <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-widest text-primary/80">
            Management
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">Your Published Gigs</h1>
          <p className="text-muted-foreground">
            Manage your active services and track their performance in the marketplace.
          </p>
        </div>
        <Link href="/post" className={cn(buttonVariants({ size: "lg" }), "rounded-full gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]")}>
          <PlusCircle className="size-5" />
          Post a new gig
        </Link>
      </header>

      {listLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="pt-4">
          <EmptyState
            icon={Rocket}
            title="Ready to launch your first gig?"
            description="Create your first listing to showcase your skills and start receiving orders from community members."
            action={{
              label: "Create a gig now",
              href: "/post",
            }}
            className="rounded-3xl"
          />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {gigs.map((g) => (
            <GigCard key={g.id} gig={g} />
          ))}
        </div>
      )}
    </main>
  );
}
