import { create } from "zustand";

export type DashboardSection =
  | "home"
  | "recent"
  | "my-docs"
  | "my-templates"
  | "public-templates"
  | "shared"
  | "favorites"
  | "trash"
  | "settings";

export type ViewLayout = "grid" | "list";

export interface DashboardState {
  activeSection: DashboardSection;
  layout: ViewLayout;
  searchQuery: string;
  categoryFilter: string;
  sortBy: "updatedAt_desc" | "newest" | "oldest" | "name_asc";

  setActiveSection: (section: DashboardSection) => void;
  setLayout: (layout: ViewLayout) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setSortBy: (sort: "updatedAt_desc" | "newest" | "oldest" | "name_asc") => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeSection: "home",
  layout: "grid",
  searchQuery: "",
  categoryFilter: "All",
  sortBy: "updatedAt_desc",

  setActiveSection: (activeSection) => set({ activeSection }),
  setLayout: (layout) => set({ layout }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setSortBy: (sortBy) => set({ sortBy }),
}));
