import { create } from "zustand";
import { getLessonsByID, getModuleLessons } from "../services/coursesApi";
import {
  CustomSlide,
  Module,
  Lesson,
  LessonWithSlides,
  Slide,
  Submission,
} from "../types";
import { useAudioStore } from "./audioStore";

interface CourseStore {
  lessons: Lesson[];
  currentSlideIndex: number;
  prevSlideIndex: number;
  currentLesson: LessonWithSlides | undefined;
  submittableStates: Record<number, boolean>;
  correctnessStates: Record<number, boolean | null>;
  submittedAssessments: Submission[];
  completedSlides: boolean[];
  scrollToEnd: (() => void) | null;

  error: string|null;
  isLoading: boolean;

  fetchModuleLessons: (module_id: number) => Promise<void>;
  getLessonById: (id: number) => Promise<void>;
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

  isNavMenuVisible: boolean;
  setNavMenuVisible: (isVisible: boolean) => void;
  clearCurrentLesson: () => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  lessons: [],
  currentSlideIndex: 0,
  prevSlideIndex:0,
  currentLesson: undefined,
  submittableStates: {},
  correctnessStates: {},
  submittedAssessments: [],
  completedSlides: [],
  scrollToEnd: null,
  isLoading: false,
  error: null,

  fetchModuleLessons: async (module_id: number) => {
    try {
      const lessons = await getModuleLessons(module_id);
      set({ lessons });
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  },

  getLessonById: async (id: number) => {
    try {
      set({ isLoading: true });
      const lesson = await getLessonsByID(id);
      const sorted = lesson.slides.toSorted((a, b) => a.order - b.order);
      const firstSlide: CustomSlide = {
        order: 0,
        slide_id: 0,
        quizMode: false,
        created_at: 1711977124397,
        published: true,
        module_id: id,
        type: "Custom",
        subtype: "first",
      };
      const lastSlide: CustomSlide = {
        order: 999,
        slide_id: 999999,
        quizMode: false,
        created_at: 1711977124397,
        published: true,
        module_id: id,
        type: "Custom",
        subtype: "last",
      };
      sorted.unshift(firstSlide);
      sorted.push(lastSlide);
      set({
        currentLesson: {
          ...lesson,
          slides: sorted,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching module:", error);
    }
  },

  setCurrentSlideIndex: (index: number) => set((state)=> ({ prevSlideIndex: state.currentSlideIndex, currentSlideIndex: index  })),

  nextSlide: () => {
    const { currentSlideIndex, currentLesson } = get();
    if (currentLesson && currentSlideIndex < currentLesson.slides.length - 1) {
		set((state)=> ({ prevSlideIndex: state.currentSlideIndex, currentSlideIndex: currentSlideIndex+1  }));
    }
  },

  previousSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set((state)=>({prevSlideIndex: state.currentSlideIndex, currentSlideIndex: currentSlideIndex - 1 }));
    }
  },

  setSubmittableState: (index, isSubmittable) =>
    set((state) => {
      if (state.submittableStates[index] === isSubmittable) {
        return state; // Return the current state if there's no change
      }
      return {
        submittableStates: {
          ...state.submittableStates,
          [index]: isSubmittable,
        },
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
      currentLesson,
    } = get();

    const quizMode = currentLesson?.slides[currentSlideIndex].quizMode || false;
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
    const {
      currentSlideIndex,
      markSlideAsCompleted,
      currentLesson,
      correctnessStates,
    } = get();
    const slide = currentLesson?.slides[currentSlideIndex];

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

      default:
        if (data?.viewed) {
          markSlideAsCompleted(currentSlideIndex);
        }
        break;
    }
  },

  setScrollToEnd: (scrollFn) => set({ scrollToEnd: scrollFn }),

  isCurrentSlideSubmittable: () => {
    const {
      currentSlideIndex,
      submittableStates,
      submittedAssessments,
      currentLesson,
    } = get();
    if (currentLesson?.slides[currentSlideIndex].type === "Assessment") {
      const currentAssessmentID =
        currentLesson?.slides[currentSlideIndex].question_id;
      const submission = submittedAssessments.find(
        (submission) => submission.question_id === currentAssessmentID
      );
      return (
        submittableStates[currentSlideIndex] &&
        (!submission || !submission.correct)
      );
    } else {
      return false;
    }
  },
  isNavMenuVisible: false,
  setNavMenuVisible: (isVisible) => set({ isNavMenuVisible: isVisible }),
  clearCurrentLesson: () =>
    set({ currentLesson: undefined, currentSlideIndex: 0 }),
}));