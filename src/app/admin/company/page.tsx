"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanySchema, type CompanyInput } from "@/lib/validation";

// ── Icons ─────────────────────────────────────────────────────────────────────

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    </svg>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyInput>({
    resolver: zodResolver(CompanySchema),
  });

  // Load existing details on component render
  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        const response = await fetch("/api/admin/company");
        if (response.ok) {
          const data = await response.json();
          reset(data);
        }
      } catch (error) {
        console.error("Failed to load company details", error);
        setMessage({ type: "error", text: "Failed to connect to database API" });
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyDetails();
  }, [reset]);

  const onSubmit = async (data: CompanyInput) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      setMessage({ type: "success", text: "Company settings updated successfully." });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Something went wrong while saving changes." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Loading company settings...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      
      {/* ── Page Heading ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Company Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure core metadata for grounding chatbot responses.
        </p>
      </div>

      {/* ── Alert Messages ────────────────────────────────────────────────── */}
      {message && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              message.type === "success" ? "bg-emerald-500" : "bg-rose-500"
            }`}
            aria-hidden="true"
          />
          <p>{message.text}</p>
        </div>
      )}

      {/* ── Form Container ────────────────────────────────────────────────── */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-6 bg-white p-6 lg:p-8 rounded-xl border border-slate-200 shadow-sm"
      >
        
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Company Name
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            placeholder="e.g., Acme Consulting Services"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            About Company (Description)
          </label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-y"
            placeholder="Introduce what your business does..."
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Core Services
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-y"
            placeholder="List your products, packages, or services..."
            {...register("services")}
          />
          {errors.services && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.services.message}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Contact Information
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            placeholder="e.g., support@acme.com, (555) 019-2834"
            {...register("contactInfo")}
          />
          {errors.contactInfo && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.contactInfo.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Office Address
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            placeholder="e.g., 123 Enterprise Suite, San Francisco, CA"
            {...register("address")}
          />
          {errors.address && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Business Hours */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Business Hours
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            placeholder="e.g., Monday - Friday: 9:00 AM - 5:00 PM EST"
            {...register("businessHours")}
          />
          {errors.businessHours && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.businessHours.message}
            </p>
          )}
        </div>

        {/* Save CTA Row */}
        <div className="pt-5 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}