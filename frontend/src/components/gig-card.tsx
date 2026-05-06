import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { GigPublic } from "@/lib/types";
import { cn } from "@/lib/utils";

type GigCardProps = {
  gig: GigPublic;
  className?: string;
};

export function GigCard({ gig, className }: GigCardProps) {
  const visibleTags = gig.tags?.slice(0, 3) ?? [];
  const extraTagCount = Math.max((gig.tags?.length ?? 0) - visibleTags.length, 0);

  return (
    <Link
      href={`/gigs/${gig.id}`}
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-muted/30 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {gig.category}
          </span>
          {!gig.is_active ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <BadgeCheck className="size-3.5 opacity-60" />
              Inactive
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              <BadgeCheck className="size-3.5" />
              Active
            </span>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Starting at
          </p>
          <span className="text-xl font-semibold text-foreground">
            ${Number(gig.price).toFixed(2)}
          </span>
        </div>
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
        {gig.title}
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {gig.description}
      </p>

      {visibleTags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {visibleTags.map((t: string) => (
            <span
              key={t}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {t}
            </span>
          ))}
          {extraTagCount > 0 ? (
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              +{extraTagCount} more
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 px-3 py-2 transition-colors group-hover:border-primary/20 group-hover:bg-primary/10">
        <span className="text-sm font-semibold text-primary">Open gig</span>
        <ArrowUpRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
