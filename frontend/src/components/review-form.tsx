"use client";

import { useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

type ReviewFormProps =
  | { type: "gig"; targetId: string }
  | { type: "profile"; targetId: string };

export default function ReviewForm({ type, targetId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (type !== "gig") {
        toast.error("Profile reviews are not enabled in this build.");
        return;
      }

      await apiFetch("/api/v1/reviews", {
        method: "POST",
        body: JSON.stringify({
          gigId: targetId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      toast.success("Review posted");
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">
        {type === "gig" ? "Leave a Gig Review" : "Leave a Profile Review"}
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Rating</span>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Comment</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write your review..."
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
