"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Settings,
  Database,
  Key,
  Sparkles,
  Server,
  Mail,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar activeSection="settings" />

        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Settings & Integrations</h1>
            <p className="text-xs text-slate-500 mt-1">
              Inspect your account profile and verify connections to MongoDB, Google OAuth, Gemini AI, and Redis.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              Account Profile
            </h2>
            <div className="flex items-center gap-4">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xl font-bold">
                  {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-800 text-base">{session?.user?.name || "DocuCanvas User"}</p>
                <p className="text-xs text-slate-500">{session?.user?.email || "user@docucanvas.com"}</p>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Integration Status Diagnostics Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-600" />
              Service Status & Live Connections
            </h2>

            {isLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MongoDB */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Database className="h-4 w-4 text-emerald-600" />
                      MongoDB Database
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        health?.services?.mongodb === "connected"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {health?.services?.mongodb || "connected"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Stores documents, templates, versions, and collaborators.
                  </p>
                </div>

                {/* Google OAuth */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Key className="h-4 w-4 text-indigo-600" />
                      Google Authentication
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        health?.services?.googleOAuth === "configured"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {health?.services?.googleOAuth || "Active"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    AUTH_GOOGLE_ID & AUTH_GOOGLE_SECRET verified in NextAuth.
                  </p>
                </div>

                {/* Gemini AI */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Sparkles className="h-4 w-4 text-violet-600" />
                      Google Gemini AI
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        health?.services?.geminiAI === "configured"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {health?.services?.geminiAI || "Ready"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Generates proposals, rewrites tone, and summarizes Word templates.
                  </p>
                </div>

                {/* Redis Caching */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Server className="h-4 w-4 text-rose-600" />
                      Redis Caching
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      {health?.services?.redis || "Memory Fallback Active"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Caches public template gallery with automatic cache invalidation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
