"use client";

import React, { useState } from "react";

interface ChunkResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 3h6v7l3.5 6.5A2 2 0 0 1 16.76 19H7.24a2 2 0 0 1-1.74-2.5L9 10V3z" />
      <line x1="9" y1="3" x2="15" y2="3" />
    </svg>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function TestChatPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [chunks, setChunks] = useState<ChunkResult[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setMessage(null);
    setChunks([]);
    setAiAnswer("");

    try {
      const res = await fetch("/api/admin/test-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to query vector database");
      }

      setAiAnswer(data.answer);
      setChunks(data.chunks);

      if (data.chunks.length === 0) {
        setMessage({ type: "success", text: "Query processed. No relevant knowledge document chunks passed the 45% threshold." });
      }
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: "error", text: (err as Error).message || "An error occurred during vector retrieval search." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* ── Page Heading ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Test Chat (RAG Simulator)
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Query your database to see exactly what context chunks and match scores are retrieved.
        </p>
      </div>

      {/* ── Alert Messages ────────────────────────────────────────────────── */}
      {message && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm ${
            message.type === "success"
              ? "bg-indigo-50 border-indigo-100 text-indigo-800"
              : "bg-rose-50 border-rose-100 text-rose-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              message.type === "success" ? "bg-indigo-500" : "bg-rose-500"
            }`}
            aria-hidden="true"
          />
          <p>{message.text}</p>
        </div>
      )}

      {/* ── Query Input Bar ──────────────────────────────────────────────── */}
      <form onSubmit={handleSearchSubmit} className="flex gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <SearchIcon className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your business (e.g., What services do you offer?)"
            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
        >
          <BeakerIcon className="w-4 h-4" />
          {loading ? "Searching..." : "Retrieve Chunks"}
        </button>
      </form>

      {/* ── AI Grounded Response Card ────────────────────────────────────── */}
      {aiAnswer && (
        <div className="bg-indigo-50/40 border border-indigo-100/70 rounded-xl p-6 shadow-sm space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">
            Final AI Response
          </p>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {aiAnswer}
          </div>
        </div>
      )}

      {/* ── Retrieved Chunks Inventory Display ────────────────────────────── */}
      {chunks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Retrieved Context (Top Results &gt; 50% match)
          </h2>
          
          <div className="grid gap-5">
            {chunks.map((chunk, idx) => (
              <div 
                key={chunk.id} 
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
              >
                {/* Chunk Header Info */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-500 truncate max-w-xs">
                      Source: {chunk.title}
                    </span>
                  </div>
                  
                  {/* Status Similarity Indicator Badge */}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      chunk.similarity >= 0.75
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-amber-50 border-amber-100 text-amber-700"
                    }`}
                  >
                    Match: {(chunk.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                
                {/* Chunk Content Body */}
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}