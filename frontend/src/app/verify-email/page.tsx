"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getApiBase } from "@/lib/api";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token ? "" : "No verification token found.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`${getApiBase()}/api/v1/auth/verify-email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
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

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

        {status === "loading" && (
          <p className="text-gray-500">Verifying your email...</p>
        )}

        {status === "success" && (
          <div>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-gray-500 text-sm mt-2">
              Redirecting to login...
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <p className="text-red-600 font-medium">{message}</p>
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading verification...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
