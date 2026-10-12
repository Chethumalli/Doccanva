"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { DocumentCard, DocumentItem } from "@/components/dashboard/DocumentCard";
import { DocumentTable } from "@/components/dashboard/DocumentTable";
import { CreateDocModal } from "@/components/dashboard/CreateDocModal";
import { TemplateCard, TemplateItem } from "@/components/templates/TemplateCard";
import { TemplatePreviewModal } from "@/components/templates/TemplatePreviewModal";
import { useDashboardStore } from "@/stores/useDashboardStore";
import {
  FileText,
  Plus,
  Loader2,
  FolderOpen,
  Sparkles,
  LayoutGrid,
  FileCheck,
  Receipt,
  FileSpreadsheet,
  Mail,
  ShieldAlert,
  ArrowRight,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { activeSection, layout, searchQuery, sortBy, setActiveSection } = useDashboardStore();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<TemplateItem | null>(null);

  useEffect(() => {
    loadData();
    // Load featured templates for quick showcase dock
    fetch("/api/templates/public")
      .then((res) => res.json())
      .then((data) => setFeaturedTemplates(data.templates?.slice(0, 4) || []))
      .catch(() => {});
  }, [status, activeSection, sortBy, searchQuery]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      if (activeSection === "my-templates" || activeSection === "public-templates") {
        const endpoint =
          activeSection === "public-templates"
            ? `/api/templates/public?search=${encodeURIComponent(searchQuery)}`
            : `/api/templates/mine`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
        }
      } else {
        const view = activeSection === "trash" ? "trash" : "active";
        const res = await fetch(
          `/api/documents?view=${view}&sort=${sortBy}&search=${encodeURIComponent(
            searchQuery
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      }
    } catch {
      toast.error("Failed to load workspace data");
    } finally {
      setIsLoading(false);
    }
  };

  const isTemplateSection =
    activeSection === "my-templates" || activeSection === "public-templates";

  const categoryDocks = [
    { label: "Docs", icon: FileText, category: "All", color: "from-blue-600 to-cyan-500" },
    { label: "Resume & CV", icon: FileCheck, category: "Resume and CV", color: "from-indigo-600 to-violet-500" },
    { label: "Proposals", icon: FileSpreadsheet, category: "Business Proposals", color: "from-cyan-600 to-blue-500" },
    { label: "Invoices", icon: Receipt, category: "Invoices", color: "from-emerald-600 to-teal-500" },
    { label: "Reports", icon: LayoutGrid, category: "Reports", color: "from-blue-600 to-indigo-600" },
    { label: "Letters", icon: Mail, category: "Letters", color: "from-violet-600 to-purple-500" },
    { label: "Legal", icon: ShieldAlert, category: "Legal Agreements", color: "from-amber-600 to-orange-500" },
  ];

  const handleDockClick = (cat: string) => {
    if (cat === "All") {
      setActiveSection("home");
    } else {
      router.push(`/templates?category=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar onOpenCreate={() => setIsCreateModalOpen(true)} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Canva AI Hero Banner */}
          {activeSection === "home" && (
            <div className="relative mb-8 rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-950/20 bg-slate-950">
              {/* Background Art */}
              <div className="absolute inset-0 z-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero-banner.jpg"
                  alt="DocuCanvas Hero Art"
                  className="h-full w-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060b18] via-[#060b18]/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060b18] via-transparent to-transparent" />
              </div>

              {/* Banner Content */}
              <div className="relative z-10 p-7 md:p-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300 backdrop-blur-md shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
                  <span>Powered by Gemini AI</span>
                </div>

                <h1 className="mt-3 text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
                  Documents, Instantly. <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                    Exported to Word (.docx)
                  </span>
                </h1>

                <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed max-w-lg">
                  Welcome back, <strong className="text-white">{session?.user?.name || "Chethan"}</strong>. Create executive Microsoft Word templates, draft contracts with AI, and publish to the community.
                </p>

                {/* Canva Quick Action Pills */}
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:opacity-95 active:scale-95 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Blank Document</span>
                  </button>

                  <button
                    onClick={() => router.push("/templates?category=Resume%20and%20CV")}
                    className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 backdrop-blur hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 active:scale-95 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Synthesize Resume</span>
                  </button>

                  <button
                    onClick={() => router.push("/templates")}
                    className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 backdrop-blur hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 active:scale-95 transition"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Explore All Templates</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Canva Category Dock */}
          {activeSection === "home" && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  What will you design today?
                </span>
                <button
                  onClick={() => router.push("/templates")}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition"
                >
                  <span>See all</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {categoryDocks.map((dock) => {
                  const Icon = dock.icon;
                  return (
                    <button
                      key={dock.label}
                      onClick={() => handleDockClick(dock.category)}
                      className="group flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/70 hover:bg-slate-900 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-200 active:scale-95"
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr ${dock.color} text-white shadow-md shadow-black/40 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="mt-2.5 text-[11px] font-bold text-slate-300 group-hover:text-cyan-300 transition-colors text-center line-clamp-1">
                        {dock.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Templates Row (if on Home) */}
          {activeSection === "home" && featuredTemplates.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <h2 className="text-lg font-black text-white">Popular Word Templates</h2>
                  <p className="text-xs text-slate-400">Ready-made Microsoft Word documents with instant export</p>
                </div>
                <button
                  onClick={() => router.push("/templates")}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition"
                >
                  <span>Explore Gallery</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredTemplates.map((tpl) => (
                  <TemplateCard
                    key={tpl._id}
                    template={tpl}
                    onPreview={(t) => setSelectedPreviewTemplate(t)}
                    onRefresh={loadData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-white capitalize">
                {activeSection === "home"
                  ? "Recent Documents"
                  : activeSection.replace("-", " ")}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTemplateSection
                  ? `${templates.length} templates available`
                  : `${documents.length} documents in this view`}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar />

          {/* Content Listing */}
          <div className="mt-6">
            {isLoading && (isTemplateSection ? templates.length === 0 : documents.length === 0) ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : isTemplateSection ? (
              templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
                  <FolderOpen className="h-12 w-12 text-slate-600 mb-3" />
                  <h3 className="text-sm font-bold text-slate-300">No Templates Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {activeSection === "my-templates"
                      ? "You haven't saved any custom templates yet. Open an existing document and click 'Save Template'."
                      : "No public templates match your current filter."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {templates.map((tpl) => (
                    <TemplateCard
                      key={tpl._id}
                      template={tpl}
                      onPreview={(t) => setSelectedPreviewTemplate(t)}
                      onRefresh={loadData}
                    />
                  ))}
                </div>
              )
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
                <FolderOpen className="h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-300">
                  {activeSection === "trash" ? "Trash is Empty" : "No Documents Found"}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {activeSection === "trash"
                    ? "Deleted documents will appear here before permanent removal."
                    : "Get started by creating your first document or customizing a template."}
                </p>
                {activeSection !== "trash" && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-5 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Document</span>
                  </button>
                )}
              </div>
            ) : layout === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onRefresh={loadData}
                    isTrashView={activeSection === "trash"}
                  />
                ))}
              </div>
            ) : (
              <DocumentTable
                documents={documents}
                onRefresh={loadData}
                isTrashView={activeSection === "trash"}
              />
            )}
          </div>
        </main>
      </div>

      <CreateDocModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <TemplatePreviewModal
        template={selectedPreviewTemplate}
        onClose={() => setSelectedPreviewTemplate(null)}
      />
    </div>
  );
}
