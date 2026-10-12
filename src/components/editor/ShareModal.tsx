"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  X,
  Copy,
  Check,
  Link as LinkIcon,
  Mail,
  Shield,
  Trash2,
  Clock,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export function ShareModal({ isOpen, onClose, documentId }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "email">("link");
  const [permission, setPermission] = useState<"viewer" | "editor">("viewer");
  const [expiresInHours, setExpiresInHours] = useState<number>(168); // 7 days default
  const [generatedShareUrl, setGeneratedShareUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLinks, setActiveLinks] = useState<any[]>([]);

  // Email invitation state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor">("viewer");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShareLinks();
    }
  }, [isOpen, documentId]);

  const loadShareLinks = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/share-links`);
      if (res.ok) {
        const data = await res.json();
        setActiveLinks(data.links || []);
      }
    } catch {
      // Ignore
    }
  };

  if (!isOpen) return null;

  const handleCreateLink = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch(`/api/documents/${documentId}/share-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permission,
          expiresInHours: expiresInHours > 0 ? expiresInHours : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create share link");

      setGeneratedShareUrl(data.shareUrl);
      loadShareLinks();
      toast.success("Share link created");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error creating share link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedShareUrl) return;
    navigator.clipboard.writeText(generatedShareUrl);
    setIsCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleRevokeLink = async (linkId: string) => {
    try {
      const res = await fetch(`/api/share-links/${linkId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke link");
      toast.success("Share link revoked");
      loadShareLinks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error revoking link");
    }
  };

  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsSendingInvite(true);
      const res = await fetch(`/api/documents/${documentId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitedEmail: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitation");

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error sending invitation");
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Share Document</h2>
              <p className="text-xs text-slate-500">Manage links and invite teammates to collaborate</p>
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
            onClick={() => setActiveTab("link")}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === "link"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Shareable Link
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === "email"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Email Invitation
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "link" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Access Level</label>
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="viewer">Viewer (Can view only)</option>
                    <option value="editor">Editor (Can edit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Link Expiration</label>
                  <select
                    value={expiresInHours}
                    onChange={(e) => setExpiresInHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value={24}>24 Hours</option>
                    <option value={168}>7 Days</option>
                    <option value={720}>30 Days</option>
                    <option value={0}>Never Expire</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateLink}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                Generate Secure Share Link
              </button>

              {generatedShareUrl && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5">
                  <p className="text-xs font-semibold text-indigo-900 mb-1.5">Your Generated Share Link</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedShareUrl}
                      className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              {/* Active Links List */}
              {activeLinks.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Active Share Links
                  </p>
                  <div className="space-y-2">
                    {activeLinks.map((link) => (
                      <div
                        key={link._id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              link.permission === "editor"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {link.permission}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {link.expiresAt
                              ? `Expires ${formatRelativeTime(link.expiresAt)}`
                              : "No expiration"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRevokeLink(link._id)}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                          title="Revoke link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSendEmailInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Collaborator Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Granted Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-700 outline-none"
                >
                  <option value="viewer">Viewer — Can review without making changes</option>
                  <option value="editor">Editor — Can edit and format document text</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 leading-relaxed">
                <Shield className="h-4 w-4 text-indigo-600 inline mr-1 -mt-0.5" />
                Security guarantee: The recipient will receive a signed invitation link valid for 7 days. They must authenticate to verify their identity before access is granted.
              </div>

              <button
                type="submit"
                disabled={isSendingInvite}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
              >
                {isSendingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSendingInvite ? "Sending Invitation..." : "Send Email Invitation"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
