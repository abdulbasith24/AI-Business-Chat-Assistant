"use client";

import React, { useEffect, useState } from "react";

interface Document {
  id: string;
  title: string;
  fileType: string;
  createdAt: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/admin/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err: unknown) {
      console.error("Error loading documents:", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle file select change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  // Handle document submission
  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setMessage({ type: "success", text: `${file.name} uploaded successfully.` });
      setFile(null);
      // Reset input element visually
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      // Refresh documents inventory list
      fetchDocuments();
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: "error", text: (err as Error).message || "An error occurred during file upload." });
    } finally {
      setUploading(false);
    }
  };

  // Delete a document
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response  = await fetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete document");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setMessage({ type: "success", text: `Document "${title}" removed successfully.` });
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error deleting document." });
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* ── Page Heading ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Knowledge Base
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload and manage PDF, TXT, or MD documents containing company context.
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

      {/* ── Upload Zone Card ──────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <UploadIcon className="w-4 h-4 text-slate-500" />
          Upload New Document
        </h2>
        
        <form onSubmit={handleUploadSubmit} className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1">
            <input
              id="file-input"
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Accepts PDF, TXT, or MD (Max size 10MB)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={uploading || !file}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>

      {/* ── Document Inventory Card ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Uploaded Documents
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-500 animate-pulse">
            Loading document inventory...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No documents in your knowledge base yet. Upload a file above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Title</th>
                  <th className="px-6 py-3.5 font-medium">Type</th>
                  <th className="px-6 py-3.5 font-medium">Uploaded At</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                      <div className="flex items-center gap-2.5">
                        <DocumentIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 uppercase">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(doc.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors focus:outline-none"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}