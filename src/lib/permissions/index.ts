import { connectToDatabase } from "@/lib/db/mongoose";
import {
  DocumentModel,
  DocumentCollaboratorModel,
  ShareLinkModel,
  TemplateModel,
} from "@/models";
import { hashToken } from "@/lib/utils";
import mongoose from "mongoose";

export type AccessLevel = "owner" | "editor" | "viewer" | "none";

export interface PermissionCheckResult {
  hasAccess: boolean;
  accessLevel: AccessLevel;
  canEdit: boolean;
  canShare: boolean;
  canDelete: boolean;
  reason?: string;
}

export async function checkDocumentAccess(
  documentId: string,
  userId?: string | null,
  shareToken?: string | null
): Promise<PermissionCheckResult> {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    return {
      hasAccess: false,
      accessLevel: "none",
      canEdit: false,
      canShare: false,
      canDelete: false,
      reason: "Invalid document identifier",
    };
  }

  const doc = await DocumentModel.findById(documentId);
  if (!doc || doc.deletedAt) {
    return {
      hasAccess: false,
      accessLevel: "none",
      canEdit: false,
      canShare: false,
      canDelete: false,
      reason: "Document not found or moved to trash",
    };
  }

  // 1. Is User the Owner?
  if (userId && doc.ownerId.toString() === userId.toString()) {
    return {
      hasAccess: true,
      accessLevel: "owner",
      canEdit: true,
      canShare: true,
      canDelete: true,
    };
  }

  // 2. Is User an invited Collaborator?
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const collaborator = await DocumentCollaboratorModel.findOne({
      documentId: doc._id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (collaborator) {
      const isEditor = collaborator.role === "editor";
      return {
        hasAccess: true,
        accessLevel: isEditor ? "editor" : "viewer",
        canEdit: isEditor,
        canShare: false,
        canDelete: false,
      };
    }
  }

  // 3. Share Link Token verification
  if (shareToken) {
    const tokenHash = hashToken(shareToken);
    const link = await ShareLinkModel.findOne({
      documentId: doc._id,
      tokenHash,
      revokedAt: null,
    });

    if (link) {
      if (!link.expiresAt || new Date(link.expiresAt) > new Date()) {
        const isEditor = link.permission === "editor";
        return {
          hasAccess: true,
          accessLevel: isEditor ? "editor" : "viewer",
          canEdit: isEditor,
          canShare: false,
          canDelete: false,
        };
      }
    }
  }

  // 4. Public document check (Read-only if public)
  if (doc.visibility === "public") {
    return {
      hasAccess: true,
      accessLevel: "viewer",
      canEdit: false,
      canShare: false,
      canDelete: false,
    };
  }

  return {
    hasAccess: false,
    accessLevel: "none",
    canEdit: false,
    canShare: false,
    canDelete: false,
    reason: "Unauthorized: You do not have access to this document",
  };
}

export async function checkTemplateAccess(
  templateId: string,
  userId?: string | null
): Promise<{ canView: boolean; canEdit: boolean; isOwner: boolean }> {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    return { canView: false, canEdit: false, isOwner: false };
  }

  const template = await TemplateModel.findById(templateId);
  if (!template) {
    return { canView: false, canEdit: false, isOwner: false };
  }

  const isOwner = Boolean(
    userId && template.ownerId.toString() === userId.toString()
  );

  if (isOwner) {
    return { canView: true, canEdit: true, isOwner: true };
  }

  if (template.visibility === "public") {
    return { canView: true, canEdit: false, isOwner: false };
  }

  return { canView: false, canEdit: false, isOwner: false };
}
