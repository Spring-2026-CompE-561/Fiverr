"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Search, SearchX, X } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { GIG_CATEGORIES } from "@/lib/constants";
import { pickRandom, SEARCH_PLACEHOLDERS } from "@/lib/realistic-gigs";
import type { GigPublic } from "@/lib/types";
import { GigCard } from "@/components/gig-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const SORT_KEY = "giglink_browse_sort";

function BrowseSkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex justify-between items-start">
             <Skeleton className="h-6 w-24 rounded-full" />
             <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [browseSearchPlaceholder, setBrowseSearchPlaceholder] = useState(
    SEARCH_PLACEHOLDERS[0]
  );

  useEffect(() => {
    setBrowseSearchPlaceholder(pickRandom(SEARCH_PLACEHOLDERS));
  }, []);
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [gigs, setGigs] = useState<GigPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasSearch = searchInput.trim().length > 0;
  const hasCategory = category.trim().length > 0;
  const hasMinPrice = minPrice.trim().length > 0;
  const hasMaxPrice = maxPrice.trim().length > 0;
  const hasCustomSort = sort !== "newest";
  const activeFilterCount = [
    hasSearch,
    hasCategory,
    hasMinPrice,
    hasMaxPrice,
    hasCustomSort,
  ].filter(Boolean).length;

  const fieldClassName = (active: boolean) =>
    cn(
      "flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all duration-200",
      active && "border-primary/60 bg-primary/5 ring-primary/20 ring-1"
    );

  useEffect(() => {
    const stored = sessionStorage.getItem(SORT_KEY);
    if (
      stored === "newest" ||
      stored === "price_asc" ||
      stored === "price_desc"
    ) {
      setSort(stored);
    }
  }, []);

  useEffect(() => {
    setSearchInput(initialSearch);
    setCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }
        if (category.trim()) params.set("category", category.trim());
        const min = minPrice.trim() ? Number(minPrice) : NaN;
        const max = maxPrice.trim() ? Number(maxPrice) : NaN;
        if (!Number.isNaN(min)) params.set("minPrice", String(min));
        if (!Number.isNaN(max)) params.set("maxPrice", String(max));
        if (sort && sort !== "newest") params.set("sort", sort);

        const qs = params.toString();
        const path = qs ? `/api/v1/gigs?${qs}` : "/api/v1/gigs";
        const data = await apiFetch<GigPublic[]>(path, { auth: false });
        if (!cancelled) {
          setGigs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to load gigs";
          setError(msg);
          setGigs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, minPrice, maxPrice, sort]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  function handleSortChange(next: string) {
    setSort(next);
    sessionStorage.setItem(SORT_KEY, next);
  }

  function handleResetAll() {
    setSearchInput("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    sessionStorage.removeItem(SORT_KEY);
  }

  return (
    <div className="flex min-w-0 flex-col gap-10">
      <header className="space-y-2 border-b border-border pb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-primary/80">
          Marketplace
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Browse Services
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Find the perfect freelance services for your business. Results update in real-time as you refine your search.
        </p>
      </header>

      <Card className="border-border/60 shadow-md">
        <CardContent className="p-6">
           <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="space-y-2 flex-1">
                 <Label htmlFor="browse-search" className="font-bold flex items-center gap-2 pl-2">
                    <Search className="size-3.5" />
                    Search
                 </Label>
                 <Input
                   id="browse-search"
                   value={searchInput}
                   onChange={(e) => setSearchInput(e.target.value)}
                   placeholder={browseSearchPlaceholder}
                   className={fieldClassName(hasSearch)}
                 />
              </div>

              <div className="space-y-2 w-full md:w-44">
                 <Label htmlFor="browse-sort" className="font-bold pl-2">Sort By</Label>
                 <select
                   id="browse-sort"
                   value={sort}
                   onChange={(e) => handleSortChange(e.target.value)}
                   className={fieldClassName(hasCustomSort)}
                 >
                   <option value="newest">Newest first</option>
                   <option value="price_asc">Price: low to high</option>
                   <option value="price_desc">Price: high to low</option>
                 </select>
              </div>

              <div className="space-y-2 w-full md:w-44">
                 <Label htmlFor="filter-category" className="font-bold pl-2">Category</Label>
                 <select
                   id="filter-category"
                   value={category}
                   onChange={(e) => setCategory(e.target.value)}
                   className={fieldClassName(hasCategory)}
                 >
                   <option value="">All categories</option>
                   {GIG_CATEGORIES.map((c) => (
                     <option key={c} value={c}>
                       {c}
                     </option>
                   ))}
                 </select>
              </div>

              <div className="space-y-2">
                 <Label className="invisible select-none" aria-hidden="true">_</Label>
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 font-bold"
                    onClick={handleResetAll}
                    disabled={activeFilterCount === 0}
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </Button>
              </div>
           </div>

           <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-border/50">
             <div className="flex items-center gap-2 mr-2">
                <Filter className="size-3.5 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price Range</span>
             </div>
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  id="min-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min ($)"
                  className={cn(fieldClassName(hasMinPrice), "h-8 w-24 text-xs")}
                />
                <span className="text-muted-foreground text-xs">—</span>
                <Input
                  id="max-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max ($)"
                  className={cn(fieldClassName(hasMaxPrice), "h-8 w-24 text-xs")}
                />
             </div>
           </div>

           {activeFilterCount > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {hasSearch && (
                  <Button variant="secondary" size="xs" className="rounded-full gap-1.5 h-7 bg-primary/5 text-primary border-primary/20" onClick={() => setSearchInput("")}>
                    Search: <span className="font-bold text-foreground truncate max-w-[80px]">{searchInput}</span>
                    <X className="size-3" />
                  </Button>
                )}
                {hasCategory && (
                  <Button variant="secondary" size="xs" className="rounded-full gap-1.5 h-7 bg-primary/5 text-primary border-primary/20" onClick={() => setCategory("")}>
                    Category: <span className="font-bold text-foreground">{category}</span>
                    <X className="size-3" />
                  </Button>
                )}
                {hasMinPrice && (
                  <Button variant="secondary" size="xs" className="rounded-full gap-1.5 h-7 bg-primary/5 text-primary border-primary/20" onClick={() => setMinPrice("")}>
                    Min: <span className="font-bold text-foreground">${minPrice}</span>
                    <X className="size-3" />
                  </Button>
                )}
                {hasMaxPrice && (
                  <Button variant="secondary" size="xs" className="rounded-full gap-1.5 h-7 bg-primary/5 text-primary border-primary/20" onClick={() => setMaxPrice("")}>
                    Max: <span className="font-bold text-foreground">${maxPrice}</span>
                    <X className="size-3" />
                  </Button>
                )}
              </div>
           )}
        </CardContent>
      </Card>

      {loading ? (
        <div data-testid="browse-loading">
          <BrowseSkeletonGrid />
        </div>
      ) : null}

      {!loading && error ? (
        <div
          data-testid="browse-error"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive font-bold"
        >
          {error}
        </div>
      ) : null}

      {!loading && !error && gigs.length === 0 ? (
        <div data-testid="browse-empty">
          <EmptyState
            icon={SearchX}
            title="No services found"
            description="We couldn't find any services matching your current filters. Try broadening your search or adjusting the price range."
            action={{
              label: "Reset all filters",
              href: "/browse",
            }}
            className="rounded-3xl"
          />
        </div>
      ) : null}

      {!loading && !error && gigs.length > 0 ? (
        <div data-testid="browse-gig-list" className="grid gap-6 sm:grid-cols-2">
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12" data-testid="browse-loading">
          <BrowseSkeletonGrid />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
