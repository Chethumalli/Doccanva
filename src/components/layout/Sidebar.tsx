"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  Clock,
  Files,
  LayoutGrid,
  Globe,
  Users,
  Trash2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useDashboardStore, DashboardSection } from "@/stores/useDashboardStore";

interface SidebarProps {
  activeSection?: DashboardSection;
  onSelectSection?: (section: DashboardSection) => void;
}

export function Sidebar({ activeSection, onSelectSection }: SidebarProps) {
  const store = useDashboardStore();
  const currentSection = activeSection || store.activeSection;

  const handleSelect = (sec: DashboardSection) => {
    if (onSelectSection) onSelectSection(sec);
    store.setActiveSection(sec);
  };

  const navItems = [
    { id: "home" as DashboardSection, label: "Home", icon: Home },
    { id: "recent" as DashboardSection, label: "Recent Documents", icon: Clock },
    { id: "my-docs" as DashboardSection, label: "My Documents", icon: Files },
    { id: "my-templates" as DashboardSection, label: "My Templates", icon: LayoutGrid },
    { id: "public-templates" as DashboardSection, label: "Public Templates", icon: Globe },
    { id: "shared" as DashboardSection, label: "Shared with Me", icon: Users },
    { id: "trash" as DashboardSection, label: "Trash", icon: Trash2 },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/70 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex backdrop-blur-md">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          <div className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/5"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-cyan-400" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Preferences
          </p>
          <div className="mt-2 space-y-1">
            <Link
              href="/settings"
              className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                currentSection === "settings"
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Settings & API Keys</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Pro / AI Callout card */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-blue-950/30 p-4 shadow-lg shadow-black/40">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Gemini AI Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Draft executive documents, generate tailored resumes, and export pixel-perfect Word .docx files.
        </p>
      </div>
    </aside>
  );
}
