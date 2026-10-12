import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

export interface ImportDocxResult {
  html: string;
  messages: string[];
}

/**
 * Import and parse DOCX file buffer into clean, sanitized HTML
 */
export async function parseDocxBuffer(buffer: Buffer): Promise<ImportDocxResult> {
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Subtitle'] => p.subtitle:fresh",
      ],
    }
  );

  const cleanHtml = sanitizeHtml(result.value, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "span",
      "b",
      "i",
      "strong",
      "em",
      "u",
      "s",
      "strike",
      "ul",
      "ol",
      "li",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "a",
      "blockquote",
      "hr",
      "br",
    ],
    allowedAttributes: {
      a: ["href", "name", "target"],
      table: ["border", "cellpadding", "cellspacing"],
      th: ["colspan", "rowspan", "style"],
      td: ["colspan", "rowspan", "style"],
      span: ["style"],
      p: ["style", "class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });

  return {
    html: cleanHtml,
    messages: result.messages.map((m) => m.message),
  };
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
}

/**
 * Convert TipTap Editor JSON structure into a valid Microsoft Word .docx buffer
 */
export async function exportTipTapToDocx(
  editorJson: Record<string, unknown>,
  title = "DocuCanvas Document"
): Promise<Buffer> {
  const nodes = (editorJson.content as TipTapNode[]) || [];
  const docxElements: Array<Paragraph | Table> = [];

  // Helper to extract text runs from inline children
  function extractRuns(nodeList?: TipTapNode[]): TextRun[] {
    if (!nodeList || nodeList.length === 0) return [];
    const runs: TextRun[] = [];

    for (const child of nodeList) {
      if (child.type === "text" && child.text) {
        const marks = child.marks || [];
        const isBold = marks.some((m) => m.type === "bold");
        const isItalic = marks.some((m) => m.type === "italic");
        const isUnderline = marks.some((m) => m.type === "underline");
        const isStrike = marks.some((m) => m.type === "strike");

        // Color mark
        const textStyleMark = marks.find((m) => m.type === "textStyle");
        const color = (textStyleMark?.attrs?.color as string)?.replace("#", "") || undefined;

        // Highlight mark
        const highlightMark = marks.find((m) => m.type === "highlight");
        const highlightColor = (highlightMark?.attrs?.color as string)?.replace("#", "") || undefined;

        runs.push(
          new TextRun({
            text: child.text,
            bold: isBold,
            italics: isItalic,
            underline: isUnderline ? {} : undefined,
            strike: isStrike,
            color: color || undefined,
            shading: highlightColor
              ? { fill: highlightColor }
              : undefined,
            font: "Segoe UI",
          })
        );
      } else if (child.type === "hardBreak") {
        runs.push(new TextRun({ break: 1 }));
      }
    }

    return runs;
  }

  // Parse top-level nodes
  for (const node of nodes) {
    if (node.type === "heading") {
      const level = (node.attrs?.level as number) || 1;
      let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1;
      if (level === 2) headingLevel = HeadingLevel.HEADING_2;
      else if (level === 3) headingLevel = HeadingLevel.HEADING_3;
      else if (level >= 4) headingLevel = HeadingLevel.HEADING_4;

      docxElements.push(
        new Paragraph({
          heading: headingLevel,
          children: extractRuns(node.content),
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (node.type === "paragraph") {
      const textAlign = node.attrs?.textAlign as string;
      let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
      if (textAlign === "center") alignment = AlignmentType.CENTER;
      else if (textAlign === "right") alignment = AlignmentType.RIGHT;
      else if (textAlign === "justify") alignment = AlignmentType.JUSTIFIED;

      docxElements.push(
        new Paragraph({
          alignment,
          children: extractRuns(node.content),
          spacing: { after: 140, line: 360 },
        })
      );
    } else if (node.type === "bulletList") {
      for (const item of node.content || []) {
        for (const child of item.content || []) {
          docxElements.push(
            new Paragraph({
              bullet: { level: 0 },
              children: extractRuns(child.content),
              spacing: { after: 80 },
            })
          );
        }
      }
    } else if (node.type === "orderedList") {
      let count = 1;
      for (const item of node.content || []) {
        for (const child of item.content || []) {
          docxElements.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${count}. `, bold: true }),
                ...extractRuns(child.content),
              ],
              spacing: { after: 80 },
            })
          );
        }
        count++;
      }
    } else if (node.type === "table") {
      const rows: TableRow[] = [];
      for (const rowNode of node.content || []) {
        const cells: TableCell[] = [];
        for (const cellNode of rowNode.content || []) {
          const cellParagraphs: Paragraph[] = [];
          for (const pNode of cellNode.content || []) {
            cellParagraphs.push(
              new Paragraph({
                children: extractRuns(pNode.content),
              })
            );
          }

          cells.push(
            new TableCell({
              children: cellParagraphs.length > 0 ? cellParagraphs : [new Paragraph({})],
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
            })
          );
        }

        rows.push(new TableRow({ children: cells }));
      }

      if (rows.length > 0) {
        docxElements.push(
          new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
      }
    } else if (node.type === "horizontalRule") {
      docxElements.push(
        new Paragraph({
          border: {
            bottom: {
              color: "E2E8F0",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { before: 200, after: 200 },
        })
      );
    }
  }

  // If document was completely empty, include at least one paragraph
  if (docxElements.length === 0) {
    docxElements.push(
      new Paragraph({
        children: [new TextRun(title)],
      })
    );
  }

  const doc = new DocxDocument({
    creator: "DocuCanvas",
    title,
    description: "Exported from DocuCanvas",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docxElements,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
