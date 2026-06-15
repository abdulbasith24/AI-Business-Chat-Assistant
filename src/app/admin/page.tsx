"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanySchema, type CompanyInput } from "@/lib/validation";

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
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500 animate-pulse">Loading company settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Profile</h1>
        <p className="text-sm text-slate-500">Configure core metadata for grounding chatbot responses.</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border text-sm ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g., Acme Consulting Services"
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">About Company (Description)</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Introduce what your business does..."
            {...register("description")}
          />
          {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Core Services</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="List your products, packages, or services..."
            {...register("services")}
          />
          {errors.services && <p className="mt-1 text-xs text-rose-600">{errors.services.message}</p>}
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Information</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g., support@acme.com, (555) 019-2834"
            {...register("contactInfo")}
          />
          {errors.contactInfo && <p className="mt-1 text-xs text-rose-600">{errors.contactInfo.message}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Office Address</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g., 123 Enterprise Suite, San Francisco, CA"
            {...register("address")}
          />
          {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address.message}</p>}
        </div>

        {/* Business Hours */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Business Hours</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g., Monday - Friday: 9:00 AM - 5:00 PM EST"
            {...register("businessHours")}
          />
          {errors.businessHours && <p className="mt-1 text-xs text-rose-600">{errors.businessHours.message}</p>}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}