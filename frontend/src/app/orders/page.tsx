"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, ExternalLink, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import type { OrderPublic } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function normalizeRole(role: string | undefined): "buyer" | "seller" | null {
  if (!role) return null;
  const r = role.toString().toLowerCase();
  if (r === "buyer" || r === "seller") return r;
  return null;
}

function statusChipClass(status: OrderPublic["status"]) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "accepted":
      return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
    case "rejected":
      return "bg-destructive/10 text-destructive";
    case "completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function buyerStatusLabel(status: OrderPublic["status"]): string {
  switch (status) {
    case "pending":
      return "Waiting for seller response";
    case "accepted":
      return "Seller is currently working on it";
    case "rejected":
      return "Seller declined this request";
    case "completed":
      return "Service has been delivered";
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
      <div className="space-y-6 py-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full max-w-xl" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const accountRole = normalizeRole(user.role);

  return (
    <main className="flex flex-col gap-10">
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

      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-widest text-primary/80">
          Transactions
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Manage Orders
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {accountRole === "buyer"
            ? "Track your requests and follow up on the status of your services."
            : accountRole === "seller"
              ? "Review and fulfill incoming requests from buyers who want to hire you."
              : "Monitor your purchases and sales on GigLink."}
        </p>
      </header>

      {listLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="pt-4">
          {accountRole === "seller" ? (
            <EmptyState
              icon={Package}
              title="No buyer requests yet"
              description="When buyers purchase your gigs, their requests will appear here for you to manage and fulfill."
            />
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="You haven't ordered anything"
              description="Find the perfect service for your next project and track your orders right here."
              action={{
                label: "Browse Marketplace",
                href: "/browse",
              }}
            />
          )}
        </div>
      ) : (
        <ul className="grid gap-6">
          {orders.map((o) => (
            <li key={o.id}>
              <Card className="border-border/60 overflow-hidden transition-all hover:border-primary/20 hover:shadow-md">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold font-mono tracking-tighter text-muted-foreground uppercase">
                           Order #{o.id.slice(0, 8)}
                         </span>
                         <span className="text-muted-foreground/30 px-1">•</span>
                         <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDateTime(o.created_at)}
                         </span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {o.gig_title}
                      </CardTitle>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-transparent",
                        statusChipClass(o.status),
                      )}
                    >
                      {o.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Request Details</p>
                          <div className="rounded-xl border border-border bg-muted/20 p-4">
                            <p className="text-sm leading-relaxed text-foreground italic">
                              &ldquo;{o.message}&rdquo;
                            </p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/5 p-4">
                          {accountRole === "buyer" ? (
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Seller Response Status</p>
                               <p className="text-sm font-bold text-foreground">
                                 {buyerStatusLabel(o.status)}
                               </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                               <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-black text-primary">
                                  {o.buyer_name?.[0].toUpperCase()}
                               </div>
                               <div className="space-y-0.5">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Buyer Identity</p>
                                  <p className="text-sm font-bold text-foreground">{o.buyer_name}</p>
                               </div>
                            </div>
                          )}
                          <div className="pt-2 border-t border-border/50">
                             <p className="text-[10px] font-medium text-muted-foreground">
                               Last activity {formatRelativeTime(o.updated_at)}
                             </p>
                          </div>
                       </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/10 border-t border-border/40 py-4 flex flex-wrap gap-3">
                  {accountRole === "seller" && o.status === "pending" && (
                    <div className="flex flex-wrap gap-2 mr-auto">
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full px-6"
                        onClick={() => void updateStatus(o.id, "accepted")}
                      >
                        Accept Request
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="rounded-full"
                        onClick={() =>
                          setConfirm({ type: "reject", orderId: o.id })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {accountRole === "seller" && o.status === "accepted" && (
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full mr-auto"
                      onClick={() => void updateStatus(o.id, "completed")}
                    >
                      Mark as Completed
                    </Button>
                  )}

                  <div className="flex gap-2 ml-auto">
                    <Link
                      href={`/gigs/${o.gig_id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-2")}
                    >
                      View Gig
                      <ExternalLink className="size-3" />
                    </Link>

                    {accountRole === "buyer" && o.status === "pending" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-destructive hover:bg-destructive/5 hover:text-destructive"
                        onClick={() =>
                          setConfirm({ type: "cancel", orderId: o.id })
                        }
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
