"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCcw, SearchX, X } from "lucide-react";
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

const SORT_KEY = "giglink_browse_sort";

function BrowseSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-xl border border-border bg-card p-5"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-4 w-32" />
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
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
      active && "border-primary/60 bg-primary/5 shadow-sm"
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
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            GigLink
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Browse gigs
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Filters apply instantly; search waits briefly while you type so
            requests stay smooth.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Refine results
            </h2>
            <p className="text-sm text-muted-foreground">
              Search, sort, and filters update together.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary/40 bg-background text-foreground hover:border-primary hover:bg-primary/10"
            onClick={handleResetAll}
            disabled={activeFilterCount === 0}
          >
            <RotateCcw className="size-4" />
            Reset all
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="min-w-0 space-y-2 md:col-span-2 xl:col-span-3">
            <Label htmlFor="browse-search">Search</Label>
            <Input
              id="browse-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={browseSearchPlaceholder}
              className={fieldClassName(hasSearch)}
            />
          </div>

          <div className="space-y-2 xl:col-span-1">
            <Label htmlFor="browse-sort">Sort</Label>
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

          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="filter-category">Category</Label>
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
            <Label htmlFor="min-price">Min price ($)</Label>
            <Input
              id="min-price"
              type="number"
              min={0}
              step={0.01}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className={fieldClassName(hasMinPrice)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">Max price ($)</Label>
            <Input
              id="max-price"
              type="number"
              min={0}
              step={0.01}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              className={fieldClassName(hasMaxPrice)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilterCount > 0 ? (
            <>
              {hasSearch ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/10"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                  <span className="text-muted-foreground">Search</span>
                  <span className="max-w-[12rem] truncate">
                    {searchInput.trim()}
                  </span>
                  <X className="size-3.5 opacity-60" />
                </button>
              ) : null}
              {hasCategory ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/10"
                  onClick={() => setCategory("")}
                  aria-label="Clear category"
                >
                  <span className="text-muted-foreground">Category</span>
                  <span className="max-w-[12rem] truncate">{category}</span>
                  <X className="size-3.5 opacity-60" />
                </button>
              ) : null}
              {hasMinPrice ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/10"
                  onClick={() => setMinPrice("")}
                  aria-label="Clear minimum price"
                >
                  <span className="text-muted-foreground">Min</span>
                  <span>${minPrice.trim()}</span>
                  <X className="size-3.5 opacity-60" />
                </button>
              ) : null}
              {hasMaxPrice ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/10"
                  onClick={() => setMaxPrice("")}
                  aria-label="Clear maximum price"
                >
                  <span className="text-muted-foreground">Max</span>
                  <span>${maxPrice.trim()}</span>
                  <X className="size-3.5 opacity-60" />
                </button>
              ) : null}
              {hasCustomSort ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/10"
                  onClick={() => handleSortChange("newest")}
                  aria-label="Clear sort"
                >
                  <span className="text-muted-foreground">Sort</span>
                  <span>
                    {sort === "price_asc"
                      ? "Price: low to high"
                      : "Price: high to low"}
                  </span>
                  <X className="size-3.5 opacity-60" />
                </button>
              ) : null}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Reset all clears search, sort, category, and price filters.
            </p>
          )}
        </div>
      </section>

      {loading ? <BrowseSkeletonGrid /> : null}

      {!loading && error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {!loading && !error && gigs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No gigs found"
          description="We couldn't find any gigs matching your current filters. Try adjusting your search or category."
          action={{
            label: "Post a gig",
            href: "/post",
          }}
        />
      ) : null}

      {!loading && !error && gigs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="py-12">
          <BrowseSkeletonGrid />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
