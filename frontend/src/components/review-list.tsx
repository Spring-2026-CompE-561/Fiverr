"use client";

import { useEffect, useState } from "react";
import { MessageSquare, MessageSquareOff, Star } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Review = {
  id: string;
  gig_id?: string;
  gigId?: string;
  buyer_id?: string;
  buyerId?: string;
  rating: number;
  comment?: string | null;
  created_at?: string;
  createdAt?: string;
};

type ReviewListProps = {
  type: "gig";
  targetId: string;
};

export default function ReviewList({ type, targetId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        if (type !== "gig") {
          setError("Only gig reviews are available right now.");
          setLoading(false);
          return;
        }

        const data = await apiFetch<Review[]>(`/api/v1/reviews/gig/${targetId}`);

        if (!ignore) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to fetch");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [type, targetId]);

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-1">
          <MessageSquare className="size-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Community feedback</span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Gig Reviews</CardTitle>
        <CardDescription>
          See what other buyers have to say about this service.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20 text-center">
            {error}
          </div>
        ) : null}

        {!loading && !error && reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquareOff}
            title="No reviews yet"
            description="Be the first to share your experience with this service."
            className="min-h-[250px] border-none bg-muted/20"
          />
        ) : null}

        <div className="space-y-4">
          {reviews.map((review) => {
            const created = review.created_at || review.createdAt;
            return (
              <div
                key={review.id}
                className="group/review rounded-2xl border border-border bg-muted/10 p-5 transition-all hover:bg-muted/20 hover:border-primary/20"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "size-3.5",
                          i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                        )} 
                      />
                    ))}
                    <span className="ml-2 text-sm font-bold">{review.rating}/5</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatRelativeTime(created) || "Recently"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    B
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Buyer ID: <span className="text-foreground">{(review.buyer_id || review.buyerId || "Anonymous").slice(0, 8)}...</span>
                  </span>
                </div>

                {review.comment ? (
                  <p className="text-sm leading-relaxed text-foreground/80 italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/60">No comment left.</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
