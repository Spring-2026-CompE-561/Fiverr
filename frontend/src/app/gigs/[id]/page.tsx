"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Info, Share2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { getStoredUser, type UserPublic } from "@/lib/auth";
import type { GigPublic } from "@/lib/types";
import ReviewForm from "@/components/review-form";
import ReviewList from "@/components/review-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

  async function requestOrder(e: React.SyntheticEvent) {
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
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !gig) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
           <Info className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{error || "Gig not found."}</h1>
        <p className="text-muted-foreground mb-8">The service you are looking for might have been removed or renamed.</p>
        <Link href="/browse" className={buttonVariants({ variant: "outline" })}>
          Back to marketplace
        </Link>
      </div>
    );
  }

  const buyerNeedsVerify =
    viewer?.role === "buyer" && viewer.email_verified === false;

  return (
    <main className="flex flex-col gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Link href="/browse" className="hover:text-primary transition-colors">
          Browse
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-40" aria-hidden />
        <Link
          href={`/browse?category=${encodeURIComponent(gig.category)}`}
          className="hover:text-primary transition-colors"
        >
          {gig.category}
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-40" aria-hidden />
        <span className="line-clamp-1 text-foreground opacity-60">
          {gig.title}
        </span>
      </nav>

      <div className="flex flex-col gap-6 border-b border-border pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              {gig.category}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {gig.title}
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full gap-2 self-start"
            onClick={() => void copyLink()}
          >
            <Share2 className="size-4" aria-hidden />
            Share service
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5">
            <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
               {seller?.name?.[0].toUpperCase()}
            </div>
            <span className="text-muted-foreground">Seller:</span>
            <span className="font-bold text-foreground">
              {seller?.name ?? "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5">
             <span className="text-muted-foreground font-medium">Starting from:</span>
             <span className="text-lg font-black text-primary">
               ${gig.price.toFixed(2)}
             </span>
          </div>
        </div>

        {gig.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {gig.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">About this service</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
               <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/80">
                {gig.description}
              </p>
            </div>
          </div>
          
          <div className="grid gap-8 pt-8 border-t border-border lg:grid-cols-2">
             <ReviewList type="gig" targetId={id} />
             {viewer?.role === "buyer" && viewer.email_verified !== false ? (
                <ReviewForm type="gig" targetId={id} />
              ) : (
                <Card className="h-fit bg-muted/20 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Leave a review</CardTitle>
                    <CardDescription>
                      {viewer?.role === "buyer" && buyerNeedsVerify
                        ? "Please verify your email to share your experience with this service."
                        : "Only verified buyers can submit reviews for services they have used."}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                     {buyerNeedsVerify && (
                        <Link href="/profile" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
                          Go to Profile
                        </Link>
                     )}
                  </CardFooter>
                </Card>
              )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 h-fit">
          <Card className="shadow-xl border-primary/20 overflow-hidden">
             <div className="h-2 bg-primary" />
             <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-black">Order Service</CardTitle>
                <CardDescription>
                   Directly request this service from {seller?.name ?? "the seller"}.
                </CardDescription>
             </CardHeader>
             <CardContent>
                {!viewer ? (
                  <div className="rounded-xl bg-muted/50 p-4 text-sm text-center">
                    <p className="text-muted-foreground mb-4">You need to be signed in as a buyer to request this service.</p>
                    <Link href="/login" className={buttonVariants({ className: "w-full rounded-full" })}>
                      Sign in to GigLink
                    </Link>
                  </div>
                ) : viewer.role !== "buyer" ? (
                  <div className="rounded-xl bg-muted/50 p-4 text-sm flex gap-3 text-muted-foreground">
                    <Info className="size-5 shrink-0" />
                    <p>Your current account role is <strong>{viewer.role}</strong>. Please switch to a buyer account to place orders.</p>
                  </div>
                ) : buyerNeedsVerify ? (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm">
                    <p className="text-amber-900 dark:text-amber-100 font-bold mb-1">Verification Required</p>
                    <p className="text-amber-800/80 dark:text-amber-200/80 mb-4">Confirm your email to start requesting services on the marketplace.</p>
                    <Link href="/verify-email" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10" })}>
                      Verify Now
                    </Link>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={requestOrder}>
                    <div className="space-y-2">
                      <Label htmlFor="order-msg" className="font-bold">Message to seller</Label>
                      <Textarea
                        id="order-msg"
                        value={orderMsg}
                        onChange={(e) => setOrderMsg(e.target.value)}
                        placeholder="I'd like to request this gig because..."
                        rows={4}
                        className="resize-none rounded-xl"
                      />
                      <p className="text-[10px] text-muted-foreground">Include any specific requirements or deadlines.</p>
                    </div>
                    <Button type="submit" disabled={orderLoading} className="w-full h-12 rounded-full gap-2 shadow-lg shadow-primary/20">
                      <ShoppingCart className="size-4" />
                      {orderLoading ? "Sending..." : "Request order"}
                    </Button>
                  </form>
                )}
             </CardContent>
             <CardFooter className="bg-muted/30 pt-4 flex flex-col gap-2">
                <div className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground px-1">
                   <span>Service ID</span>
                   <code className="bg-muted px-1.5 py-0.5 rounded uppercase">{id.slice(0, 8)}</code>
                </div>
             </CardFooter>
          </Card>
        </aside>
      </div>
    </main>
  );
}
