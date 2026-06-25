// app/admin/page.tsx  — Redesigned Overview Dashboard
// Only UI changes — all fetch logic, state, and API calls are preserved exactly.

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

// ── Icons ─────────────────────────────────────────────────────────────────────

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 22V12h6v10" />
      <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" />
    </svg>
  );
}

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

function FaqIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-44" />
        <SkeletonBlock className="h-4 w-80" />
      </div>
      <SkeletonBlock className="h-16 w-full rounded-xl" />
      <div className="grid gap-5 sm:grid-cols-3">
        <SkeletonBlock className="h-44 rounded-xl" />
        <SkeletonBlock className="h-44 rounded-xl" />
        <SkeletonBlock className="h-44 rounded-xl" />
      </div>
      <SkeletonBlock className="h-36 w-full rounded-xl" />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  description: React.ReactNode;
  href: string;
  linkLabel: string;
}

function StatCard({ icon, label, value, description, href, linkLabel }: StatCardProps) {
  return (
    <div className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all duration-200">
          {icon}
        </div>

        {/* Label */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </p>

        {/* Value */}
        <p className="text-xl font-semibold text-slate-900 leading-none tracking-tight">
          {value}
        </p>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group/link"
        >
          {linkLabel}
          <ChevronRightIcon className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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

  if (loading) return <LoadingSkeleton />;

  const isHealthy = stats?.dbStatus === "Healthy";

  return (
    <div className="space-y-8">

      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live status and quick access to your AI assistant configuration.
        </p>
      </div>

      {/* ── DB status strip ──────────────────────────────────────────────── */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-5 py-4 ${
          isHealthy
            ? "bg-white border-slate-200"
            : "bg-rose-50 border-rose-200"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isHealthy ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-100 text-rose-600 border border-rose-200"
            }`}
          >
            <DatabaseIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Database Connection
            </p>
            <p className="text-xs text-slate-500">
              Neon Serverless PostgreSQL · pgvector enabled
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full border text-xs font-semibold ${
            isHealthy
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-100 border-rose-200 text-rose-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              isHealthy ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`}
            aria-hidden="true"
          />
          {isHealthy ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        <StatCard
          icon={<BuildingIcon className="w-4 h-4" />}
          label="Company Profile"
          value={
            stats?.companyConfigured
              ? <span className="truncate block">{stats.companyName}</span>
              : <span className="text-slate-400">Not configured</span>
          }
          description={
            stats?.companyConfigured
              ? "Your company profile is verified and active."
              : "Set up a profile to ground chatbot responses."
          }
          href="/admin/company"
          linkLabel="Edit Profile"
        />

        <StatCard
          icon={<DocumentIcon className="w-4 h-4" />}
          label="Knowledge Base"
          value={
            <span>
              {stats?.documentsCount ?? 0}
              <span className="text-sm font-normal text-slate-400 ml-1.5">
                {stats?.documentsCount === 1 ? "document" : "documents"}
              </span>
            </span>
          }
          description={
            <>
              Segmented into{" "}
              <span className="font-semibold text-slate-700">
                {stats?.chunksCount ?? 0}
              </span>{" "}
              searchable vector chunks.
            </>
          }
          href="/admin/knowledge"
          linkLabel="Manage Documents"
        />

        <StatCard
          icon={<FaqIcon className="w-4 h-4" />}
          label="FAQ Entries"
          value={
            <span>
              {stats?.faqsCount ?? 0}
              <span className="text-sm font-normal text-slate-400 ml-1.5">
                {stats?.faqsCount === 1 ? "entry" : "entries"}
              </span>
            </span>
          }
          description="Direct-match answers that bypass vector retrieval to save cost."
          href="/admin/faqs"
          linkLabel="Manage FAQs"
        />
      </div>

      {/* ── Quick actions row ────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Quick Actions
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/company",   label: "Update Company Info",    Icon: BuildingIcon  },
            { href: "/admin/knowledge", label: "Upload Documents",       Icon: DocumentIcon  },
            { href: "/admin/faqs",      label: "Add FAQ Entry",          Icon: FaqIcon       },
            { href: "/admin/test-chat", label: "Run RAG Test",           Icon: BeakerIcon    },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
              <span className="truncate">{label}</span>
              <ChevronRightIcon className="w-3.5 h-3.5 ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Getting started guide ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <LayersIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Getting Started with RAG
          </p>
        </div>
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            For accurate, grounded answers: configure your company profile first, then upload documents (PDF, TXT, MD) to build vector embeddings. Use the test chat to verify retrieval quality before going live.
          </p>
          <Link
            href="/admin/test-chat"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            <BeakerIcon className="w-3.5 h-3.5" />
            Test RAG Queries
          </Link>
        </div>
      </div>

    </div>
  );
}