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

    return () => {
      window.removeEventListener("focus", handleAuthRefresh);
      window.removeEventListener("storage", handleAuthRefresh);
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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Image
              src="/logo.png"
              alt="GigLink logo"
              width={28}
              height={28}
              priority
            />
            <span>GigLink</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex md:gap-2">
            <Link
              href="/browse"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-primary/60 bg-background text-foreground hover:border-primary hover:bg-primary/10",
                pathname === "/browse" && "bg-primary/10 border-primary",
              )}
            >
              Browse
            </Link>
            {user?.role !== "buyer" && (
              <Link
                href={user ? "/post" : "/login"}
                className={cn(buttonVariants({ size: "sm" }), "hidden lg:inline-flex")}
              >
                Post a gig
              </Link>
            )}
            {user?.role === "seller" ? (
              <Link
                href="/my-gigs"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  pathname === "/my-gigs" && "bg-muted",
                )}
              >
                My gigs
              </Link>
            ) : null}
            {user ? (
              <>
                <Link
                  href="/orders"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-primary/60 bg-background text-foreground hover:border-primary hover:bg-primary/10",
                    pathname === "/orders" && "bg-primary/10 border-primary",
                  )}
                >
                  Orders
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-primary/60 bg-background text-foreground hover:border-primary hover:bg-primary/10",
                    pathname === "/dashboard" && "bg-primary/10 border-primary",
                  )}
                >
                  Dashboard
                </Link>
              </>
            ) : null}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
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
            <span className="hidden px-2 text-sm text-muted-foreground sm:inline">
              …
            </span>
          ) : user ? (
            <div className="relative hidden items-center gap-2 sm:flex" ref={accountRef}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2 border-border pl-1 pr-2"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                onClick={() => setAccountOpen((v) => !v)}
              >
                <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="sm" />
                <ChevronDown className="size-4 shrink-0 opacity-60" />
              </Button>

              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute left-auto right-0 top-[calc(100%+6px)] z-50 min-w-[220px] origin-top-right rounded-xl border border-border bg-popover p-1 shadow-lg"
                >
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setAccountOpen(false)}
                  >
                    <LayoutDashboard className="size-4 opacity-70" />
                    Dashboard
                  </Link>
                  <Link
                    href="/my-gigs"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setAccountOpen(false)}
                  >
                    <ShoppingBag className="size-4 opacity-70" />
                    My gigs
                  </Link>
                  <Link
                    href="/orders"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setAccountOpen(false)}
                  >
                    <Package className="size-4 opacity-70" />
                    Orders
                  </Link>
                  <Link
                    href="/profile"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setAccountOpen(false)}
                  >
                    <UserRound className="size-4 opacity-70" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
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
                className={cn(buttonVariants({ variant: "outline", size: "sm" }),
                "border-primary/60 bg-background text-foreground hover:border-primary hover:bg-primary/10")}
              >
                Login
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/browse"
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              Browse marketplace
            </Link>
            {user?.role !== "buyer" && (
              <Link
                href={user ? "/post" : "/login"}
                className={cn(buttonVariants({ size: "sm" }), "justify-center")}
                onClick={() => setMobileOpen(false)}
              >
                Post a gig
              </Link>
            )}

            {user ? (
              <>
                <p className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Account ({user.role})
                </p>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/my-gigs"
                  className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  My gigs
                </Link>
                <Link
                  href="/orders"
                  className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/profile"
                  className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="mt-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ className: "mt-1 justify-center" }))}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
