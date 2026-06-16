"use client";

import React, { useEffect, useState } from "react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleCreateSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create FAQ");
      }

      setMessage({ type: "success", text: "New FAQ registered successfully." });
      setQuestion("");
      setAnswer("");
      fetchFaqs();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete FAQ");
      }

      setFaqs((prev) => prev.filter((item) => item.id !== id));
      setMessage({ type: "success", text: "FAQ removed successfully." });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Error deleting FAQ." });
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FAQ Manager</h1>
        <p className="text-sm text-slate-500">Configure instant-reply questions to optimize server processing and reduce API costs.</p>
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

      {/* Creation form */}
      <form onSubmit={handleCreateSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">Add Instant FAQ Answer</h2>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What are your business hours?"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Answer</label>
          <textarea
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g., Our business hours are Monday - Friday, 9:00 AM - 5:00 PM EST."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving || !question.trim() || !answer.trim()}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
          >
            {isSaving ? "Saving..." : "Add FAQ"}
          </button>
        </div>
      </form>

      {/* FAQs List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Active FAQs</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400 animate-pulse">
            Loading active FAQs...
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No FAQs preconfigured yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-6 flex justify-between items-start gap-4 hover:bg-slate-50/50">
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">Q: {faq.question}</h3>
                  <p className="text-xs text-slate-600 font-medium">A: {faq.answer}</p>
                </div>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/50 px-3 py-1.5 rounded-md"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}