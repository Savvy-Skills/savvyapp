import { create } from "zustand";
import { fetchModuleById, fetchModules } from "../services/moduleapi";
import { Module, ModuleWithSlides, Slide, Submission } from "../types";

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
  completedSlides: boolean[];
  markSlideAsCompleted: (index: number) => void;
  checkSlideCompletion: (data?: any) => void;
  scrollToEnd: (() => void) | null;
  setScrollToEnd: (scrollFn: () => void) => void;
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
    } catch (e) {
      console.error("Error fetching module:", { e });
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
  markSlideAsCompleted: (index: number) => {
    set((state) => {
      const newCompletedSlides = [...state.completedSlides];
      newCompletedSlides[index] = true;
      return { completedSlides: newCompletedSlides };
    });
  },

  checkSlideCompletion: (data: any) => {
    const {
      currentSlideIndex,
      markSlideAsCompleted,
      currentModule,
      correctnessStates,
    } = get();
    const slide = currentModule?.slides[currentSlideIndex];

    switch (slide?.type) {
      case "Assessment":
        // We have the submitted and correctness on the store. We can check if the user has submitted and if it's correct
        if (correctnessStates[currentSlideIndex] !== null) {
          markSlideAsCompleted(currentSlideIndex);
        }
        break;
      case "Content":
        if (slide.content_info.type === "Video") {
          if (data.progress >= 80) {
            // 80% watched
            markSlideAsCompleted(currentSlideIndex);
          }
        } else {
          // For images or text, mark as completed when viewed
          markSlideAsCompleted(currentSlideIndex);
        }
        break;
      case "Activity":
        // Assume the activity component will call this function with the completion status
        if (data.completed) {
          markSlideAsCompleted(currentSlideIndex);
        }
        break;
    }
  },
  scrollToEnd: null,
  setScrollToEnd: (scrollFn) => set({ scrollToEnd: scrollFn }),
}));
