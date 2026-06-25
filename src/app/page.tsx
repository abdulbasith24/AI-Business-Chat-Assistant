"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Display-only timestamp. Not sent to the API, not part of any contract. */
  createdAt: number;
}

const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "Who is Basith?",
  "What are your business hours?",
  "Where are you located?",
];

/* ------------------------------------------------------------------ */
/*  Inline icons (no external icon library required)                   */
/* ------------------------------------------------------------------ */

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5c.3 0 .56.2.63.5l1.2 4.8a4 4 0 0 0 2.87 2.87l4.8 1.2a.65.65 0 0 1 0 1.26l-4.8 1.2a4 4 0 0 0-2.87 2.87l-1.2 4.8a.65.65 0 0 1-1.26 0l-1.2-4.8a4 4 0 0 0-2.87-2.87l-4.8-1.2a.65.65 0 0 1 0-1.26l4.8-1.2a4 4 0 0 0 2.87-2.87l1.2-4.8c.07-.3.33-.5.63-.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 12.5a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 1.75c-3.6 0-7 1.8-7 4.5v.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.5c0-2.7-3.4-4.5-7-4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.4 11.05 19.8 3.34a.75.75 0 0 1 1 .98l-5.6 16.18a.75.75 0 0 1-1.39.08l-2.98-6.06-6.06-2.98a.75.75 0 0 1 .63-1.49Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function PublicChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! Welcome to our website. How can I assist you with our business and services today?",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll window to latest bubble
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessageSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: textToSend,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantMessageId = `${Date.now()}-assistant`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };

    // Pre-insert an empty message bubble for streaming content
    setMessages((prev) => [...prev, assistantPlaceholder]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to assistant stream");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) {
        throw new Error("Stream reader not available");
      }

      let done = false;
      let accumulatedText = "";

      // Stream loop: Read chunks from stream and append to the UI progressively
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkText = decoder.decode(value);
          accumulatedText += chunkText;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId ? { ...m, content: accumulatedText } : m
            )
          );
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: "Sorry, I encountered a connection issue. Please try again." }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleMessageSubmit(input);
  };

  // Derived only — not new state, computed fresh each render.
  const hasUserSent = messages.some((m) => m.role === "user");
  const welcomeText = messages[0]?.content ?? "";

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Logo mark — swap for <img src="/logo.svg" .../> when a brand asset exists */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <SparkleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                AI Business Assistant
              </h1>
              <p className="truncate text-xs text-slate-500">
                Responses grounded in verified company documents
              </p>
            </div>
          </div>

          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>
      </header>

      {/* Transcript / hero */}
      <main role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
          {!hasUserSent ? (
            /* ---------------- Empty state ---------------- */
            <div className="flex min-h-[55dvh] flex-col items-center justify-center px-2 py-10 text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <SparkleIcon className="h-6 w-6" />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base">
                {welcomeText}
              </p>

              <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleMessageSubmit(question)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ---------------- Active transcript ---------------- */
            messages.map((m, idx) => {
              const isLast = idx === messages.length - 1;
              const isStreaming = loading && isLast && m.role === "assistant" && m.content !== "";

              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex items-start justify-end gap-3">
                    <div className="flex max-w-[85%] flex-col items-end gap-1 sm:max-w-[75%]">
                      <div className="whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm leading-relaxed text-white">
                        {m.content}
                      </div>
                      <span className="px-1 text-[11px] text-slate-400">{formatTime(m.createdAt)}</span>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <SparkleIcon className="h-4 w-4" />
                  </div>
                  <div className="flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]">
                    <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-slate-100 bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-800">
                      {m.content === "" ? (
                        <span className="flex items-center gap-1 py-1.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.2s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.4s]" />
                        </span>
                      ) : (
                        <>
                          {m.content}
                          {isStreaming && (
                            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse align-middle bg-indigo-400" />
                          )}
                        </>
                      )}
                    </div>
                    {m.content !== "" && (
                      <span className="px-1 text-[11px] text-slate-400">{formatTime(m.createdAt)}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Composer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleFormSubmit}
            className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white py-1.5 pl-4 pr-1.5 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Type your message here..."
              aria-label="Message"
              className="flex-1 bg-transparent py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            AI responses may be inaccurate. Verify important information.
          </p>
        </div>
      </footer>
    </div>
  );
}