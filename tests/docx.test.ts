import { describe, it, expect } from "vitest";
import { exportTipTapToDocx } from "../src/lib/docx";

describe("DOCX OpenXML Processing & Export Tests", () => {
  it("creates a valid Word .docx archive with PK signature", async () => {
    const sampleEditorJson = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Software Engineering Specification" }],
        },
        {
          type: "paragraph",
          attrs: { textAlign: "center" },
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }, { type: "italic" }],
              text: "Confidential Project Brief",
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Objective A: High Fidelity OpenXML Export" }],
                },
              ],
            },
          ],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Item" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Status" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Auth Integration" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Verified" }] }],
                },
              ],
            },
          ],
        },
      ],
    };

    const docxBuffer = await exportTipTapToDocx(sampleEditorJson, "Test Doc");

    expect(Buffer.isBuffer(docxBuffer)).toBe(true);
    expect(docxBuffer.length).toBeGreaterThan(1000);

    // Verify DOCX ZIP archive magic header: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    expect(docxBuffer[0]).toBe(0x50);
    expect(docxBuffer[1]).toBe(0x4b);
    expect(docxBuffer[2]).toBe(0x03);
    expect(docxBuffer[3]).toBe(0x04);
  });
});
