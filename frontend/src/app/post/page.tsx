"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getApiBase } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GIG_CATEGORIES } from "@/lib/constants";
import { AlertCircle, PlusCircle } from "lucide-react";

export default function PostGigPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    tags: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validateForm() {
    if (!form.title.trim()) return "Title is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.category.trim()) return "Category is required";
    if (!form.price.trim()) return "Price is required";

    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) {
      return "Price must be greater than 0";
    }

    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      tags: form.tags.trim()
        ? form.tags
            .split(",")
            .map((tag) => tag.trim().replace(/^"+|"+$/g, ""))
            .filter(Boolean)
        : [],
    };

    try {
      const res = await fetch(`${getApiBase()}/api/v1/gigs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          err.detail ||
          err.error ||
          err.details?.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("; ") ||
          "Failed to create gig";

        throw new Error(message);
      }

      router.push("/my-gigs");
    } catch (err: any) {
      setError(err.message || "Failed to create gig");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card className="shadow-lg border-primary/10 overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary mb-2">
            <PlusCircle className="size-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Seller tools</span>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Post a New Gig</CardTitle>
          <CardDescription>
            Offer your skills to the marketplace. Provide clear details to attract more buyers.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20 animate-in fade-in zoom-in-95">
                <AlertCircle className="size-5 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold">Gig Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="I will design a professional logo for your brand"
                className="rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Clear titles help buyers find your services.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold">Detailed Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe exactly what you offer, including deliverables and turnaround time..."
                className="rounded-xl resize-none"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="font-bold">Category <span className="text-destructive">*</span></Label>
                <select
                  id="category"
                  name="category"
                  required
                  value={form.category}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {GIG_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="font-bold">Starting Price ($) <span className="text-destructive">*</span></Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="1"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="25"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="font-bold">Keywords / Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="design, logo, branding, web"
                className="rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Separate keywords with commas.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
            <Button type="submit" className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Publishing service..." : "Publish Gig"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()} className="rounded-full">
              Cancel and return
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
