"use client";

import React from "react";
import Link from "next/link";
import { FileText, MoreHorizontal, Download, Trash2, RotateCcw } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { DocumentItem } from "./DocumentCard";

interface DocumentTableProps {
  documents: DocumentItem[];
  onRefresh: () => void;
  isTrashView?: boolean;
}

export function DocumentTable({ documents, onRefresh, isTrashView }: DocumentTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4">Visibility</th>
            <th className="py-3 px-4">Words</th>
            <th className="py-3 px-4">Last Modified</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {documents.map((doc) => (
            <tr key={doc._id} className="hover:bg-slate-50/60 transition">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                  <Link
                    href={isTrashView ? "#" : `/editor/${doc._id}`}
                    className="font-semibold text-slate-800 hover:text-indigo-600 line-clamp-1"
                  >
                    {doc.title}
                  </Link>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    doc.visibility === "public"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {doc.visibility}
                </span>
              </td>
              <td className="py-3.5 px-4 text-slate-500">
                {doc.wordCount || 0}
              </td>
              <td className="py-3.5 px-4 text-slate-500">
                {formatRelativeTime(doc.updatedAt)}
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {!isTrashView ? (
                    <>
                      <a
                        href={`/api/documents/${doc._id}/export`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Download DOCX"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <Link
                        href={`/editor/${doc._id}`}
                        className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
                      >
                        Edit
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={async () => {
                        await fetch(`/api/documents/${doc._id}/restore`, { method: "POST" });
                        onRefresh();
                      }}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
