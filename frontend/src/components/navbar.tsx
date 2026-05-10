"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import { validateSession, logout, type UserPublic } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null | undefined>(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncAuthState = async () => {
      const u = await validateSession();
      setUser(u);
    };
    const handleAuthRefresh = () => {
      void syncAuthState();
    };

    void syncAuthState();
    window.addEventListener("focus", handleAuthRefresh);
    window.addEventListener("storage", handleAuthRefresh);
    window.addEventListener("auth:logout", handleAuthRefresh);

    return () => {
      window.removeEventListener("focus", handleAuthRefresh);
      window.removeEventListener("storage", handleAuthRefresh);
      window.removeEventListener("auth:logout", handleAuthRefresh);
    };
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (!accountRef.current?.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setAccountOpen(false);
    router.replace("/");
    router.refresh();
  };

  const isSeller = user?.role === "seller";
  const isBuyer = user?.role === "buyer";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-primary transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Image
              src="/logo.png"
              alt="GigLink logo"
              width={32}
              height={32}
              priority
              className="rounded-lg shadow-sm"
            />
            <span className="hidden sm:inline">GigLink</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {!user || isBuyer ? (
              <Link
                href="/browse"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-full gap-2 px-4",
                  pathname === "/browse" && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                )}
              >
                <Search className="size-4" />
                Browse
              </Link>
            ) : null}

            {isSeller && (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "rounded-full px-4",
                    pathname === "/dashboard" && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/my-gigs"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "rounded-full px-4",
                    pathname === "/my-gigs" && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                  )}
                >
                  My Gigs
                </Link>
              </>
            )}

            {user && (
              <Link
                href="/orders"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-full px-4",
                  pathname === "/orders" && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                )}
              >
                Orders
              </Link>
            )}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isSeller && (
            <Link
              href="/post"
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden h-9 gap-2 px-5 rounded-full shadow-lg shadow-primary/20 lg:inline-flex",
              )}
            >
              <PlusCircle className="size-4" />
              Post a gig
            </Link>
          )}

          <ThemeToggle />

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          {user === undefined ? (
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <div className="relative hidden items-center gap-2 sm:flex" ref={accountRef}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-border/60 pl-1 pr-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                onClick={() => setAccountOpen((v) => !v)}
              >
                <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="sm" className="ring-1 ring-border/50" />
                <span className="max-w-[80px] truncate text-xs font-bold">{user.name.split(' ')[0]}</span>
                <ChevronDown className={cn("size-3.5 shrink-0 opacity-40 transition-transform duration-200", accountOpen && "rotate-180")} />
              </Button>

              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute left-auto right-0 top-[calc(100%+8px)] z-50 min-w-[240px] origin-top-right overflow-hidden rounded-2xl border border-border/60 bg-popover p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="px-3 py-3 mb-1 bg-muted/30 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-bold text-foreground">{user.email}</p>
                  </div>
                  
                  <div className="space-y-0.5">
                    {isBuyer && (
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary"
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard className="size-4 opacity-70" />
                        Dashboard
                      </Link>
                    )}

                    {isSeller && (
                      <Link
                        href="/browse"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Search className="size-4 opacity-70" />
                        Browse Marketplace
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary"
                      onClick={() => setAccountOpen(false)}
                    >
                      <UserRound className="size-4 opacity-70" />
                      Profile Settings
                    </Link>
                  </div>

                  <div className="my-1.5 h-px bg-border/40" />
                  
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full px-4")}
              >
                Sign In
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5 shadow-lg shadow-primary/20")}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-background px-4 py-6 md:hidden animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-1.5">
            {(!user || isBuyer) && (
              <Link
                href="/browse"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary",
                  pathname === "/browse" && "bg-primary/10 text-primary",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Search className="size-5 opacity-70" />
                Browse marketplace
              </Link>
            )}

            {isSeller && (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary",
                    pathname === "/dashboard" && "bg-primary/10 text-primary",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="size-5 opacity-70" />
                  Dashboard
                </Link>
                <Link
                  href="/my-gigs"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary",
                    pathname === "/my-gigs" && "bg-primary/10 text-primary",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingBag className="size-5 opacity-70" />
                  My gigs
                </Link>
                <Link
                  href="/post"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-4 justify-center gap-2 rounded-xl shadow-lg shadow-primary/20",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <PlusCircle className="size-5" />
                  Post a gig
                </Link>
              </>
            )}

            {user ? (
              <>
                <Link
                  href="/orders"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary",
                    pathname === "/orders" && "bg-primary/10 text-primary",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Package className="size-5 opacity-70" />
                  Orders
                </Link>
                
                <div className="my-4 h-px bg-border/40" />

                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary",
                    pathname === "/profile" && "bg-muted",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <UserRound className="size-5 opacity-70" />
                  Profile settings
                </Link>

                {isSeller && (
                   <Link
                   href="/browse"
                   className={cn(
                     "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary",
                     pathname === "/browse" && "bg-muted",
                   )}
                   onClick={() => setMobileOpen(false)}
                 >
                   <Search className="size-5 opacity-70" />
                   Browse Marketplace
                 </Link>
                )}
                
                {isBuyer && (
                   <Link
                   href="/dashboard"
                   className={cn(
                     "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-primary/5 hover:text-primary",
                     pathname === "/dashboard" && "bg-muted",
                   )}
                   onClick={() => setMobileOpen(false)}
                 >
                   <LayoutDashboard className="size-5 opacity-70" />
                   Dashboard
                 </Link>
                )}

                <button
                  type="button"
                  className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-black text-destructive transition-colors hover:bg-destructive/10"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                >
                  <LogOut className="size-5" />
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl font-bold")}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }), "rounded-xl font-bold shadow-lg shadow-primary/20")}
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
