import { create } from 'zustand';

interface SessionState {
  token: string | null;
  activeProjectId: string | null;
  setToken: (token: string | null) => void;
  setActiveProject: (id: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  activeProjectId: null,
  setToken: (token) => set({ token }),
  setActiveProject: (id) => set({ activeProjectId: id }),
}));
