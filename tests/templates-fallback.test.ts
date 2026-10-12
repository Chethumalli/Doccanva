import { describe, it, expect } from "vitest";
import { fallbackStore } from "../src/lib/db/fallbackStore";
import { DEFAULT_TEMPLATES } from "../src/lib/templates/defaultTemplates";

describe("Sample Templates & Fallback Store Verification", () => {
  it("contains rich sample templates across all categories", () => {
    expect(DEFAULT_TEMPLATES.length).toBeGreaterThanOrEqual(10);

    const categories = new Set(DEFAULT_TEMPLATES.map((t) => t.category));
    expect(categories.has("Resume and CV")).toBe(true);
    expect(categories.has("Business Proposals")).toBe(true);
    expect(categories.has("Invoices")).toBe(true);
    expect(categories.has("Reports")).toBe(true);
    expect(categories.has("Letters")).toBe(true);
    expect(categories.has("Academic Assignments")).toBe(true);
    expect(categories.has("Meeting Notes")).toBe(true);
    expect(categories.has("Project Documentation")).toBe(true);
    expect(categories.has("Contracts and Agreements")).toBe(true);
    expect(categories.has("Marketing Documents")).toBe(true);
  });

  it("filters templates by category correctly in fallback store", () => {
    const resumes = fallbackStore.getTemplates("Resume and CV");
    expect(resumes.length).toBeGreaterThan(0);
    expect(resumes[0].category).toBe("Resume and CV");

    const proposals = fallbackStore.getTemplates("Business Proposals");
    expect(proposals.length).toBeGreaterThan(0);
    expect(proposals[0].category).toBe("Business Proposals");
  });

  it("filters templates by keyword search", () => {
    const searchResult = fallbackStore.getTemplates("All", "Proposal");
    expect(searchResult.length).toBeGreaterThan(0);
    expect(searchResult.some((t) => t.title.includes("Proposal"))).toBe(true);
  });

  it("persists and retrieves documents in fallback store", () => {
    const doc = fallbackStore.saveDocument({
      _id: "test-doc-99",
      ownerId: "user-1",
      title: "Test Architecture Spec.docx",
      editorContent: { type: "doc", content: [] },
      schemaVersion: 1,
      visibility: "private",
      currentVersion: 1,
      wordCount: 15,
      characterCount: 90,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const retrieved = fallbackStore.getDocumentById("test-doc-99");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe("Test Architecture Spec.docx");
  });

  it("extracts and incorporates user prompt details into generated document", async () => {
    const { generateSmartFallbackDocument } = await import(
      "../src/lib/ai/fallbackGenerator"
    );

    const result = generateSmartFallbackDocument(
      "resume name chethu be aiml student",
      "Resume and CV",
      "Academic"
    );

    expect(result.title).toContain("Chethu");
    expect(result.contentHtml).toContain("Chethu");
    expect(result.contentHtml).toContain("Artificial Intelligence & Machine Learning");
    expect(result.contentHtml).toContain("B.E.");
    expect(result.contentHtml).toContain("PyTorch");
  });
});
