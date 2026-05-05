import Link from "next/link";
import type { GigPublic } from "@/lib/types";
import { cn } from "@/lib/utils";

type GigCardProps = {
  gig: GigPublic;
  className?: string;
};

export function GigCard({ gig, className }: GigCardProps) {
  return (
    <Link
      href={`/gigs/${gig.id}`}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {gig.category}
        </span>

        <span className="text-lg font-semibold text-primary">
          ${Number(gig.price).toFixed(2)}
        </span>
      </div>

      <h3 className="font-semibold text-card-foreground group-hover:text-primary">
        {gig.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {gig.description}
      </p>

      {gig.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {gig.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}