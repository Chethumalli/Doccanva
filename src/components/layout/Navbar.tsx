"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Plus,
  Sparkles,
  LayoutGrid,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DocuCanvasLogo } from "@/components/brand/DocuCanvasLogo";

interface NavbarProps {
  onOpenCreate?: () => void;
}

export function Navbar({ onOpenCreate }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 backdrop-blur-md sm:px-6 shadow-lg shadow-black/20">
      {/* Left: Brand Logo & Navigation */}
      <div className="flex items-center gap-6">
        <DocuCanvasLogo size="sm" href="/dashboard" />

        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-300">
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-1.5 transition-all hover:bg-slate-900 hover:text-cyan-300 active:scale-95"
          >
            Dashboard
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all hover:bg-slate-900 hover:text-cyan-300 active:scale-95"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-cyan-400" />
            <span>Templates</span>
          </Link>
        </nav>
      </div>

      {/* Middle: Canva-style Search Input */}
      <div className="hidden lg:flex flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition" />
          <input
            type="text"
            placeholder="Search documents, templates, or AI topics..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-2 pl-10 pr-10 text-xs font-medium text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-cyan-500/60 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500/20"
          />
          <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-400 opacity-70 group-hover:opacity-100 transition" />
        </form>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:opacity-95 hover:shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Document</span>
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 p-1 transition hover:border-cyan-500/50 hover:ring-2 hover:ring-cyan-500/20 focus:outline-none"
          >
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-cyan-500/30"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-xs shadow">
                {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
              </div>
            )}
            <ChevronDown className="h-3 w-3 text-slate-400 mr-1 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-black/80 ring-1 ring-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                <p className="font-bold text-xs text-white truncate">
                  {session?.user?.name || "DocuCanvas User"}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {session?.user?.email || "user@docucanvas.com"}
                </p>
              </div>

              <Link
                href="/settings"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-cyan-300 transition"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings & API Keys
              </Link>

              <button
                onClick={() => {
                  signOut({ callbackUrl: "/login" });
                  toast.success("Signed out successfully");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition mt-1"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
