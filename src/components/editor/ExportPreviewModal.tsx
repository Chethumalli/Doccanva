"use client";

import React, { useState } from "react";
import { X, Download, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export function ExportPreviewModal({ isOpen, onClose, documentId }: ExportPreviewModalProps) {
  const { title, wordCount, characterCount } = useEditorStore();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    window.location.href = `/api/documents/${documentId}/export`;
    setTimeout(() => {
      setIsDownloading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Export as Microsoft Word (.docx)</h2>
              <p className="text-xs text-slate-500">Generate an OpenXML Word document compatible with MS Word</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Export Spec Details */}
        <div className="my-5 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Suggested Filename
            </p>
            <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
              {title}.docx
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span>{wordCount} Words</span>
              <span>•</span>
              <span>{characterCount} Characters</span>
              <span>•</span>
              <span>Standard 1-in Margins</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Headings (H1-H3), bold, italics, underlines, and strikethrough</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Tables, bullet lists, numbered lists, and paragraph alignment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Full Unicode & Indian language typography preservation</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
          >
            <Download className="h-3.5 w-3.5" />
            {isDownloading ? "Generating DOCX..." : "Download .docx File"}
          </button>
        </div>
      </div>
    </div>
  );
}
