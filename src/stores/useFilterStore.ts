import { create } from "zustand";

interface FilterState {
  active: boolean;
  selectedKeys: Set<string>;
  indexVersion: number;

  toggleActive: () => void;
  toggleKey: (key: string) => void;
  setKeys: (keys: Set<string>) => void;
  clear: () => void;
  incrementIndexVersion: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  active: false,
  selectedKeys: new Set(),
  indexVersion: 0,

  toggleActive: () => set((state) => ({ active: !state.active })),
  toggleKey: (key) =>
    set((state) => {
      const next = new Set(state.selectedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return { selectedKeys: next };
    }),
  setKeys: (keys) => set({ selectedKeys: new Set(keys) }),
  clear: () => set({ active: false, selectedKeys: new Set() }),
  incrementIndexVersion: () => set((state) => ({ indexVersion: state.indexVersion + 1 })),
}));