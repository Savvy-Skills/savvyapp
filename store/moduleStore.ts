import { create } from "zustand";
import { fetchModuleById, fetchModules } from "../services/moduleapi";
import { Module, ModuleWithSlides } from "../types";

interface ModuleStore {
  modules: Module[];
  currentSlideIndex: number;
  currentModule: ModuleWithSlides | undefined;
  fetchModules: () => Promise<void>;
  getModuleById: (id: number) => Promise<void>;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;
  discoveredSlides: boolean[];
  setDiscoveredSlides: (discoveredSlides: boolean[]) => void;
  submittableStates: boolean[];
  correctnessStates: (boolean | null)[];
  setSubmittableState: (index: number, isSubmittable: boolean) => void;
  setCorrectnessState: (index: number, isCorrect: boolean | null) => void;
  submitCurrentAssessment: () => void;
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  modules: [],
  discoveredSlides: [],
  submittableStates: [],
  correctnessStates: [],
  setSubmittableState: (index, isSubmittable) =>
    set((state) => {
      const newSubmittableStates = [...state.submittableStates];
      newSubmittableStates[index] = isSubmittable;
      return { submittableStates: newSubmittableStates };
    }),
  setCorrectnessState: (index, isCorrect) =>
    set((state) => {
      const newCorrectnessStates = [...state.correctnessStates];
      newCorrectnessStates[index] = isCorrect;
      return { correctnessStates: newCorrectnessStates };
    }),
  submitCurrentAssessment: () => {
    const { currentSlideIndex, correctnessStates } = get();
    const isCorrect = correctnessStates[currentSlideIndex];
    console.log(`Assessment submitted. Correct: ${isCorrect}`);
  },
  currentSlideIndex: 0,
  currentModule: undefined,
  setCurrentSlideIndex: (index: number) => {
    set({ currentSlideIndex: index });
  },
  fetchModules: async () => {
    try {
      const modules = await fetchModules();
      set({ modules });
    } catch {
      console.error("Error fetching modules");
    }
  },
  getModuleById: async (id: number) => {
    try {
      const module = await fetchModuleById(id);
      set({
        currentModule: {
          ...module,
          slides: module.slides.sort((a, b) => a.order - b.order),
        },
      });
      set({ discoveredSlides: new Array(module.slides.length).fill(false) });
    } catch {
      console.error("Error fetching module");
    }
  },
  nextSlide: () => {
    const { currentSlideIndex, currentModule, discoveredSlides } = get();
    if (currentModule && currentSlideIndex < currentModule.slides.length - 1) {
      if (!discoveredSlides[currentSlideIndex + 1]) {
        const newDiscoveredSlides = [...discoveredSlides];
        newDiscoveredSlides[currentSlideIndex + 1] = true;
        set({ discoveredSlides: newDiscoveredSlides });
      }
      set({ currentSlideIndex: currentSlideIndex + 1 });
    }
  },
  previousSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({ currentSlideIndex: currentSlideIndex - 1 });
    }
  },
  setDiscoveredSlides: (discoveredSlides: boolean[]) => {
    set({ discoveredSlides });
  },
}));
