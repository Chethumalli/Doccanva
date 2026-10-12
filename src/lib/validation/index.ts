import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200).optional(),
  templateId: z.string().optional(),
  editorContent: z.record(z.string(), z.unknown()).optional(),
  visibility: z.enum(["private", "public"]).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200).optional(),
  editorContent: z.record(z.string(), z.unknown()).optional(),
  visibility: z.enum(["private", "public"]).optional(),
  wordCount: z.number().int().nonnegative().optional(),
  characterCount: z.number().int().nonnegative().optional(),
});

export const createTemplateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().default(""),
  category: z.enum([
    "Resume and CV",
    "Business Proposals",
    "Invoices",
    "Reports",
    "Letters",
    "Academic Assignments",
    "Meeting Notes",
    "Project Documentation",
    "Contracts and Agreements",
    "Marketing Documents",
    "General",
  ]),
  editorContent: z.record(z.string(), z.unknown()),
  visibility: z.enum(["public", "private"]).default("public"),
  previewImage: z.string().optional(),
});

export const updateTemplateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum([
    "Resume and CV",
    "Business Proposals",
    "Invoices",
    "Reports",
    "Letters",
    "Academic Assignments",
    "Meeting Notes",
    "Project Documentation",
    "Contracts and Agreements",
    "Marketing Documents",
    "General",
  ]).optional(),
  editorContent: z.record(z.string(), z.unknown()).optional(),
  visibility: z.enum(["public", "private"]).optional(),
  previewImage: z.string().optional(),
});

export const createShareLinkSchema = z.object({
  permission: z.enum(["viewer", "editor"]).default("viewer"),
  expiresInHours: z.number().positive().max(8760).optional(), // max 1 year
});

export const createInvitationSchema = z.object({
  invitedEmail: z.string().email("Please provide a valid email address").toLowerCase(),
  role: z.enum(["viewer", "editor"]).default("viewer"),
});

export const aiGenerateSchema = z.object({
  prompt: z.string().trim().min(5, "Prompt must be at least 5 characters").max(4000),
  category: z.string().optional(),
  tone: z.enum(["Professional", "Casual", "Academic", "Creative", "Concise"]).optional(),
});

export const aiRewriteSchema = z.object({
  text: z.string().trim().min(3, "Text to rewrite must be at least 3 characters").max(10000),
  instruction: z.string().max(500).optional(),
  tone: z.enum(["Professional", "Formal", "Persuasive", "Concise", "Friendly", "Academic"]).optional(),
});

export const aiSummarizeSchema = z.object({
  text: z.string().trim().min(20, "Text must be at least 20 characters").max(20000),
  format: z.enum(["Bullet points", "Executive summary", "Short paragraph"]).optional(),
});
