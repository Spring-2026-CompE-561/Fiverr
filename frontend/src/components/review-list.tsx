"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Gig Reviews</h2>

      {loading ? <p className="mt-4 text-sm">Loading reviews...</p> : null}

      {!loading && error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      {!loading && !error && reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p>
      ) : null}

      <div className="mt-4 space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold">Rating: {review.rating}/5</p>
              <p className="text-xs text-muted-foreground">
                {review.created_at || review.createdAt || "No date"}
              </p>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Buyer: {review.buyer_id || review.buyerId || "Unknown"}
            </p>

            {review.comment ? (
              <p className="mt-3 text-sm">{review.comment}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}