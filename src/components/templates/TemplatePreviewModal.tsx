"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Copy, Sparkles, Check, ArrowRight } from "lucide-react";
import { TemplateItem } from "./TemplateCard";
import { toast } from "sonner";

interface TemplatePreviewModalProps {
  template: TemplateItem | null;
  onClose: () => void;
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "Resume and CV": "/images/templates/resume.jpg",
  "Business Proposals": "/images/templates/proposal.jpg",
  "Invoices": "/images/templates/invoice.jpg",
  "Reports": "/images/templates/report.jpg",
  "Letters": "/images/templates/letter.jpg",
  "Academic Assignments": "/images/templates/report.jpg",
  "Meeting Notes": "/images/templates/proposal.jpg",
  "Project Documentation": "/images/templates/spec.jpg",
  "Newsletters": "/images/templates/letter.jpg",
  "Legal Agreements": "/images/templates/nda.jpg",
};

export function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
  const router = useRouter();
  const [isCopying, setIsCopying] = useState(false);

  if (!template) return null;

  const previewSrc =
    template.previewImage ||
    CATEGORY_IMAGE_MAP[template.category] ||
    "/images/templates/proposal.jpg";

  const handleUseTemplate = async () => {
    try {
      setIsCopying(true);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template._id,
        }),
      });

      if (!res.ok) throw new Error("Failed to clone document from template");
      const data = await res.json();
      toast.success("Created new document from template!");
      onClose();
      router.push(`/editor/${data.document._id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error cloning template");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative flex flex-col max-h-[92vh] w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-cyan-950/30 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-950/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/10 px-3 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/30">
                {template.category}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {template.usageCount || 0} times duplicated
              </span>
            </div>
            <h2 className="mt-1 text-lg font-black text-white">{template.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content: 2-Column Showcase */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Photorealistic Cover Mockup */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group max-h-[460px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={template.title}
              className="w-full h-full object-cover object-top max-h-[460px] transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Details & Action */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Template Overview
              </span>
              <h3 className="mt-1 text-2xl font-black text-white leading-tight">
                {template.title}
              </h3>
              <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
                {template.description ||
                  "Professional Microsoft Word document template layout. Pre-configured with rich text sections, headings, callout boxes, and ready for 1-click DOCX export."}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Features Included:</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 pl-1">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Native Microsoft Word (.docx) OpenXML export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>TipTap rich text with tables & callouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Gemini AI assistant to rewrite & synthesize</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={handleUseTemplate}
                disabled={isCopying}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3.5 px-6 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                <span>{isCopying ? "Cloning into Workspace..." : "Use This Template & Edit"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950 px-6 py-3.5 text-xs text-slate-500">
          <p>Created by: {template.ownerId?.name || "DocuCanvas Studio"}</p>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
