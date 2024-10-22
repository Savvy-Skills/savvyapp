import {create} from 'zustand';
import { fetchModuleById, fetchModules } from '../services/api';
import { Module, ModuleWithSlides } from '../types';

interface ModuleStore {
  modules: Module[];
  currentModule: ModuleWithSlides | undefined;
  fetchModules: () => Promise<void>;
  getModuleById: (id: number) => Promise<void>;

}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  modules: [],
  currentModule: undefined,
  fetchModules: async () => {
    const modules = await fetchModules();
    set({ modules });
  },
  getModuleById: async (id: number) => {
	const module = await fetchModuleById(id);
	set({ currentModule: module });
  }
}));