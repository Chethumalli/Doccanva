"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eye, Sparkles, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export interface TemplateItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  visibility: "public" | "private";
  usageCount: number;
  previewImage?: string;
  editorContent?: Record<string, unknown>;
  ownerId?: {
    name?: string;
    image?: string;
  };
}

interface TemplateCardProps {
  template: TemplateItem;
  onPreview: (template: TemplateItem) => void;
  onRefresh?: () => void;
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

export function TemplateCard({ template, onPreview }: TemplateCardProps) {
  const router = useRouter();
  const [isUsing, setIsUsing] = useState(false);

  const previewSrc =
    template.previewImage ||
    CATEGORY_IMAGE_MAP[template.category] ||
    "/images/templates/proposal.jpg";

  const handleUseTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsUsing(true);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template._id,
        }),
      });

      if (!res.ok) throw new Error("Failed to clone document from template");
      const data = await res.json();
      toast.success(`Created new document from "${template.title}"`);
      router.push(`/editor/${data.document._id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error using template");
    } finally {
      setIsUsing(false);
    }
  };

  return (
    <div
      onClick={() => onPreview(template)}
      className="group cursor-pointer flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1"
    >
      <div>
        {/* Category Badge & Usage */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="rounded-full bg-cyan-500/10 px-3 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
            {template.category}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {template.usageCount || 0} uses
          </span>
        </div>

        {/* Photorealistic Template Preview Thumbnail */}
        <div className="relative mb-3.5 flex h-48 w-full items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner group-hover:border-cyan-500/30 transition">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={template.title}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback to proposal image if not found
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("proposal.jpg")) {
                target.src = "/images/templates/proposal.jpg";
              }
            }}
          />

          {/* Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition" />

          {/* Hover Action Badge */}
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-xs font-bold text-slate-900 shadow-xl backdrop-blur transform -translate-y-1 group-hover:translate-y-0 transition">
              <Eye className="h-3.5 w-3.5 text-cyan-600" />
              <span>Click to Preview</span>
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="px-1">
          <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 line-clamp-1 transition-colors">
            {template.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {template.description || "Pre-formatted Microsoft Word template ready to customize."}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium text-slate-500">
          By {template.ownerId?.name || "DocuCanvas Studio"}
        </span>

        <button
          onClick={handleUseTemplate}
          disabled={isUsing}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
          <span>{isUsing ? "Creating..." : "Use Template"}</span>
        </button>
      </div>
    </div>
  );
}
