import React from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Dashboard Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight text-indigo-600">
            Assistant Admin
          </h2>
          <p className="text-xs text-slate-500">Single-Company Management</p>
        </div>
        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700"
          >
            Company Profile
          </Link>
          <Link
            href="/admin/knowledge"
            className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Knowledge Base
          </Link>
          <Link
            href="/admin/faqs"
            className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            FAQ Manager
          </Link>
          <Link
            href="/admin/test-chat"
            className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Test Chat
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}