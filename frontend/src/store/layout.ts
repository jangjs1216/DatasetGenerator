import { create } from 'zustand';

interface LayoutState {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  hiddenColumns: string[];
  toggleColumn: (column: string) => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  viewMode: 'grid',
  hiddenColumns: [],
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleColumn: (column) => {
    const next = get().hiddenColumns.includes(column)
      ? get().hiddenColumns.filter((c) => c !== column)
      : [...get().hiddenColumns, column];
    set({ hiddenColumns: next });
  },
}));
