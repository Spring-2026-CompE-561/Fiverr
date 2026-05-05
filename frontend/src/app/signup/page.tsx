"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/auth";

const fieldClass =
  "w-full border border-input bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card text-card-foreground border border-border p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create your GigLink Account</h1>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input name="name" required value={form.name} onChange={handleChange} className={fieldClass} placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className={fieldClass} placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">I want to</label>
            <select name="role" value={form.role} onChange={handleChange} className={fieldClass}>
              <option value="buyer">Buy services (Buyer)</option>
              <option value="seller">Sell services (Seller)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input type="password" name="password" required value={form.password} onChange={handleChange} className={fieldClass} placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} className={fieldClass} placeholder="••••••••" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
