import Link from "next/link";
import { GigPublic } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface GigCardProps {
  gig: GigPublic;
}

export function GigCard({ gig }: GigCardProps) {
  return (
    <Link href={`/gigs/${gig.id}`}>
      <Card className="h-full transition-colors hover:bg-accent/50">
        <CardHeader>
          <CardTitle className="line-clamp-1 text-lg">{gig.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {gig.description}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="text-sm font-semibold">${gig.price}</span>
          <span className="text-xs text-muted-foreground uppercase">{gig.category}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
