"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Lock,
  Loader2,
  Check,
  Eye,
  Edit3,
} from "lucide-react";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { useEditorStore } from "@/stores/useEditorStore";
import { toast } from "sonner";

interface SharedPageProps {
  params: Promise<{ token: string }>;
}

function SharedContentWrapper({ params }: SharedPageProps) {
  const { token } = use(params);
  const { initDocument, title } = useEditorStore();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [docData, setDocData] = useState<any>(null);
  const [permission, setPermission] = useState<"viewer" | "editor">("viewer");
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    loadSharedDocument();
  }, [token]);

  const loadSharedDocument = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/shared/${token}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid or expired share link");
      }

      const data = await res.json();
      setDocData(data.document);
      setPermission(data.permission);

      initDocument({
        id: data.document._id,
        title: data.document.title,
        editorContent: data.document.editorContent,
        canEdit: data.permission === "editor",
        visibility: data.document.visibility,
        currentVersion: data.document.currentVersion || 1,
        wordCount: data.document.wordCount,
        characterCount: data.document.characterCount,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error accessing shared document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocx = () => {
    if (!docData) return;
    window.open(`/api/documents/${docData._id}/export?shareToken=${token}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">Validating secure share link...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Lock className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Link Unavailable</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">{errorMsg}</p>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Sign In to DocuCanvas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100 overflow-hidden">
      {/* Top Shared Navbar */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 truncate max-w-xs">{title}</h1>
            <p className="text-[11px] text-slate-400">
              Shared by {docData.ownerId?.name || "DocuCanvas User"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              permission === "editor"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {permission === "editor" ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {permission === "editor" ? "Editor Access" : "Read-Only Viewer"}
          </span>

          <button
            onClick={handleDownloadDocx}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download DOCX</span>
          </button>
        </div>
      </header>

      {/* Canvas */}
      <EditorCanvas
        onEditorReady={(editor) => setEditorInstance(editor)}
        documentId={docData._id}
      />
    </div>
  );
}

export default function SharedDocumentPage(props: SharedPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-500">Loading shared document...</p>
        </div>
      }
    >
      <SharedContentWrapper {...props} />
    </React.Suspense>
  );
}
