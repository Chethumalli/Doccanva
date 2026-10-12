"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { AIModal } from "@/components/editor/AIModal";
import { ShareModal } from "@/components/editor/ShareModal";
import { ExportPreviewModal } from "@/components/editor/ExportPreviewModal";
import { VersionHistoryModal } from "@/components/editor/VersionHistoryModal";
import { SaveTemplateModal } from "@/components/editor/SaveTemplateModal";
import { useEditorStore } from "@/stores/useEditorStore";
import { Loader2, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

function EditorContentWrapper({ params }: EditorPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const { initDocument, title, canEdit, setSaveStatus } = useEditorStore();

  const [editorInstance, setEditorInstance] = useState<any>(null);
  const handleEditorReady = React.useCallback((editor: any) => {
    setEditorInstance(editor);
  }, []);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modals state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);

  // Seamless access: allows viewing and editing in all sessions without blocking redirect

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      setIsLoadingDoc(true);
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load document");
      }

      const data = await res.json();
      initDocument({
        id: data.document._id,
        title: data.document.title,
        editorContent: data.document.editorContent,
        canEdit: Boolean(data.canEdit),
        visibility: data.document.visibility,
        currentVersion: data.document.currentVersion || 1,
        wordCount: data.document.wordCount,
        characterCount: data.document.characterCount,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading document";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleManualSave = async () => {
    if (!editorInstance || !canEdit) return;

    try {
      setSaveStatus("saving");
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editorContent: editorInstance.getJSON(),
          title,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("saved");
      toast.success("Document saved successfully");
    } catch (err: unknown) {
      setSaveStatus("error", err instanceof Error ? err.message : "Failed");
      toast.error("Failed to save changes");
    }
  };

  if (isLoadingDoc) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">Loading your document...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Access Restricted</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">{loadError}</p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#060b18] text-slate-100 overflow-hidden">
      {/* Top Bar with Toolbar */}
      <EditorToolbar
        editor={editorInstance}
        onOpenAI={() => setIsAIModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenVersions={() => setIsVersionsModalOpen(true)}
        onSaveAsTemplate={() => setIsSaveTemplateModalOpen(true)}
        onManualSave={handleManualSave}
      />

      {/* Main Canvas Document Area */}
      <EditorCanvas
        onEditorReady={handleEditorReady}
        documentId={id}
      />

      {/* Modals */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        editor={editorInstance}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={id}
      />

      <ExportPreviewModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        documentId={id}
      />

      <VersionHistoryModal
        isOpen={isVersionsModalOpen}
        onClose={() => setIsVersionsModalOpen(false)}
        documentId={id}
        editor={editorInstance}
      />

      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        editor={editorInstance}
      />
    </div>
  );
}

export default function EditorPage(props: EditorPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-500">Loading editor workspace...</p>
        </div>
      }
    >
      <EditorContentWrapper {...props} />
    </React.Suspense>
  );
}
