import { describe, it, expect } from "vitest";
import {
  createDocumentSchema,
  updateDocumentSchema,
  createTemplateSchema,
  createShareLinkSchema,
  createInvitationSchema,
} from "../src/lib/validation";

describe("Zod Request Validation Schemas", () => {
  it("validates valid createDocument payload", () => {
    const valid = createDocumentSchema.safeParse({
      title: "Quarterly Strategy",
      visibility: "public",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects empty or whitespace document title", () => {
    const invalid = createDocumentSchema.safeParse({
      title: "   ",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates valid template schema and rejects invalid category", () => {
    const valid = createTemplateSchema.safeParse({
      title: "Modern Proposal",
      description: "Sample description",
      category: "Business Proposals",
      editorContent: { type: "doc", content: [] },
      visibility: "public",
    });
    expect(valid.success).toBe(true);

    const invalid = createTemplateSchema.safeParse({
      title: "Invalid Template",
      category: "NonExistentCategory",
      editorContent: {},
    });
    expect(invalid.success).toBe(false);
  });

  it("validates share link expiration constraints", () => {
    const valid = createShareLinkSchema.safeParse({
      permission: "editor",
      expiresInHours: 72,
    });
    expect(valid.success).toBe(true);

    const invalid = createShareLinkSchema.safeParse({
      permission: "editor",
      expiresInHours: -5,
    });
    expect(invalid.success).toBe(false);
  });

  it("validates invitation emails properly", () => {
    const valid = createInvitationSchema.safeParse({
      invitedEmail: "colleague@enterprise.com",
      role: "viewer",
    });
    expect(valid.success).toBe(true);

    const invalid = createInvitationSchema.safeParse({
      invitedEmail: "not-an-email",
      role: "viewer",
    });
    expect(invalid.success).toBe(false);
  });
});
