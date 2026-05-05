"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Copy } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { getStoredUser, type UserPublic } from "@/lib/auth";
import type { GigPublic } from "@/lib/types";
import ReviewForm from "@/components/review-form";
import ReviewList from "@/components/review-list";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [gig, setGig] = useState<GigPublic | null>(null);
  const [seller, setSeller] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderMsg, setOrderMsg] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [viewer, setViewer] = useState<UserPublic | null>(null);

  useEffect(() => {
    setViewer(getStoredUser());
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const g = await apiFetch<GigPublic>(`/api/v1/gigs/${id}`, {
          auth: false,
        });
        if (cancelled) return;
        setGig(g);
        const s = await apiFetch<UserPublic>(
          `/api/v1/users/${g.seller_id}`,
          { auth: false },
        );
        if (!cancelled) setSeller(s);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gig not found");
          setGig(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function requestOrder(e: React.FormEvent) {
    e.preventDefault();
    setOrderLoading(true);
    try {
      await apiFetch(`/api/v1/orders`, {
        method: "POST",
        body: JSON.stringify({
          gig_id: id,
          message: orderMsg.trim() || "I'd like to request this gig.",
        }),
      });
      toast.success("Order requested — check Orders for updates.");
      setOrderMsg("");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not place order",
      );
    } finally {
      setOrderLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  if (loading) {
    return (
      <main className="flex flex-col gap-8">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-24 w-full max-w-xl" />
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </main>
    );
  }

  if (error || !gig) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error || "Gig not found."}</p>
        <Link href="/browse" className="text-primary hover:underline">
          Back to browse
        </Link>
      </div>
    );
  }

  const buyerNeedsVerify =
    viewer?.role === "buyer" && viewer.email_verified === false;

  return (
    <main className="flex flex-col gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/browse" className="hover:text-foreground">
          Browse
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
        <Link
          href={`/browse?category=${encodeURIComponent(gig.category)}`}
          className="hover:text-foreground"
        >
          {gig.category}
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
        <span className="line-clamp-1 font-medium text-foreground">
          {gig.title}
        </span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {gig.category}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => void copyLink()}
          >
            <Copy className="size-4" aria-hidden />
            Copy link
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {gig.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            Seller:{" "}
            <span className="font-medium text-foreground">
              {seller?.name ?? "Unknown"}
            </span>
          </span>
          <span className="text-border">|</span>
          <span className="text-xl font-semibold text-primary">
            ${gig.price.toFixed(2)}
          </span>
        </div>
        {gig.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {gig.tags.map((t) => (
              <span
                key={t}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About this gig</h2>
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {gig.description}
          </p>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-28">
          {!viewer ? (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              as a buyer to request this gig.
            </p>
          ) : viewer.role !== "buyer" ? (
            <p className="text-sm text-muted-foreground">
              Switch to a buyer account to place orders, or browse as a seller.
            </p>
          ) : buyerNeedsVerify ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
              Verify your email before requesting orders.{" "}
              <Link href="/profile" className="font-semibold underline">
                Profile
              </Link>{" "}
              ·{" "}
              <Link href="/verify-email" className="font-semibold underline">
                Help
              </Link>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={requestOrder}>
              <div className="space-y-2">
                <Label htmlFor="order-msg">Message to seller</Label>
                <Textarea
                  id="order-msg"
                  value={orderMsg}
                  onChange={(e) => setOrderMsg(e.target.value)}
                  placeholder="Describe what you need…"
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={orderLoading} className="w-full">
                {orderLoading ? "Sending…" : "Request order"}
              </Button>
            </form>
          )}
        </aside>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {viewer?.role === "buyer" && viewer.email_verified !== false ? (
          <ReviewForm type="gig" targetId={id} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            {viewer?.role === "buyer" && buyerNeedsVerify
              ? "Verify your email to leave reviews."
              : "Reviews can be submitted by verified buyers."}
          </div>
        )}
        <ReviewList type="gig" targetId={id} />
      </div>
    </main>
  );
}
