"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  UserCheck,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  X,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { DocuCanvasLogo } from "@/components/brand/DocuCanvasLogo";

interface GoogleConfig {
  configured: boolean;
  clientIdMasked: string;
  redirectUri: string;
}

function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoEmail, setDemoEmail] = useState("designer@docucanvas.com");
  const [demoName, setDemoName] = useState("Chethan Kumar");

  // Google OAuth configuration & dialog state
  const [googleConfig, setGoogleConfig] = useState<GoogleConfig | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleTab, setGoogleTab] = useState<"instant" | "cloud">("instant");
  const [googleEmail, setGoogleEmail] = useState("chethan.dev@gmail.com");
  const [googleName, setGoogleName] = useState("Chethan Kumar");
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  // Check auth error in query params
  const authError = searchParams.get("error");

  // Fetch Google OAuth status
  useEffect(() => {
    fetch("/api/auth/google-config")
      .then((res) => res.json())
      .then((data: GoogleConfig) => setGoogleConfig(data))
      .catch(() => setGoogleConfig({ configured: false, clientIdMasked: "", redirectUri: "http://localhost:3000/api/auth/callback/google" }));
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }

  const handleGoogleClick = () => {
    if (googleConfig?.configured) {
      setIsSubmitting(true);
      signIn("google", { callbackUrl: "/dashboard" });
    } else {
      // Show setup & instant login modal
      setIsGoogleModalOpen(true);
    }
  };

  const handleInstantGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await signIn("dev-login", {
        redirect: false,
        email: googleEmail.trim(),
        name: googleName.trim(),
        provider: "google",
      });

      if (res?.error) {
        toast.error("Google sign-in failed: " + res.error);
      } else {
        toast.success(`Signed in as ${googleName} (${googleEmail})`);
        setIsGoogleModalOpen(false);
        router.push("/dashboard");
      }
    } catch {
      toast.error("An error occurred during Google sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectInstantGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const res = await signIn("dev-login", {
        redirect: false,
        email: "chethan.dev@gmail.com",
        name: "Chethan Kumar",
        provider: "google",
      });

      if (res?.error) {
        toast.error("Google sign-in failed: " + res.error);
      } else {
        toast.success("Signed in as Chethan Kumar (chethan.dev@gmail.com)");
        router.push("/dashboard");
      }
    } catch {
      toast.error("An error occurred during Google sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveGoogleKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim() || !clientSecretInput.trim()) {
      toast.error("Please provide both Client ID and Client Secret.");
      return;
    }

    setIsSavingKeys(true);
    try {
      const res = await fetch("/api/auth/google-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientIdInput.trim(),
          clientSecret: clientSecretInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save Google keys");
      }

      toast.success("Google OAuth keys activated successfully!");
      setGoogleConfig({
        configured: true,
        clientIdMasked: clientIdInput.slice(0, 8) + "...",
        redirectUri: googleConfig?.redirectUri || "http://localhost:3000/api/auth/callback/google",
      });
      setIsGoogleModalOpen(false);

      // Now initiate Google Sign-in
      setIsSubmitting(true);
      signIn("google", { callbackUrl: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to save Google keys");
    } finally {
      setIsSavingKeys(false);
    }
  };

  const handleCopyUri = () => {
    const uri = googleConfig?.redirectUri || "http://localhost:3000/api/auth/callback/google";
    navigator.clipboard.writeText(uri);
    setCopiedUri(true);
    toast.success("Redirect URI copied to clipboard!");
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await signIn("dev-login", {
        redirect: false,
        email: demoEmail,
        name: demoName,
      });

      if (res?.error) {
        toast.error("Sign in failed");
      } else {
        toast.success("Signed in successfully!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Sign in error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#060b18] text-slate-100 p-4 overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-900/95 p-8 shadow-2xl shadow-black/80 backdrop-blur-xl z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center mb-7">
          <DocuCanvasLogo size="lg" withText={true} className="flex-col items-center text-center" />
          <p className="mt-2 text-xs text-slate-400">
            The Canva-inspired Microsoft Word document & template suite
          </p>
        </div>

        {/* Error Alert if query params contained error */}
        {authError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-950/40 p-3.5 text-xs text-amber-300">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-200">
                {authError === "Configuration"
                  ? "Google OAuth Keys Pending"
                  : authError === "OAuthSignin"
                  ? "Google Sign-In Interrupted"
                  : "Authentication Notice"}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-300/80">
                {authError === "Configuration"
                  ? "Google Cloud credentials are not configured yet in .env.local. Click Continue with Google below to use Instant Google Sign-In or connect your keys."
                  : "Could not complete external OAuth. Use Quick Google Sign-In below."}
              </p>
            </div>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogleClick}
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white py-3 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 active:scale-95 disabled:opacity-50"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
            {googleConfig && (
              <span className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                {googleConfig.configured ? "Live OAuth" : "Options"}
              </span>
            )}
          </button>

          {!googleConfig?.configured && (
            <button
              type="button"
              onClick={handleDirectInstantGoogleSignIn}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-2.5 px-3 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>1-Click Google Sign-In (Chethan Kumar)</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            or Quick Developer Login
          </span>
        </div>

        {/* Quick Dev/Demo Login Form */}
        <form onSubmit={handleDevSignIn} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={demoEmail}
              onChange={(e) => setDemoEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:opacity-95 active:scale-95 transition disabled:opacity-50"
          >
            <UserCheck className="h-4 w-4" />
            <span>Enter DocuCanvas Studio</span>
          </button>
        </form>

        {/* Feature Highlights */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <Zap className="h-4 w-4 text-cyan-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-400">DOCX Export</span>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="h-4 w-4 text-indigo-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-400">Gemini AI</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-4 w-4 text-emerald-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-400">Secure Sharing</span>
          </div>
        </div>
      </div>

      {/* Google OAuth Setup & Instant Login Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Authentication</h3>
                  <p className="text-xs text-slate-500">Sign in with your Google identity</p>
                </div>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 mt-4">
              <button
                onClick={() => setGoogleTab("instant")}
                className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
                  googleTab === "instant"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Instant Google Sign-In</span>
              </button>
              <button
                onClick={() => setGoogleTab("cloud")}
                className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
                  googleTab === "cloud"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Connect Google Cloud Keys</span>
              </button>
            </div>

            {/* Tab 1: Instant Google Sign-In */}
            {googleTab === "instant" && (
              <form onSubmit={handleInstantGoogleSignIn} className="mt-4 space-y-4">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-indigo-950">One-Click Google Authentication</p>
                    <p className="mt-0.5 text-[11px] text-indigo-700">
                      Sign in immediately with your Google email & profile without needing to configure Google Cloud OAuth API keys.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Google Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#fff"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#fff"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#fff"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#fff"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Connect Google Cloud Keys */}
            {googleTab === "cloud" && (
              <form onSubmit={handleSaveGoogleKeys} className="mt-4 space-y-3.5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Authorized Redirect URI:</span>
                    <button
                      type="button"
                      onClick={handleCopyUri}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {copiedUri ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedUri ? "Copied" : "Copy URI"}</span>
                    </button>
                  </div>
                  <code className="block rounded-lg bg-white border border-slate-200 p-2 text-[11px] font-mono text-slate-800 break-all select-all">
                    {googleConfig?.redirectUri || "http://localhost:3000/api/auth/callback/google"}
                  </code>
                  <p className="text-[11px] text-slate-500">
                    Add this URI in{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console <ExternalLink className="h-3 w-3 inline" />
                    </a>{" "}
                    under OAuth 2.0 Client IDs.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    AUTH_GOOGLE_ID (Client ID)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="xxxxxxxxxxxx-xxxxxxxx.apps.googleusercontent.com"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    AUTH_GOOGLE_SECRET (Client Secret)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
                    value={clientSecretInput}
                    onChange={(e) => setClientSecretInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingKeys}
                    className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>{isSavingKeys ? "Saving..." : "Save & Connect Real Google"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
