"use client";

import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Sparkles,
  X,
  Wand2,
  RefreshCw,
  FileText,
  AlignLeft,
  Check,
  Copy,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

export function AIModal({ isOpen, onClose, editor }: AIModalProps) {
  const [activeTab, setActiveTab] = useState<"generate" | "rewrite" | "summarize">("generate");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [category, setCategory] = useState("Business Proposals");
  const [selectedText, setSelectedText] = useState("");
  const [rewriteInstruction, setRewriteInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [aiResultText, setAiResultText] = useState("");

  if (!isOpen) return null;

  // Populate selected text from editor if available
  const handleOpenRewriteTab = () => {
    setActiveTab("rewrite");
    if (editor) {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      if (text) setSelectedText(text);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt for the AI");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category, tone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");

      setGeneratedHtml(data.contentHtml);
      setGeneratedTitle(data.title);
      toast.success("AI draft generated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error generating AI draft");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewrite = async () => {
    const textToRewrite = selectedText || (editor ? editor.getText() : "");
    if (!textToRewrite.trim()) {
      toast.error("Please provide text to rewrite");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToRewrite,
          instruction: rewriteInstruction,
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI rewrite failed");

      setAiResultText(data.rewrittenText);
      toast.success("Text rewritten successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error rewriting text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    const textToSummarize = editor ? editor.getText() : "";
    if (!textToSummarize.trim()) {
      toast.error("The document is empty. Type some content first.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSummarize }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI summarize failed");

      setAiResultText(data.summary);
      toast.success("Summary generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error summarizing text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertHtml = () => {
    if (!editor || !generatedHtml) return;
    editor.commands.insertContent(generatedHtml);
    toast.success("Inserted into document");
    onClose();
  };

  const handleReplaceWithText = () => {
    if (!editor || !aiResultText) return;
    const { from, to } = editor.state.selection;
    if (from !== to) {
      editor.commands.insertContentAt({ from, to }, aiResultText);
    } else {
      editor.commands.insertContent(aiResultText);
    }
    toast.success("Inserted into document");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Google Gemini AI Assistant</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold">
                  ⚡ AI Active
                </span>
              </div>
              <p className="text-xs text-slate-500">Draft, refine, and summarize professional Word documents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("generate")}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === "generate"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Draft from Prompt
          </button>
          <button
            onClick={handleOpenRewriteTab}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === "rewrite"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Rewrite & Tone
          </button>
          <button
            onClick={() => setActiveTab("summarize")}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === "summarize"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Summarize Document
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "generate" && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  What would you like Gemini to write?
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Create a comprehensive project proposal for an AI-powered logistics tracking system, including timeline, budget, and scope."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-black placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-black outline-none shadow-sm"
                  >
                    <option value="Business Proposals">Business Proposals</option>
                    <option value="Resume and CV">Resume and CV</option>
                    <option value="Letters">Formal Letters</option>
                    <option value="Reports">Executive Reports</option>
                    <option value="Academic Assignments">Academic Assignments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Desired Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-black outline-none shadow-sm"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Academic">Academic</option>
                    <option value="Concise">Concise & Direct</option>
                    <option value="Creative">Creative</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {isLoading ? "Generating Document Draft..." : "Generate Document Draft"}
              </button>

              {generatedHtml && (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800">
                      Preview: {generatedTitle}
                    </span>
                    <button
                      onClick={handleInsertHtml}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Insert into Canvas
                    </button>
                  </div>
                  <div
                    className="max-h-48 overflow-y-auto text-xs text-slate-700 leading-relaxed prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "rewrite" && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Text to Rewrite / Polish
                </label>
                <textarea
                  rows={4}
                  value={selectedText}
                  onChange={(e) => setSelectedText(e.target.value)}
                  placeholder="Paste or select text from your document..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-black placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instruction</label>
                  <input
                    type="text"
                    value={rewriteInstruction}
                    onChange={(e) => setRewriteInstruction(e.target.value)}
                    placeholder="e.g. Make it more persuasive and active"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium text-black placeholder:text-slate-400 outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-black outline-none shadow-sm"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Formal">Formal</option>
                    <option value="Persuasive">Persuasive</option>
                    <option value="Concise">Concise</option>
                    <option value="Friendly">Friendly</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRewrite}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {isLoading ? "Rewriting..." : "Improve & Rewrite"}
              </button>

              {aiResultText && (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800">Rewritten Result</span>
                    <button
                      onClick={handleReplaceWithText}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Apply to Selection
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {aiResultText}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "summarize" && (
            <>
              <p className="text-xs text-slate-600">
                Generate an executive summary of the active canvas document to include in your introduction or send to stakeholders.
              </p>

              <button
                onClick={handleSummarize}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlignLeft className="h-4 w-4" />}
                {isLoading ? "Summarizing..." : "Summarize Entire Document"}
              </button>

              {aiResultText && (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800">Executive Summary</span>
                    <button
                      onClick={handleReplaceWithText}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Insert into Canvas
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {aiResultText}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
