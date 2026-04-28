import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col gap-12">
      <section className="flex flex-col gap-6 py-10">
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            GigLink
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find a gig without the noise.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A focused marketplace built for speed, clarity, and efficiency so
            users can browse opportunities, post services, and connect fast.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/browse"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Browse Gigs
          </Link>
          <Link
            href="/post"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium text-card-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            Post a Gig
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">
            Fast Search
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Find relevant gigs quickly with a simple and direct browsing
            experience.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">
            Clear Listings
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Focus on what matters most: title, price, description, and action.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">
            Efficient Flow
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Minimal clutter keeps buyers and sellers moving without distraction.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-card-foreground">
              Built for quick decisions
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Users should be able to land on the platform, understand what to
              do immediately, and take action in a few clicks.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
