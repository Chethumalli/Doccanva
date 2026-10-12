"use client";

import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { X, Bookmark, Globe, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/useEditorStore";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

export function SaveTemplateModal({ isOpen, onClose, editor }: SaveTemplateModalProps) {
  const { title } = useEditorStore();
  const [templateTitle, setTemplateTitle] = useState(title || "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Business Proposals");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: templateTitle.trim() || "Untitled Template",
          description: description.trim(),
          category,
          visibility,
          editorContent: editor.getJSON(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template");

      toast.success(
        `Template "${templateTitle}" saved ${
          visibility === "public" ? "and published to Gallery" : "as Private"
        }!`
      );
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving template");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Save as Reusable Template</h2>
              <p className="text-xs text-slate-500">Publish to the gallery or keep in your private collection</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSaveTemplate} className="my-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Template Title
            </label>
            <input
              type="text"
              required
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain who this template is for and what sections it contains..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-700 outline-none"
              >
                <option value="Resume and CV">Resume and CV</option>
                <option value="Business Proposals">Business Proposals</option>
                <option value="Invoices">Invoices</option>
                <option value="Reports">Reports</option>
                <option value="Letters">Letters</option>
                <option value="Academic Assignments">Academic Assignments</option>
                <option value="Meeting Notes">Meeting Notes</option>
                <option value="Contracts and Agreements">Contracts & Agreements</option>
                <option value="Marketing Documents">Marketing Documents</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-700 outline-none"
              >
                <option value="public">Public (Show in Gallery)</option>
                <option value="private">Private (Only Me)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />}
              {isLoading ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
