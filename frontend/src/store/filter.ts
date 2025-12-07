import { create } from 'zustand';

export interface FilterState {
  query: string;
  setQuery: (value: string) => void;
  serialize: () => string;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  query: '',
  setQuery: (value) => set({ query: value }),
  serialize: () => get().query.trim(),
}));
