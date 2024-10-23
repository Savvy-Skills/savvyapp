import {create} from 'zustand';
import { fetchModuleById, fetchModules } from '../services/api';
import { Module, ModuleWithSlides } from '../types';

interface ModuleStore {
  modules: Module[];
  currentSlideIndex: number;
  currentModule: ModuleWithSlides | undefined;
  fetchModules: () => Promise<void>;
  getModuleById: (id: number) => Promise<void>;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  modules: [],
  currentSlideIndex: 0,
  currentModule: undefined,
  setCurrentSlideIndex: (index: number) => {
	set({ currentSlideIndex: index });
  },
  fetchModules: async () => {
    const modules = await fetchModules();
    set({ modules });
  },
  getModuleById: async (id: number) => {
	const module = await fetchModuleById(id);
	set({ currentModule: module });
  },
  nextSlide: () => {
	const { currentSlideIndex, currentModule } = get();
	if (currentModule && currentSlideIndex < currentModule.slides.length - 1) {
	  set({ currentSlideIndex: currentSlideIndex + 1 });
	}
  },
  previousSlide: () => {
	const { currentSlideIndex } = get();
	if (currentSlideIndex > 0) {
	  set({ currentSlideIndex: currentSlideIndex - 1 });
	}
  }

}));