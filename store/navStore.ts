import { create } from "zustand";

interface NavStore {
  redirectedFrom: string | null;
  setRedirectedFrom: (value: string|null) => void;
}

export const useNavStore = create<NavStore>((set, get) => ({
  redirectedFrom: null,
  setRedirectedFrom: (value) => {
    set({ redirectedFrom: value });
  },
}));
