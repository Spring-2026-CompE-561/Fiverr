"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { validateSession, type UserPublic } from "@/lib/auth";

export function useSession(requireAuth = false): {
  user: UserPublic | null;
  loading: boolean;
} {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const u = await validateSession();
      if (cancelled) return;
      setUser(u);
      setLoading(false);
      if (requireAuth && !u) {
        router.replace("/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requireAuth, router]);

  return { user, loading };
}
