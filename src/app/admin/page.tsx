"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  companyConfigured: boolean;
  companyName: string;
  documentsCount: number;
  chunksCount: number;
  faqsCount: number;
  dbStatus: "Healthy" | "Disconnected";
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500 animate-pulse">Assembling system overview...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
        <p className="text-sm text-slate-500">Live monitoring metrics for your grounded business chatbot instance.</p>
      </div>

      {/* Database Connection Banner */}
      <div className="mb-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className={`flex h-4 w-4 rounded-full animate-pulse ${
            stats?.dbStatus === "Healthy" ? "bg-emerald-500" : "bg-rose-500"
          }`}></span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Database Connection Status</h3>
            <p className="text-xs text-slate-500 font-medium">Synced with Neon Serverless Cloud Host</p>
          </div>
        </div>
        <span className="text-xs font-semibold uppercase text-slate-400">
          {stats?.dbStatus === "Healthy" ? "ACTIVE" : "OFFLINE"}
        </span>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        
        {/* Company Settings card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Status</h4>
          <p className="text-xl font-extrabold text-slate-900 truncate">
            {stats?.companyConfigured ? stats.companyName : "Unconfigured"}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {stats?.companyConfigured ? "Profile loaded successfully" : "Create profile to ground answers"}
          </p>
          <Link href="/admin/company" className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-4">
            Manage Profile →
          </Link>
        </div>

        {/* Knowledge Base stats */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Knowledge Inventory</h4>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats?.documentsCount} <span className="text-sm font-semibold text-slate-400">Files</span>
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Representing <span className="font-bold text-indigo-600">{stats?.chunksCount}</span> searchable vector chunks
          </p>
          <Link href="/admin/knowledge" className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-4">
            Manage Documents →
          </Link>
        </div>

        {/* FAQ counters */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preconfigured FAQs</h4>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats?.faqsCount} <span className="text-sm font-semibold text-slate-400">Entries</span>
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Bypassing AI APIs instantly for fast responses
          </p>
          <Link href="/admin/faqs" className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-4">
            Manage FAQs →
          </Link>
        </div>

      </div>

      {/* Guide Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-xl p-8 shadow-sm">
        <h3 className="text-md font-bold text-indigo-900 mb-2">Getting Started with Grounded RAG</h3>
        <p className="text-sm text-indigo-800/80 leading-relaxed max-w-2xl mb-4">
          To provide highly accurate answers to visitors, ensure you configure your **Company Profile** first. Then upload relevant documents (such as pricing packages, product specs, or terms of service) inside the **Knowledge Base** tab to generate matching vector coordinates.
        </p>
        <Link href="/admin/test-chat" className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition">
          Test Grounded Queries →
        </Link>
      </div>

    </div>
  );
}