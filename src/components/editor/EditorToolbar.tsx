"use client";

import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Sparkles,
  Share2,
  Download,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Bookmark,
  History,
  Trash2,
  Plus,
} from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";

interface EditorToolbarProps {
  editor: Editor | null;
  onOpenAI: () => void;
  onOpenShare: () => void;
  onOpenExport: () => void;
  onOpenVersions: () => void;
  onSaveAsTemplate: () => void;
  onManualSave: () => void;
}

export function EditorToolbar({
  editor,
  onOpenAI,
  onOpenShare,
  onOpenExport,
  onOpenVersions,
  onSaveAsTemplate,
  onManualSave,
}: EditorToolbarProps) {
  const { title, setTitle, saveStatus, saveError, wordCount, characterCount, canEdit } =
    useEditorStore();

  const [colorInput, setColorInput] = useState("#000000");
  const [highlightInput, setHighlightInput] = useState("#fef08a");
  const [showTableMenu, setShowTableMenu] = useState(false);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setShowTableMenu(false);
  };

  return (
    <div className="sticky top-0 z-30 flex flex-col border-b border-slate-800 bg-slate-950/95 backdrop-blur shadow-md text-slate-100">
      {/* Top Bar: Title, Save Status, Word Count, Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canEdit}
            placeholder="Document Title"
            className="rounded-xl border border-transparent bg-transparent px-3 py-1 text-sm md:text-base font-bold text-white transition hover:border-slate-800 focus:border-cyan-400 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
          />

          {/* Autosave Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1 text-cyan-400 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Check className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="text-amber-400 font-medium">Unsaved</span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1 text-rose-400 font-medium" title={saveError || ""}>
                <AlertCircle className="h-3.5 w-3.5" />
                Failed
              </span>
            )}
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 mr-2 border-r border-slate-800 pr-3">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{characterCount} chars</span>
          </div>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 active:scale-95 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            <span>Gemini AI</span>
          </button>

          {/* Save As Template */}
          <button
            onClick={onSaveAsTemplate}
            className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Save as Reusable Template"
          >
            <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Save Template</span>
          </button>

          {/* Version History */}
          <button
            onClick={onOpenVersions}
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Version History"
          >
            <History className="h-4 w-4" />
          </button>

          {/* Share */}
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>

          {/* Export DOCX */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-95 transition shadow-md shadow-blue-500/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export DOCX</span>
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 overflow-x-auto px-4 py-1.5 bg-slate-900/80 text-slate-300 border-b border-slate-800/80">
        {/* Undo / Redo */}
        <div className="flex items-center border-r border-slate-800 pr-1 mr-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="rounded-lg p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="rounded-lg p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center border-r border-slate-800 pr-1 mr-1">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`rounded-lg p-1.5 transition ${
              editor.isActive("heading", { level: 1 })
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`rounded p-1.5 transition ${
              editor.isActive("heading", { level: 2 })
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-slate-100"
            }`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`rounded p-1.5 transition ${
              editor.isActive("heading", { level: 3 })
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-slate-100"
            }`}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>
        </div>

        {/* Inline styles: Bold, Italic, Underline, Strike */}
        <div className="flex items-center border-r border-slate-200 pr-1 mr-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-1.5 transition ${
              editor.isActive("bold") ? "bg-indigo-100 text-indigo-700 font-bold" : "hover:bg-slate-100"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-1.5 transition ${
              editor.isActive("italic") ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`rounded p-1.5 transition ${
              editor.isActive("underline") ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded p-1.5 transition ${
              editor.isActive("strike") ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
        </div>

        {/* Text Color & Highlight */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1 mr-1">
          <label className="flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-slate-100" title="Text Color">
            <span className="text-xs font-bold border-b-2 border-indigo-600">A</span>
            <input
              type="color"
              value={colorInput}
              onChange={(e) => {
                setColorInput(e.target.value);
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="h-4 w-4 cursor-pointer border-0 p-0 bg-transparent"
            />
          </label>

          <label className="flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-slate-100" title="Highlight Color">
            <span className="text-xs font-bold bg-amber-200 px-1 rounded-sm">H</span>
            <input
              type="color"
              value={highlightInput}
              onChange={(e) => {
                setHighlightInput(e.target.value);
                editor.chain().focus().setHighlight({ color: e.target.value }).run();
              }}
              className="h-4 w-4 cursor-pointer border-0 p-0 bg-transparent"
            />
          </label>
        </div>

        {/* Alignment */}
        <div className="flex items-center border-r border-slate-200 pr-1 mr-1">
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`rounded p-1.5 ${editor.isActive({ textAlign: "left" }) ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"}`}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`rounded p-1.5 ${editor.isActive({ textAlign: "center" }) ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"}`}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`rounded p-1.5 ${editor.isActive({ textAlign: "right" }) ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"}`}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`rounded p-1.5 ${editor.isActive({ textAlign: "justify" }) ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"}`}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-slate-200 pr-1 mr-1">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded p-1.5 ${editor.isActive("bulletList") ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded p-1.5 ${editor.isActive("orderedList") ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"}`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>

        {/* Tables & Media */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowTableMenu(!showTableMenu)}
              className={`rounded p-1.5 ${editor.isActive("table") ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"}`}
              title="Table Controls"
            >
              <TableIcon className="h-4 w-4" />
            </button>

            {showTableMenu && (
              <div
                className="absolute left-0 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-40 text-xs"
                onClick={() => setShowTableMenu(false)}
              >
                <button
                  onClick={insertTable}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 text-slate-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Insert 3x3 Table
                </button>
                <button
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 text-slate-700"
                >
                  Add Row Below
                </button>
                <button
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 text-slate-700"
                >
                  Add Column Right
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Table
                </button>
              </div>
            )}
          </div>

          <button
            onClick={setLink}
            className={`rounded p-1.5 ${editor.isActive("link") ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"}`}
            title="Insert Hyperlink"
          >
            <LinkIcon className="h-4 w-4" />
          </button>

          <button
            onClick={addImage}
            className="rounded p-1.5 hover:bg-slate-100 text-slate-700"
            title="Insert Image URL"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="rounded p-1.5 hover:bg-slate-100 text-slate-700"
            title="Horizontal Divider"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
