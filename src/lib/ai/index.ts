import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateSmartFallbackDocument,
  rewriteSmartFallbackText,
  summarizeSmartFallbackText,
} from "./fallbackGenerator";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class AIServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AIServiceError";
    this.statusCode = statusCode;
  }
}

function getGeminiClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!key || key.trim() === "") {
    return null;
  }
  return new GoogleGenerativeAI(key.trim());
}

export async function generateDocumentContent(
  prompt: string,
  category?: string,
  tone = "Professional"
): Promise<{ title: string; contentHtml: string; summary: string }> {
  const genAI = getGeminiClient();

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemInstruction = `
You are an expert executive document writer for DocuCanvas (a Microsoft Word & Canva template suite).
Generate a high-quality, comprehensive document based on the user's request.
Tone: ${tone}
${category ? `Category: ${category}` : ""}

Return your response strictly in valid JSON format with the following keys:
{
  "title": "A concise, professional document title",
  "summary": "A 1-2 sentence overview of what this document covers",
  "contentHtml": "The formatted document body in clean HTML using tags: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <tr>, <th>, <td>, <blockquote>, <hr>."
}

Do not wrap the JSON in markdown code blocks like \`\`\`json. Output raw JSON only.
`;

      const result = await model.generateContent([
        { text: systemInstruction },
        { text: `User Prompt: ${prompt}` },
      ]);

      const responseText = result.response.text().trim();
      const cleanJson = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      return {
        title: parsed.title || "Generated Document",
        contentHtml: parsed.contentHtml || `<p>${prompt}</p>`,
        summary: parsed.summary || "",
      };
    } catch (error: unknown) {
      console.warn("Gemini API call failed, falling back to smart document synthesizer:", error);
    }
  }

  // Gracefully generate rich, structured document using built-in intelligent synthesizer
  return generateSmartFallbackDocument(prompt, category, tone);
}

export async function rewriteDocumentText(
  text: string,
  instruction?: string,
  tone = "Professional"
): Promise<{ rewrittenText: string }> {
  const genAI = getGeminiClient();

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const promptText = `
You are an expert document editor.
Improve the following text according to these parameters:
- Desired Tone: ${tone}
${instruction ? `- Specific Instruction: ${instruction}` : "- Improve clarity, vocabulary, sentence flow, and grammar."}

Original text:
"""${text}"""

Return ONLY the rewritten text with no introductory or meta comments.
`;

      const result = await model.generateContent(promptText);
      return {
        rewrittenText: result.response.text().trim(),
      };
    } catch (error: unknown) {
      console.warn("Gemini API call failed for rewrite, using smart fallback:", error);
    }
  }

  return rewriteSmartFallbackText(text, instruction, tone);
}

export async function summarizeDocumentText(
  text: string,
  format = "Executive summary"
): Promise<{ summary: string }> {
  const genAI = getGeminiClient();

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const promptText = `
Summarize the following document content into a concise, professional summary (${format}):

"""${text}"""

Return only the summary.
`;

      const result = await model.generateContent(promptText);
      return {
        summary: result.response.text().trim(),
      };
    } catch (error: unknown) {
      console.warn("Gemini API call failed for summarize, using smart fallback:", error);
    }
  }

  return summarizeSmartFallbackText(text, format);
}
