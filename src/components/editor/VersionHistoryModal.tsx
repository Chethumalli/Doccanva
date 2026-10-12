"use client";

import React, { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { X, History, RotateCcw, Clock, User, Check, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

interface VersionItem {
  _id: string;
  versionNumber: number;
  description: string;
  editorContent: Record<string, unknown>;
  createdAt: string;
  createdBy?: {
    name?: string;
    email?: string;
  };
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  editor: Editor | null;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  documentId,
  editor,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, documentId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/documents/${documentId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
        if (data.versions?.length > 0) {
          setSelectedVersion(data.versions[0]);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleRestore = () => {
    if (!editor || !selectedVersion) return;
    editor.commands.setContent(selectedVersion.editorContent);
    toast.success(`Restored to Version ${selectedVersion.versionNumber}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col h-[85vh] w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Version History</h2>
              <p className="text-xs text-slate-500">Restore or review previous automatic and manual checkpoints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Left sidebar version list, Right preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left list */}
          <div className="w-1/3 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              </div>
            ) : versions.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 text-center">
                No past snapshots saved yet. Changes are recorded periodically.
              </p>
            ) : (
              versions.map((v) => {
                const isSelected = selectedVersion?._id === v._id;
                return (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVersion(v)}
                    className={`flex flex-col w-full text-left rounded-xl p-3 text-xs transition border ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/80 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold text-slate-800">
                      Version {v.versionNumber}
                    </span>
                    <span className="text-slate-500 text-[11px] mt-0.5 truncate">
                      {v.description || "Snapshot"}
                    </span>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(v.createdAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right preview details */}
          <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
            {selectedVersion ? (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Version {selectedVersion.versionNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Created by {selectedVersion.createdBy?.name || "User"} •{" "}
                      {formatRelativeTime(selectedVersion.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 min-h-[220px]">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Snapshot payload preserved with complete formatting, headings, and structure.
                  </p>
                  <p className="text-xs text-indigo-700 mt-3 font-semibold">
                    Description: {selectedVersion.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-400 text-xs">
                Select a version from the left panel to review.
              </div>
            )}

            {selectedVersion && (
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleRestore}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore this Version
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
