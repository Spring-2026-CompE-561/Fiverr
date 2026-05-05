"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getApiBase } from "@/lib/api";

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

    console.log("Gig payload:", payload);
    console.log("Tags is array?", Array.isArray(payload.tags));

    try {
      const res = await fetch(`${getApiBase()}/api/v1/gigs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.log("Gig error full:", JSON.stringify(err, null, 2));

        const message =
          err.detail ||
          err.error ||
          err.details?.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("; ") ||
          "Failed to create gig";

        throw new Error(message);
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create gig");
    } finally {
      setLoading(false);
    }
  }

  const requiredStar = <span className="text-red-500">*</span>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-center flex-1">Post a Gig</h1>

          <p className="text-sm text-red-500 whitespace-nowrap">
            <span className="font-bold">*</span> required
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title {requiredStar}
            </label>
            <input
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="I will design a professional logo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description {requiredStar}
            </label>
            <textarea
              name="description"
              required
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your service in detail..."
            />
          </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category {requiredStar}
            </label>

            <select
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a category</option>
              <option value="Home Repair">Home Repair</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Moving">Moving</option>
              <option value="Yard Work">Yard Work</option>
              <option value="Painting">Painting</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Handyman">Handyman</option>
              <option value="Tutoring">Tutoring</option>
              <option value="Pet Care">Pet Care</option>
              <option value="Babysitting">Babysitting</option>
              <option value="Delivery">Delivery</option>
              <option value="Tech Support">Tech Support</option>
              <option value="Web Design">Web Design</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Writing">Writing</option>
              <option value="Photography">Photography</option>
              <option value="Event Help">Event Help</option>
              <option value="Auto Services">Auto Services</option>
              <option value="Misc">Misc</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) {requiredStar}
            </label>
            <input
              name="price"
              type="number"
              required
              min="1"
              value={form.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="design, logo, branding"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional. Separate tags with commas.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Gig"}
          </button>
        </form>
      </div>
    </div>
  );
}