"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  X,
  FilePlus,
  Briefcase,
  FileCheck,
  Receipt,
  BarChart3,
  Mail,
  Cpu,
  ShieldAlert,
  Megaphone,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_TEMPLATES } from "@/lib/templates/defaultTemplates";

interface CreateDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDocModal({ isOpen, onClose }: CreateDocModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docTitle, setDocTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const quickStarters = [
    {
      title: "Blank Document",
      desc: "Start with an empty clean page",
      icon: FilePlus,
      color: "bg-slate-800 text-slate-300 border-slate-700",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Untitled Document" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Start writing your document here..." }],
          },
        ],
      },
    },
    {
      title: "Executive Business Proposal",
      desc: "Proposal structure with objectives and budget",
      icon: Briefcase,
      color: "bg-cyan-950 text-cyan-400 border-cyan-800",
      content: DEFAULT_TEMPLATES[1].editorContent,
    },
    {
      title: "Modern Professional Resume",
      desc: "ATS-optimized curriculum vitae template",
      icon: FileCheck,
      color: "bg-indigo-950 text-indigo-400 border-indigo-800",
      content: DEFAULT_TEMPLATES[0].editorContent,
    },
    {
      title: "Commercial Invoice",
      desc: "Line items, tax calculation, and bank terms",
      icon: Receipt,
      color: "bg-purple-950 text-purple-400 border-purple-800",
      content: DEFAULT_TEMPLATES[2].editorContent,
    },
    {
      title: "Quarterly Performance Report",
      desc: "Executive KPIs, operations, and financial highlights",
      icon: BarChart3,
      color: "bg-blue-950 text-blue-400 border-blue-800",
      content: DEFAULT_TEMPLATES[3].editorContent,
    },
    {
      title: "Executive Offer Letter",
      desc: "Formal corporate employment package letter",
      icon: Mail,
      color: "bg-amber-950 text-amber-400 border-amber-800",
      content: DEFAULT_TEMPLATES[4].editorContent,
    },
    {
      title: "Technical Architecture Spec",
      desc: "System design, microservices, and API specs",
      icon: Cpu,
      color: "bg-sky-950 text-sky-400 border-sky-800",
      content: DEFAULT_TEMPLATES[7].editorContent,
    },
    {
      title: "Mutual NDA Agreement",
      desc: "Non-disclosure agreement and trade secret terms",
      icon: ShieldAlert,
      color: "bg-rose-950 text-rose-400 border-rose-800",
      content: DEFAULT_TEMPLATES[8].editorContent,
    },
  ];

  const handleCreateStarter = async (title: string, content?: Record<string, unknown>) => {
    try {
      setIsCreating(true);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle.trim() || title,
          editorContent: content,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create document");
      }

      const data = await res.json();
      toast.success("Document created successfully");
      onClose();
      router.push(`/editor/${data.document._id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error creating document");
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".docx")) {
      toast.error("Only Microsoft Word (.docx) files are supported");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("createDoc", "true");

      const res = await fetch("/api/documents/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to import DOCX file");
      }

      const data = await res.json();
      toast.success(`Imported "${file.name}" successfully`);
      onClose();
      router.push(`/editor/${data.document._id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="flex flex-col max-h-[92vh] w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/80 overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 p-6 pb-4 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Create New Document</h2>
              <p className="text-xs text-slate-400">
                Start from a blank canvas, import a .docx file, or choose from curated templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Document Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 Strategy Report, Acme Consulting Proposal"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
            />
          </div>

          {/* Quick Starters Grid */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Choose a Starter Template
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {quickStarters.map((starter) => {
                const Icon = starter.icon;
                return (
                  <button
                    key={starter.title}
                    onClick={() => handleCreateStarter(starter.title, starter.content)}
                    disabled={isCreating}
                    className="flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-3 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-900 hover:shadow-md hover:shadow-cyan-500/5 active:scale-95 group"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${starter.color} group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {starter.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{starter.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* DOCX Import Area */}
        <div className="border-t border-slate-800/80 p-4 bg-slate-950">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/50 p-3 text-xs font-bold text-slate-300 transition hover:border-cyan-500/60 hover:text-cyan-300 hover:bg-slate-900/80"
          >
            <Upload className="h-4 w-4 text-cyan-400" />
            <span>
              {isUploading ? "Importing Word Document..." : "Import existing Microsoft Word (.docx) file"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
