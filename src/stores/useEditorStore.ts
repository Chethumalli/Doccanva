import { create } from "zustand";

export interface EditorState {
  id: string | null;
  title: string;
  editorJson: Record<string, unknown> | null;
  wordCount: number;
  characterCount: number;
  isSaving: boolean;
  saveStatus: "saved" | "saving" | "unsaved" | "error";
  lastSavedAt: Date | null;
  saveError: string | null;
  canEdit: boolean;
  visibility: "private" | "public";
  currentVersion: number;

  // Actions
  initDocument: (doc: {
    id: string;
    title: string;
    editorContent: Record<string, unknown>;
    canEdit: boolean;
    visibility: "private" | "public";
    currentVersion: number;
    wordCount?: number;
    characterCount?: number;
  }) => void;
  setTitle: (title: string) => void;
  setEditorJson: (json: Record<string, unknown>) => void;
  setCounts: (words: number, chars: number) => void;
  setSaveStatus: (status: "saved" | "saving" | "unsaved" | "error", error?: string) => void;
  setVisibility: (visibility: "private" | "public") => void;
  incrementVersion: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  id: null,
  title: "Untitled Document",
  editorJson: null,
  wordCount: 0,
  characterCount: 0,
  isSaving: false,
  saveStatus: "saved",
  lastSavedAt: null,
  saveError: null,
  canEdit: true,
  visibility: "private",
  currentVersion: 1,

  initDocument: (doc) =>
    set({
      id: doc.id,
      title: doc.title,
      editorJson: doc.editorContent,
      canEdit: doc.canEdit,
      visibility: doc.visibility,
      currentVersion: doc.currentVersion,
      wordCount: doc.wordCount || 0,
      characterCount: doc.characterCount || 0,
      saveStatus: "saved",
      lastSavedAt: new Date(),
      saveError: null,
    }),

  setTitle: (title) =>
    set({
      title,
      saveStatus: "unsaved",
    }),

  setEditorJson: (editorJson) =>
    set({
      editorJson,
      saveStatus: "unsaved",
    }),

  setCounts: (wordCount, characterCount) =>
    set({ wordCount, characterCount }),

  setSaveStatus: (saveStatus, saveError) =>
    set((state) => ({
      saveStatus,
      isSaving: saveStatus === "saving",
      saveError: saveError || null,
      lastSavedAt: saveStatus === "saved" ? new Date() : state.lastSavedAt,
    })),

  setVisibility: (visibility) => set({ visibility }),

  incrementVersion: () =>
    set((state) => ({ currentVersion: state.currentVersion + 1 })),
}));
