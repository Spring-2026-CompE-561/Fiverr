"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import type { GigPublic } from "@/lib/types";
import { GigCard } from "@/components/gig-card";
import { buttonVariants } from "@/components/ui/button";
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
      <p className="text-sm text-muted-foreground">Loading…</p>
    );
  }

  if (user.role !== "seller") {
    return (
      <main className="max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">Seller tools</h1>
        <p className="text-muted-foreground">
          My Gigs is available for seller accounts.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Seller
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">My gigs</h1>
          <p className="mt-2 text-muted-foreground">
            Listings you&apos;ve published on GigLink.
          </p>
        </div>
        <Link href="/post" className={cn(buttonVariants())}>
          Post a gig
        </Link>
      </header>

      {listLoading ? (
        <p className="text-sm text-muted-foreground">Loading gigs…</p>
      ) : gigs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t posted a gig yet.{" "}
          <Link href="/post" className="text-primary hover:underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {gigs.map((g) => (
            <GigCard key={g.id} gig={g} />
          ))}
        </div>
      )}
    </main>
  );
}
