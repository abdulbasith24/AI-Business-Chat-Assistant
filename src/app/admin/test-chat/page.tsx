"use client";

import React, { useState } from "react";

interface ChunkResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

export default function TestChatPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [chunks, setChunks] = useState<ChunkResult[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSearchSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Test Chat (RAG Simulator)</h1>
        <p className="text-sm text-slate-500">Query your database to see exactly what context chunks and match scores are retrieved.</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border text-sm ${
            message.type === "success"
              ? "bg-indigo-50 border-indigo-200 text-indigo-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Query Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your business (e.g., What services do you offer?)"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {loading ? "Searching..." : "Retrieve Chunks"}
        </button>
      </form>

      {/* AI Grounded Response Section */}
      {aiAnswer && (
        <div className="mb-8 bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase text-indigo-700 tracking-wider mb-2">Final AI Response</h2>
          <div className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
            {aiAnswer}
          </div>
        </div>
      )}

      {/* Retrieved Chunks Display */}
      {chunks.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-slate-700">Retrieved Context (Top Results &gt; 50% match)</h2>
          <div className="grid gap-6">
            {chunks.map((chunk, idx) => (
              <div key={chunk.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 truncate max-w-xs">
                      Source: {chunk.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${
                      chunk.similarity >= 0.75
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    Match: {(chunk.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
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