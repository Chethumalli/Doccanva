"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { Image } from "@tiptap/extension-image";
import { useEditorStore } from "@/stores/useEditorStore";
import { toast } from "sonner";

interface EditorCanvasProps {
  onEditorReady: (editor: any) => void;
  documentId: string;
}

export function EditorCanvas({ onEditorReady, documentId }: EditorCanvasProps) {
  // Select only needed stable state and actions to prevent unnecessary re-renders
  const canEdit = useEditorStore((s) => s.canEdit);
  const setCounts = useEditorStore((s) => s.setCounts);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveAbortControllerRef = useRef<AbortController | null>(null);
  const activeVersionRef = useRef<number>(0);
  const onEditorReadyRef = useRef(onEditorReady);
  onEditorReadyRef.current = onEditorReady;

  // Retrieve initial document JSON content once without subscribing to subsequent updates
  const initialContent = useEditorStore.getState().editorJson;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 underline cursor-pointer",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: initialContent || {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Untitled Document" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Start creating your professional Word document here...",
            },
          ],
        },
      ],
    },
    editable: canEdit,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!useEditorStore.getState().canEdit) return;

      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;

      // Update word counts smoothly
      setCounts(words, chars);

      // Trigger debounced autosave (1200ms)
      triggerDebouncedAutosave(editor.getJSON(), words, chars);
    },
  });

  // Notify parent of editor instance safely once
  useEffect(() => {
    if (editor) {
      onEditorReadyRef.current(editor);
    }
  }, [editor]);

  // Keep editor editable state in sync
  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit);
    }
  }, [canEdit, editor]);

  // Debounced Autosave function
  const triggerDebouncedAutosave = (
    json: Record<string, unknown>,
    words: number,
    chars: number
  ) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");

        if (saveAbortControllerRef.current) {
          saveAbortControllerRef.current.abort();
        }
        saveAbortControllerRef.current = new AbortController();

        activeVersionRef.current += 1;
        const currentReqVersion = activeVersionRef.current;
        const currentTitle = useEditorStore.getState().title;

        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          signal: saveAbortControllerRef.current.signal,
          body: JSON.stringify({
            editorContent: json,
            title: currentTitle,
            wordCount: words,
            characterCount: chars,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Save failed");
        }

        if (currentReqVersion === activeVersionRef.current) {
          setSaveStatus("saved");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        const errorMsg = err instanceof Error ? err.message : "Failed to save";
        setSaveStatus("error", errorMsg);
      }
    }, 1200);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#070b18] p-4 sm:p-8">
      {/* Standard Word Canvas Paper Page */}
      <div className="doc-page-canvas shadow-2xl shadow-black/60">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
