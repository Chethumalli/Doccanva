import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { DEFAULT_TEMPLATES } from "../src/lib/templates/defaultTemplates";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/docucanvas";

async function seed() {
  console.log("Connecting to MongoDB at:", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  } catch (err: any) {
    console.error("MongoDB is not currently running locally or connection failed:", err.message);
    console.log("Note: DocuCanvas has an in-memory fallback store active so all sample templates work seamlessly in your browser even without local MongoDB!");
    process.exit(0);
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Failed to get MongoDB db reference");
  }

  console.log("Connected! Seeding all 10 category sample templates into MongoDB...");

  // 1. Create Demo User
  const usersCollection = db.collection("users");
  let demoUser = await usersCollection.findOne({ email: "designer@docucanvas.com" });

  if (!demoUser) {
    const insertResult = await usersCollection.insertOne({
      name: "Chethan Kumar",
      email: "designer@docucanvas.com",
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chethan",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    demoUser = { _id: insertResult.insertedId };
    console.log("Created demo user:", demoUser._id);
  }

  const userId = demoUser._id;

  // 2. Templates
  const templatesCollection = db.collection("templates");

  for (const tpl of DEFAULT_TEMPLATES) {
    const existing = await templatesCollection.findOne({ title: tpl.title });
    if (!existing) {
      await templatesCollection.insertOne({
        ownerId: userId,
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        visibility: "public",
        usageCount: tpl.usageCount || 10,
        schemaVersion: 1,
        editorContent: tpl.editorContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Seeded template [${tpl.category}]: "${tpl.title}"`);
    }
  }

  // 3. Sample Welcome Document
  const docsCollection = db.collection("documents");
  const existingDoc = await docsCollection.findOne({ ownerId: userId });
  if (!existingDoc) {
    await docsCollection.insertOne({
      ownerId: userId,
      title: "Welcome to DocuCanvas.docx",
      editorContent: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to DocuCanvas!" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Congratulations on launching DocuCanvas. This document is fully editable. You can format headings, insert tables, test Google Gemini AI generation, and click 'Export DOCX' to download a valid Microsoft Word file.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Quick Tips" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Click 'AI Assistant' in the toolbar to draft or rewrite passages." }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Click 'Share' to invite teammates by email or create a view/edit link." }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Click 'Export DOCX' to download a clean OpenXML Word document." }] }],
              },
            ],
          },
        ],
      },
      schemaVersion: 1,
      visibility: "private",
      currentVersion: 1,
      wordCount: 88,
      characterCount: 520,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Seeded sample document for demo user.");
  }

  console.log("Seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
