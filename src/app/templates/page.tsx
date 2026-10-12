"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TemplateCard, TemplateItem } from "@/components/templates/TemplateCard";
import { TemplatePreviewModal } from "@/components/templates/TemplatePreviewModal";
import { CreateDocModal } from "@/components/dashboard/CreateDocModal";
import {
  LayoutGrid,
  Search,
  Sparkles,
  Loader2,
  FolderOpen,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Resume and CV",
  "Business Proposals",
  "Invoices",
  "Reports",
  "Letters",
  "Academic Assignments",
  "Meeting Notes",
  "Project Documentation",
  "Legal Agreements",
];

export default function TemplatesGalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState<TemplateItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, search]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const url = `/api/templates/public?category=${encodeURIComponent(
        selectedCategory
      )}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar onOpenCreate={() => setIsCreateOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-3xl border border-cyan-500/25 bg-slate-950 p-8 md:p-12 text-white shadow-2xl overflow-hidden">
          {/* Subtle Ambient Background Art */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-banner.jpg"
              alt="Gallery Background"
              className="h-full w-full object-cover object-center opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060b18] via-[#060b18]/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-bold text-cyan-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span>DocuCanvas Community & Studio Showcase</span>
            </span>
            <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight text-white">
              Word Template Gallery
            </h1>
            <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
              Explore professionally designed Microsoft Word templates. Duplicate with one click, edit with our Canva-like canvas, and export to DOCX.
            </p>

            {/* Search Bar */}
            <div className="mt-6 flex max-w-md items-center rounded-2xl border border-slate-700 bg-slate-900/90 p-1.5 shadow-xl backdrop-blur group focus-within:border-cyan-400">
              <Search className="ml-3 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition" />
              <input
                type="text"
                placeholder="Search templates by keyword or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-cyan-400/40"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div>
          {isLoading && templates.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 p-16 text-center">
              <FolderOpen className="h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-300">No Templates Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                No templates matched the category &ldquo;{selectedCategory}&rdquo;. Try another category or clear your search query.
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-150 ${
                isLoading ? "opacity-60" : "opacity-100"
              }`}
            >
              {templates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onPreview={(tpl) => setSelectedPreview(tpl)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <TemplatePreviewModal
        template={selectedPreview}
        onClose={() => setSelectedPreview(null)}
      />

      <CreateDocModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
