"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { getApiBase } from "@/lib/api";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `${getApiBase()}/api/v1/auth/verify-email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          },
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Verification failed");
        }

        setStatus("success");
        setMessage("Your email has been verified successfully!");
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: unknown) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      }
    }

    void verify();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Email Verification</h1>

        {status === "loading" && (
          <p className="text-gray-500">Verifying your email...</p>
        )}

        {status === "success" && (
          <div>
            <div className="mb-4 text-5xl text-green-500">✓</div>
            <p className="font-medium text-green-600">{message}</p>
            <p className="mt-2 text-sm text-gray-500">Redirecting to login...</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="mb-4 text-5xl text-red-500">✗</div>
            <p className="font-medium text-red-600">{message}</p>
            <Link
              href="/login"
              className="mt-4 inline-block text-green-600 hover:underline"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading…</p>
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
