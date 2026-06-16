"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "Who is Basith?",
  "What are your business hours?",
  "Where are you located?",
];

export default function PublicChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! Welcome to our website. How can I assist you with our business and services today?",
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
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantMessageId = `${Date.now()}-assistant`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
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

  const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleMessageSubmit(input);
  };

  return (
    <div className="flex h-screen bg-slate-50 flex-col items-center justify-between p-4 md:p-6">
      {/* Header Panel */}
      <header className="w-full max-w-3xl bg-white border border-slate-200 shadow-sm rounded-xl px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-md font-bold text-slate-900 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            AI Business Assistant
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">Responses grounded in verified company documents</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">Live Web Assistant</span>
      </header>

      {/* Main Messages Body */}
      <div className="flex-1 w-full max-w-3xl overflow-y-auto my-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-100"
              }`}
            >
              {m.content === "" ? (
                <span className="flex gap-1 py-1.5 items-center">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Tray (Suggestions and Input form) */}
      <div className="w-full max-w-3xl space-y-4">
        {/* Chips */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                onClick={() => handleMessageSubmit(question)}
                className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100 transition font-semibold text-slate-600 px-4 py-2 rounded-full border border-slate-200 shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your message here..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}