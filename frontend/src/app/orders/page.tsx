"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import type { OrderPublic } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function normalizeRole(role: string | undefined): "buyer" | "seller" | null {
  if (!role) return null;
  const r = role.toString().toLowerCase();
  if (r === "buyer" || r === "seller") return r;
  return null;
}

function statusChipClass(status: OrderPublic["status"]) {
  switch (status) {
    case "pending":
      return "border-amber-500/35 bg-amber-500/15 text-amber-900 dark:text-amber-200";
    case "accepted":
      return "border-sky-500/35 bg-sky-500/15 text-sky-900 dark:text-sky-200";
    case "rejected":
      return "border-destructive/35 bg-destructive/15 text-destructive";
    case "completed":
      return "border-emerald-500/35 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function buyerStatusLabel(status: OrderPublic["status"]): string {
  switch (status) {
    case "pending":
      return "Pending — waiting for the seller";
    case "accepted":
      return "Accepted — seller is working on it";
    case "rejected":
      return "Rejected — seller declined this request";
    case "completed":
      return "Completed — order is closed";
    default:
      return status;
  }
}

export default function OrdersPage() {
  const { user, loading } = useSession(true);
  const [orders, setOrders] = useState<OrderPublic[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [confirm, setConfirm] = useState<
    | { type: "cancel"; orderId: string }
    | { type: "reject"; orderId: string }
    | null
  >(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    void (async () => {
      try {
        const list = await apiFetch<OrderPublic[]>("/api/v1/orders");
        if (!cancelled) {
          setOrders(Array.isArray(list) ? list : []);
        }
      } catch {
        if (!cancelled) setOrders([]);
        toast.error("Could not load orders");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function updateStatus(
    orderId: string,
    status: "accepted" | "rejected" | "completed",
  ) {
    try {
      const updated = await apiFetch<OrderPublic>(`/api/v1/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success(`Order marked ${status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function cancelOrder(orderId: string) {
    try {
      await apiFetch(`/api/v1/orders/${orderId}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Order request cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel");
    }
  }

  if (loading || !user) {
    return (
      <div className="space-y-4 py-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full max-w-xl" />
      </div>
    );
  }

  const accountRole = normalizeRole(user.role);

  return (
    <main className="flex flex-col gap-8">
      <ConfirmDialog
        open={confirm?.type === "cancel"}
        title="Cancel this request?"
        description="The seller will no longer see this pending order."
        confirmLabel="Cancel request"
        variant="destructive"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "cancel") {
            void cancelOrder(confirm.orderId);
          }
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm?.type === "reject"}
        title="Reject this order?"
        description="The buyer will see this request as rejected."
        confirmLabel="Reject order"
        variant="destructive"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "reject") {
            void updateStatus(confirm.orderId, "rejected");
          }
          setConfirm(null);
        }}
      />

      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Orders
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Your orders
        </h1>
        <p className="mt-2 text-muted-foreground">
          {accountRole === "buyer"
            ? "See each gig you requested and whether it is pending, accepted, or rejected."
            : accountRole === "seller"
              ? "Incoming buyer requests for your gigs include their name and when each request arrived."
              : "Track purchases or sales."}
        </p>
      </header>

      {listLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
          {accountRole === "seller" ? (
            <>
              <p className="font-medium">No buyer requests yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This page lists orders buyers place on your gigs. Create a gig,
                then have a buyer submit{" "}
                <code className="rounded bg-muted px-1">POST /api/v1/orders</code>{" "}
                with your gig ID.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Nothing here yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                When you request a gig as a buyer, it will appear here with
                status and the time you sent it.
              </p>
              <Link
                href="/browse"
                className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
              >
                Browse gigs
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-xs font-mono text-muted-foreground">
                    Order {o.id.slice(0, 8)}… ·{" "}
                    {accountRole === "seller" ? "Received" : "Sent"}{" "}
                    <span className="font-sans text-foreground">
                      {formatDateTime(o.created_at)}
                    </span>
                  </p>

                  <h2 className="text-lg font-semibold leading-tight">
                    {o.gig_title}
                  </h2>

                  {accountRole === "buyer" ? (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        Your request:{" "}
                        <span className="capitalize">{o.status}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {buyerStatusLabel(o.status)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Buyer:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {o.buyer_name}
                      </span>
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Last updated {formatRelativeTime(o.updated_at)}
                  </p>
                </div>

                <span
                  className={cn(
                    "inline-flex h-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                    statusChipClass(o.status),
                  )}
                >
                  {o.status}
                </span>
              </div>

              <div className="mt-4 rounded-lg border border-border/80 bg-muted/20 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Message
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {o.message}
                </p>
              </div>

              {accountRole === "seller" && o.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void updateStatus(o.id, "accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setConfirm({ type: "reject", orderId: o.id })
                    }
                  >
                    Reject
                  </Button>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/gigs/${o.gig_id}`}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  View gig
                </Link>

                {accountRole === "buyer" && o.status === "pending" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfirm({ type: "cancel", orderId: o.id })
                    }
                  >
                    Cancel request
                  </Button>
                ) : null}

                {accountRole === "seller" && o.status === "accepted" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => void updateStatus(o.id, "completed")}
                  >
                    Mark complete
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
