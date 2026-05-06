import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { GigPublic } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type GigCardProps = {
  gig: GigPublic;
  className?: string;
};

export function GigCard({ gig, className }: GigCardProps) {
  const visibleTags = gig.tags?.slice(0, 3) ?? [];
  const extraTagCount = Math.max((gig.tags?.length ?? 0) - visibleTags.length, 0);

  return (
    <Link href={`/gigs/${gig.id}`} className={cn("block group", className)}>
      <Card hoverable className="h-full border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">
                Starting at
              </p>
              <span className="text-xl font-extrabold text-foreground">
                ${Number(gig.price).toFixed(2)}
              </span>
            </div>
          </div>
          <CardTitle className="mt-4 line-clamp-2 text-lg transition-colors group-hover:text-primary">
            {gig.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {gig.description}
          </p>

          {visibleTags.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {visibleTags.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors group-hover:border-primary/20"
                >
                  {t}
                </span>
              ))}
              {extraTagCount > 0 ? (
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  +{extraTagCount} more
                </span>
              ) : null}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="mt-auto">
          <div className="flex w-full items-center justify-between rounded-xl border border-primary/10 bg-primary/5 px-4 py-2.5 transition-all group-hover:border-primary/20 group-hover:bg-primary/10 group-active:scale-[0.98]">
            <span className="text-sm font-bold text-primary">Open gig</span>
            <ArrowUpRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
