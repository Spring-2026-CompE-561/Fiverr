"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { validateSession } from "@/lib/auth";

export function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuthState = async () => {
      const user = await validateSession();
      setIsLoggedIn(Boolean(user));
    };
    const handleAuthRefresh = () => {
      void syncAuthState();
    };

    handleAuthRefresh();
    window.addEventListener("focus", handleAuthRefresh);
    window.addEventListener("storage", handleAuthRefresh);

    return () => {
      window.removeEventListener("focus", handleAuthRefresh);
      window.removeEventListener("storage", handleAuthRefresh);
    };
  }, [pathname]);

  return (
    <header className="border-b border-border bg-card">
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

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/browse" className="text-muted-foreground hover:text-foreground">
              Browse
            </Link>
            <Link
              href={isLoggedIn ? "/post" : "/login"}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              Post Gig
            </Link>
          </nav>
        </div>
        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:bg-gray-100"
        >
          {isLoggedIn ? "Dashboard" : "Login"}
        </Link>
      </div>
    </header>
  );
}
