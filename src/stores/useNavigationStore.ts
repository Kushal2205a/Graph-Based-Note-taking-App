import { create } from "zustand";
import type { Breadcrumb } from "../types";

interface NavigationState {
  currentGraphId: string | null;
  breadcrumbs: Breadcrumb[];
  canGoBack: boolean;
  canGoForward: boolean;

  setCurrentGraphId: (id: string | null) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  setCanGoBack: (can: boolean) => void;
  setCanGoForward: (can: boolean) => void;
  reset: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentGraphId: null,
  breadcrumbs: [],
  canGoBack: false,
  canGoForward: false,

  setCurrentGraphId: (id) => set({ currentGraphId: id }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  setCanGoBack: (can) => set({ canGoBack: can }),
  setCanGoForward: (can) => set({ canGoForward: can }),
  reset: () =>
    set({
      currentGraphId: null,
      breadcrumbs: [],
      canGoBack: false,
      canGoForward: false,
    }),
}));
