import { create } from "zustand";
import { fetchModuleById, fetchModules } from "../services/moduleapi";
import { Module, ModuleWithSlides, Submission } from "../types";


interface ModuleStore {
  modules: Module[];
  currentSlideIndex: number;
  currentModule: ModuleWithSlides | undefined;
  fetchModules: () => Promise<void>;
  getModuleById: (id: number) => Promise<void>;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;
  submittableStates: boolean[];
  correctnessStates: (boolean | null)[];
  setSubmittableState: (index: number, isSubmittable: boolean) => void;
  setCorrectnessState: (index: number, isCorrect: boolean | null) => void;
  submitCurrentAssessment: () => void;
  submittedAssessments: Submission[];
  setSubmittedAssessments: (submittedAssessments: Submission[]) => void;
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  modules: [],
  completedSlides: [],
  submittableStates: [],
  correctnessStates: [],
  submittedAssessments: [],
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
  setSubmittedAssessments: (submittedAssessments) => {
    set({ submittedAssessments });
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
    } catch {
      console.error("Error fetching module");
    }
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
  },
}));
