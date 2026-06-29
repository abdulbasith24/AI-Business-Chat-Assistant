// app/admin/faqs/page.tsx — Redesigned FAQ Manager Page
// All instant-reply logic, creation actions, deletion states, and API configurations are preserved.

"use client";

import React, { useEffect, useState } from "react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function FaqIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

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
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: "error", text: (err as Error).message || "Something went wrong." });
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
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: "error", text: (err as Error).message || "Error deleting FAQ." });
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* ── Page Heading ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          FAQ Manager
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure instant-reply questions to optimize server processing and reduce API costs.
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

      {/* ── Creation Form Card ────────────────────────────────────────────── */}
      <form 
        onSubmit={handleCreateSubmit} 
        className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5"
      >
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <FaqIcon className="w-4.5 h-4.5 text-slate-500" />
          Add Instant FAQ Answer
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What are your business hours?"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Answer
          </label>
          <textarea
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g., Our business hours are Monday - Friday, 9:00 AM - 5:00 PM EST."
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-y"
            required
          />
        </div>
        
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving || !question.trim() || !answer.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isSaving ? "Saving..." : "Add FAQ"}
          </button>
        </div>
      </form>

      {/* ── Active FAQs List Card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Active FAQs
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-500 animate-pulse">
            Loading active FAQs...
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No FAQs preconfigured yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className="p-6 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    <span className="text-indigo-600 font-bold mr-1">Q.</span> {faq.question}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
                
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors focus:outline-none"
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