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

  const isSeller = user?.role === "seller";
  const isBuyer = user?.role === "buyer";

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
            {!user || isBuyer ? (
              <Link
                href="/browse"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-2",
                  pathname === "/browse" && "bg-muted text-foreground",
                )}
              >
                <Search className="size-4 opacity-70" />
                Browse
              </Link>
            ) : null}

            {isSeller && (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    pathname === "/dashboard" && "bg-muted text-foreground",
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/my-gigs"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    pathname === "/my-gigs" && "bg-muted text-foreground",
                  )}
                >
                  My gigs
                </Link>
              </>
            )}

            {user && (
              <Link
                href="/orders"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  pathname === "/orders" && "bg-muted text-foreground",
                )}
              >
                Orders
              </Link>
            )}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isSeller && (
            <Link
              href="/post"
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden h-9 gap-2 px-4 lg:inline-flex",
              )}
            >
              <PlusCircle className="size-4" />
              Post a gig
            </Link>
          )}

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
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-semibold">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  
                  {isBuyer && (
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
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
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Search className="size-4 opacity-70" />
                      Browse Marketplace
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setAccountOpen(false)}
                  >
                    <UserRound className="size-4 opacity-70" />
                    Profile
                  </Link>

                  <div className="my-1 h-px bg-border" />
                  
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
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
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
            {(!user || isBuyer) && (
              <Link
                href="/browse"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted",
                  pathname === "/browse" && "bg-muted",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Search className="size-4 opacity-70" />
                Browse marketplace
              </Link>
            )}

            {isSeller && (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted",
                    pathname === "/dashboard" && "bg-muted",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="size-4 opacity-70" />
                  Dashboard
                </Link>
                <Link
                  href="/my-gigs"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted",
                    pathname === "/my-gigs" && "bg-muted",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingBag className="size-4 opacity-70" />
                  My gigs
                </Link>
                <Link
                  href="/post"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "mt-2 justify-center gap-2",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <PlusCircle className="size-4" />
                  Post a gig
                </Link>
              </>
            )}

            {user ? (
              <>
                <Link
                  href="/orders"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted",
                    pathname === "/orders" && "bg-muted",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Package className="size-4 opacity-70" />
                  Orders
                </Link>
                
                <div className="my-2 h-px bg-border/50" />

                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted",
                    pathname === "/profile" && "bg-muted",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <UserRound className="size-4 opacity-70" />
                  Profile
                </Link>

                {isSeller && (
                   <Link
                   href="/browse"
                   className={cn(
                     "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted",
                     pathname === "/browse" && "bg-muted",
                   )}
                   onClick={() => setMobileOpen(false)}
                 >
                   <Search className="size-4 opacity-70" />
                   Browse Marketplace
                 </Link>
                )}
                
                {isBuyer && (
                   <Link
                   href="/dashboard"
                   className={cn(
                     "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted",
                     pathname === "/dashboard" && "bg-muted",
                   )}
                   onClick={() => setMobileOpen(false)}
                 >
                   <LayoutDashboard className="size-4 opacity-70" />
                   Dashboard
                 </Link>
                )}

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                >
                  <LogOut className="size-4" />
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
