import { create } from 'zustand';

interface DataStore {
  cache: Record<string, any>;
  loadingStates: Record<string, boolean>;
  errors: Record<string, string | null>;
  
  setCache: (key: string, data: any) => void;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  
  getCache: (key: string) => any;
  getLoading: (key: string) => boolean;
  getError: (key: string) => string | null;
}

export const useDataStore = create<DataStore>((set, get) => ({
  cache: {},
  loadingStates: {},
  errors: {},

  setCache: (key, data) => set(state => ({ 
    cache: { ...state.cache, [key]: data } 
  })),

  setLoading: (key, loading) => set(state => ({ 
    loadingStates: { ...state.loadingStates, [key]: loading } 
  })),

  setError: (key, error) => set(state => ({ 
    errors: { ...state.errors, [key]: error } 
  })),

  getCache: (key) => get().cache[key],
  getLoading: (key) => get().loadingStates[key] || false,
  getError: (key) => get().errors[key] || null,
}));
