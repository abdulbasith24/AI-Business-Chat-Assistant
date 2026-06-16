"use client";

import React, { useEffect, useState } from "react";

interface Document {
  id: string;
  title: string;
  fileType: string;
  createdAt: string;
}

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
  const handleUploadSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
        // Wait, note the URL! Next.js routing should call the corrected peer api folder
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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
        <p className="text-sm text-slate-500">Upload and manage PDF, TXT, or MD documents containing company context.</p>
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

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Upload New Document</h2>
        <form onSubmit={handleUploadSubmit} className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              id="file-input"
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">Accepts PDF, TXT, or MD (Max size 10MB)</p>
          </div>
          <button
            type="submit"
            disabled={uploading || !file}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-100 disabled:text-indigo-400 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>

      {/* Document Inventory List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Uploaded Documents</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400 animate-pulse">
            Loading document inventory...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No documents in your knowledge base yet. Upload a file above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Uploaded At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-xs">
                      {doc.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 uppercase">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(doc.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/50 px-3 py-1.5 rounded-md transition"
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