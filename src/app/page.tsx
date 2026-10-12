"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  Sparkles,
  Download,
  Share2,
  LayoutGrid,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur md:px-12">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
            DocuCanvas
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/templates"
            className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
          >
            Template Gallery
          </Link>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition"
          >
            <span>{session ? "Open Studio" : "Sign In"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-indigo-400/15 via-violet-300/15 to-pink-300/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Next-Generation Word & Template Suite</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-tight">
              Create Microsoft Word documents with the ease of{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                Canva.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
              DocuCanvas combines a rich, Canva-inspired visual document editor with Microsoft Word (.docx) fidelity, Google Gemini AI assistance, template publishing, and team sharing.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 active:scale-95 transition"
              >
                <span>Launch Document Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/templates"
                className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition"
              >
                <LayoutGrid className="h-4 w-4 text-indigo-600" />
                <span>Browse Public Templates</span>
              </Link>
            </div>
          </div>

          {/* Interactive Document Mockup Canvas */}
          <div className="mt-16 mx-auto max-w-4xl">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-2xl shadow-indigo-950/10">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 mb-3 bg-slate-50/60 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-slate-500">
                    Annual Strategy & Proposal 2026.docx
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    Autosaved
                  </span>
                </div>
              </div>

              <div className="p-8 sm:p-12 bg-white rounded-2xl border border-slate-100 max-w-2xl mx-auto shadow-sm">
                <h2 className="text-3xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Enterprise Transformation Proposal
                </h2>
                <p className="mt-3 text-xs text-slate-400">
                  Prepared by DocuCanvas Studio • Export format: Microsoft Word (.docx)
                </p>
                <div className="mt-6 space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong>Executive Objective:</strong> Accelerate digital workflows through standardized, reusable Microsoft Word templates powered by automated OpenXML rendering.
                  </p>
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <p className="font-semibold text-indigo-950">✨ Gemini AI Prompt Output:</p>
                    <p className="mt-1 text-indigo-800">
                      Deliver high-fidelity document generation with customizable fonts, tables, alignment, and secure collaborator permissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-white border-t border-slate-200/80 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Everything you need to master Microsoft Word templates
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                Production-ready full-stack document architecture with real DOCX import/export
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/40">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Native DOCX Export & Import</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Convert TipTap rich text directly into valid OpenXML .docx files. Import existing Word files via mammoth with HTML sanitization.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/40">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-100 text-violet-600 mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Google Gemini AI Assistant</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Generate comprehensive proposals, rewrite selected passages to match your brand tone, and synthesize executive summaries on demand.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/40">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
                  <Share2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Secure Sharing & Invitations</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Generate cryptographically hashed share links, set expirations, invite team members with Nodemailer, and enforce owner-only controls.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 DocuCanvas. Production-grade Word Template & Document Suite.</p>
      </footer>
    </div>
  );
}
