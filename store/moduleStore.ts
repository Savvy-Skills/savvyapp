import { create } from "zustand";
import { fetchModuleById, fetchModules } from "../services/moduleapi";
import { Module, ModuleWithSlides, Slide, Submission } from "../types";
import { useAudioStore } from "./audioStore";

interface ModuleStore {
  modules: Module[];
  currentSlideIndex: number;
  currentModule: ModuleWithSlides | undefined;
  submittableStates: Record<number, boolean>;
  correctnessStates: Record<number, boolean | null>;
  submittedAssessments: Submission[];
  completedSlides: boolean[];
  scrollToEnd: (() => void) | null;

  fetchModules: () => Promise<void>;
  getModuleById: (id: number) => Promise<void>;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;
  setSubmittableState: (index: number, isSubmittable: boolean) => void;
  setCorrectnessState: (index: number, isCorrect: boolean | null) => void;
  submitAssessment: (question_id: number) => void;
  markSlideAsCompleted: (index: number) => void;
  checkSlideCompletion: (data?: any) => void;
  setScrollToEnd: (scrollFn: () => void) => void;
  isCurrentSlideSubmittable: () => boolean;
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  modules: [],
  currentSlideIndex: 0,
  currentModule: undefined,
  submittableStates: {},
  correctnessStates: {},
  submittedAssessments: [],
  completedSlides: [],
  scrollToEnd: null,

  fetchModules: async () => {
    try {
      const modules = await fetchModules();
      set({ modules });
    } catch (error) {
      console.error("Error fetching modules:", error);
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
    } catch (error) {
      console.error("Error fetching module:", error);
    }
  },

  setCurrentSlideIndex: (index: number) => set({ currentSlideIndex: index }),

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

  setSubmittableState: (index, isSubmittable) =>
    set((state) => {
      if (state.submittableStates[index] === isSubmittable) {
        return state; // Return the current state if there's no change
      }
      return {
        submittableStates: { ...state.submittableStates, [index]: isSubmittable },
      };
    }),

  setCorrectnessState: (index, isCorrect) =>
    set((state) => {
      if (state.correctnessStates[index] === isCorrect) {
        return state; // Return the current state if there's no change
      }
      return {
        correctnessStates: { ...state.correctnessStates, [index]: isCorrect },
      };
    }),

  submitAssessment: (question_id) => {
    const {
      currentSlideIndex,
      correctnessStates,
      submittedAssessments,
      checkSlideCompletion,
      setSubmittableState,
      currentModule,
    } = get();

    const quizMode = currentModule?.slides[currentSlideIndex].quizMode || false;
    const isCorrect = correctnessStates[currentSlideIndex] || false;

    useAudioStore
      .getState()
      .playSound(isCorrect ? "success" : "failVariant", 0.6);

    set((state) => ({
      submittedAssessments: state.submittedAssessments.some(
        (submission) => submission.question_id === question_id
      )
        ? state.submittedAssessments.map((submission) =>
            submission.question_id === question_id
              ? { ...submission, correct: isCorrect }
              : submission
          )
        : [...state.submittedAssessments, { question_id, correct: isCorrect }],
    }));

    setSubmittableState(currentSlideIndex, false);

    if (isCorrect || quizMode) {
      checkSlideCompletion();
    }
  },

  markSlideAsCompleted: (index: number) =>
    set((state) => {
      if (state.completedSlides[index]) {
        return state; // Return the current state if the slide is already completed
      }
      const newCompletedSlides = [...state.completedSlides];
      newCompletedSlides[index] = true;
      return { completedSlides: newCompletedSlides };
    }),

  checkSlideCompletion: (data: any) => {
    const { currentSlideIndex, markSlideAsCompleted, currentModule, correctnessStates } = get();
    const slide = currentModule?.slides[currentSlideIndex];

    if (!slide) return;

    switch (slide.type) {
      case "Assessment":
        if (correctnessStates[currentSlideIndex] !== null) {
          markSlideAsCompleted(currentSlideIndex);
        }
        break;
      case "Content":
        if (slide.content_info.type === "Video") {
          if (data?.progress >= 80) {
            markSlideAsCompleted(currentSlideIndex);
          }
        } else {
          markSlideAsCompleted(currentSlideIndex);
        }
        break;
      case "Activity":
        if (data?.completed) {
          markSlideAsCompleted(currentSlideIndex);
        }
        break;
    }
  },

  setScrollToEnd: (scrollFn) => set({ scrollToEnd: scrollFn }),

  isCurrentSlideSubmittable: () => {
    const { currentSlideIndex, submittableStates, submittedAssessments, currentModule } = get();
    const currentAssessmentID = currentModule?.slides[currentSlideIndex].question_id;
    const submission = submittedAssessments.find(
      (submission) => submission.question_id === currentAssessmentID
    );
    return submittableStates[currentSlideIndex] && (!submission || !submission.correct);
  },
}));