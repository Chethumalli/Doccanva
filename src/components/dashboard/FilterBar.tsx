"use client";

import React from "react";
import { Search, LayoutGrid, List, ArrowDownUp } from "lucide-react";
import { useDashboardStore } from "@/stores/useDashboardStore";

export function FilterBar() {
  const {
    layout,
    setLayout,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useDashboardStore();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Filter documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
        />
      </div>

      {/* Controls: Sort & Layout */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300">
          <ArrowDownUp className="h-3.5 w-3.5 text-cyan-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
          >
            <option value="updatedAt_desc" className="bg-slate-950 text-slate-200">Last Modified</option>
            <option value="newest" className="bg-slate-950 text-slate-200">Newest First</option>
            <option value="oldest" className="bg-slate-950 text-slate-200">Oldest First</option>
            <option value="name_asc" className="bg-slate-950 text-slate-200">Title (A-Z)</option>
          </select>
        </div>

        <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-900/90 p-0.5">
          <button
            onClick={() => setLayout("grid")}
            className={`rounded-xl p-1.5 transition ${
              layout === "grid"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLayout("list")}
            className={`rounded-xl p-1.5 transition ${
              layout === "list"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
