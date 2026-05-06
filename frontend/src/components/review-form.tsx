"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

      toast.success("Review posted — thank you for your feedback!");
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-1">
          <Star className="size-4 fill-current" />
          <span className="text-xs font-bold uppercase tracking-widest">Share feedback</span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          {type === "gig" ? "Rate this service" : "Rate this profile"}
        </CardTitle>
        <CardDescription>
          Your review helps other community members make better decisions.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bold">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border-2 transition-all duration-200 font-bold",
                    rating >= value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="font-bold">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What was your experience with this service?"
              className="rounded-xl resize-none"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full h-11 shadow-md shadow-primary/10"
          >
            {loading ? "Submitting..." : "Post Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
