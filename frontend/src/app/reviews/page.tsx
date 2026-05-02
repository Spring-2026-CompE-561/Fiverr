import ReviewForm from "@/components/review-form";
import ReviewList from "@/components/review-list";

export default function ReviewsPage() {
  const demoGigId = "gig-1";

  return (
    <main className="flex min-h-full flex-col gap-8">
      <section className="flex flex-col gap-3 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          GigLink
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Reviews
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Submit and view gig reviews.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ReviewForm type="gig" targetId={demoGigId} />
        <ReviewList type="gig" targetId={demoGigId} />
      </section>
    </main>
  );
}