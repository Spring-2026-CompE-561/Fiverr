"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type ReviewFormProps =
  | { type: "gig"; targetId: string }
  | { type: "profile"; targetId: string };

export default function ReviewForm({ type, targetId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload =
        type === "gig"
          ? { gig_id: targetId, rating, comment }
          : { seller_id: targetId, rating, comment };

      const path =
        type === "gig"
          ? "/reviews"
          : "/profile-reviews";

      await apiFetch(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessage("Review submitted successfully.");
      setComment("");
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
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

        {message ? (
          <p className="text-sm text-green-500">{message}</p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : null}
      </div>
    </form>
  );
}