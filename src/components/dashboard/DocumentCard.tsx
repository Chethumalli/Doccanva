"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  MoreVertical,
  Copy,
  Trash2,
  Download,
  Clock,
  RotateCcw,
  Edit2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export interface DocumentItem {
  _id: string;
  title: string;
  visibility: "private" | "public";
  updatedAt: string;
  createdAt: string;
  deletedAt?: string | null;
  wordCount?: number;
  characterCount?: number;
  ownerId?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

interface DocumentCardProps {
  document: DocumentItem;
  onRefresh: () => void;
  isTrashView?: boolean;
}

export function DocumentCard({ document, onRefresh, isTrashView }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(document.title);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/documents/${document._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!res.ok) throw new Error("Failed to rename document");
      toast.success("Document renamed");
      setIsRenaming(false);
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error renaming document");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/documents/${document._id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to duplicate document");
      toast.success("Document duplicated");
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error duplicating document");
    } finally {
      setIsActionLoading(false);
      setShowMenu(false);
    }
  };

  const handleTrash = async () => {
    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/documents/${document._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete document");
      toast.success("Document moved to trash");
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error trashing document");
    } finally {
      setIsActionLoading(false);
      setShowMenu(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/documents/${document._id}/restore`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to restore document");
      toast.success("Document restored");
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error restoring document");
    } finally {
      setIsActionLoading(false);
      setShowMenu(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this document? This action cannot be undone.")) {
      return;
    }
    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/documents/${document._id}?permanent=true`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete document permanently");
      toast.success("Document permanently deleted");
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error deleting document");
    } finally {
      setIsActionLoading(false);
      setShowMenu(false);
    }
  };

  const handleDownloadDocx = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/api/documents/${document._id}/export`, "_blank");
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/90 p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10 hover:-translate-y-1">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner group-hover:scale-105 transition">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            {isRenaming ? (
              <form onSubmit={handleRename} className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-xl border border-cyan-400 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <Link
                href={isTrashView ? "#" : `/editor/${document._id}`}
                className="font-bold text-sm text-white hover:text-cyan-300 line-clamp-1 transition-colors"
              >
                {document.title}
              </Link>
            )}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{formatRelativeTime(document.updatedAt)}</span>
              {document.wordCount !== undefined && document.wordCount > 0 && (
                <>
                  <span>•</span>
                  <span>{document.wordCount} words</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-44 rounded-2xl border border-slate-800 bg-slate-950 p-1.5 shadow-2xl z-30 animate-in fade-in zoom-in-95"
              onClick={() => setShowMenu(false)}
            >
              {!isTrashView ? (
                <>
                  <button
                    onClick={() => setIsRenaming(true)}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Rename
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={handleDownloadDocx}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-400" />
                    Download DOCX
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    onClick={handleTrash}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Move to Trash
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRestore}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={handlePermanentDelete}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Forever
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-800/80">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
            document.visibility === "public"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-slate-800 text-slate-400 border border-slate-700/50"
          }`}
        >
          {document.visibility === "public" ? "Public" : "Private"}
        </span>

        {!isTrashView ? (
          <Link
            href={`/editor/${document._id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>Open in Editor</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <button
            onClick={handleRestore}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            Restore
          </button>
        )}
      </div>
    </div>
  );
}
