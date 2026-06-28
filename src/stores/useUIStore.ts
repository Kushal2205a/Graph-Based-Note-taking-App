import { create } from "zustand";

interface UIState {
  relationshipInspectorOpen: boolean;
  selectedEdgeId: string | null;
  commandPaletteOpen: boolean;
  createEdgeDialog: {
    open: boolean;
    sourceId: string | null;
    targetId: string | null;
  };

  openRelationshipInspector: (edgeId: string) => void;
  closeRelationshipInspector: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openCreateEdgeDialog: (sourceId: string, targetId: string) => void;
  closeCreateEdgeDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  relationshipInspectorOpen: false,
  selectedEdgeId: null,
  commandPaletteOpen: false,
  createEdgeDialog: { open: false, sourceId: null, targetId: null },

  openRelationshipInspector: (edgeId) =>
    set({ relationshipInspectorOpen: true, selectedEdgeId: edgeId }),
  closeRelationshipInspector: () =>
    set({ relationshipInspectorOpen: false, selectedEdgeId: null }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openCreateEdgeDialog: (sourceId, targetId) =>
    set({ createEdgeDialog: { open: true, sourceId, targetId } }),
  closeCreateEdgeDialog: () =>
    set({ createEdgeDialog: { open: false, sourceId: null, targetId: null } }),
}));
