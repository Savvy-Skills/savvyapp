import { create } from "zustand";
import {
  getLessonByID,
  getLessonProgress,
  getLessonSubmissions,
  getModuleLessons,
  postLessonProgress,
  postLessonSubmission,
} from "../services/coursesApi";
import {
  CustomSlide,
  Module,
  Lesson,
  LessonWithSlides,
  Slide,
  Submission,
  Answer,
} from "../types";
import { useAudioStore } from "./audioStore";

const createSubmission = (
  assessment_id: number,
  correct: boolean,
  answer: Answer[],
  lesson_id: number
): Submission => {
  return {
    id: 0,
    created_at: Date.now(),
    assessment_id,
    lessons_id: lesson_id,
    submissionTime: Date.now(),
    isCorrect: correct,
    answer,
  };
};

function createCustomSlide(
  type: string,
  module_id: number,
  lesson: LessonWithSlides
): CustomSlide {
  if (type === "first") {
    return {
      name: `Intro: ${lesson.name}`,
      order: 0,
      slide_id: 0,
      created_at: Date.now(),
      published: true,
      module_id: module_id,
      type: "Custom",
      subtype: "first",
      image: `${lesson.lesson_info.intro_image}`,
    };
  } else {
    return {
      name: `Stats`,
      order: 999,
      slide_id: 999999,
      created_at: Date.now(),
      published: true,
      module_id: module_id,
      type: "Custom",
      subtype: "last",
      image: `${lesson.lesson_info.intro_image}`,
    };
  }
}

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

  error: string | null;
  isLoading: boolean;

  fetchModuleLessons: (module_id: number) => Promise<void>;
  getLessonById: (id: number) => Promise<void>;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;
  setSubmittableState: (
    index: number,
    isSubmittable: boolean,
    source?: string
  ) => void;
  setCorrectnessState: (index: number, isCorrect: boolean | null) => void;
  submitAssessment: (assessment_id: number) => void;
  markSlideAsCompleted: (index: number) => void;
  checkSlideCompletion: (data?: any) => void;
  setScrollToEnd: (scrollFn: () => void) => void;
  isCurrentSlideSubmittable: () => boolean;

  isNavMenuVisible: boolean;
  setNavMenuVisible: (isVisible: boolean) => void;
  clearCurrentLesson: () => void;
  showIncorrect: boolean;
  setShowIncorrect: (show: boolean) => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  lessons: [],
  currentSlideIndex: 0,
  prevSlideIndex: 0,
  currentLesson: undefined,
  submittableStates: {},
  correctnessStates: {},
  submittedAssessments: [],
  completedSlides: [],
  scrollToEnd: null,
  isLoading: false,
  error: null,
  showIncorrect: false,

  setShowIncorrect: (show) => set({ showIncorrect: show }),

  fetchModuleLessons: async (module_id: number) => {
    try {
      const moduleResponse = await getModuleLessons(module_id);
      set({ lessons: moduleResponse.lessons });
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  },

  getLessonById: async (id: number) => {
    try {
      set({ isLoading: true });
      const lesson = await getLessonByID(id);
      const progress = await getLessonProgress(id);
	  const submissions = await getLessonSubmissions(id);

      const sorted = lesson.slides.sort((a, b) => a.order - b.order);

      const firstSlide: CustomSlide = createCustomSlide(
        "first",
        lesson.module_id,
        lesson
      );
      const lastSlide: CustomSlide = createCustomSlide(
        "last",
        lesson.module_id,
        lesson
      );

      sorted.unshift(firstSlide);
      sorted.push(lastSlide);

      let progressArray = progress.id
        ? progress.progress
        : Array(sorted.length).fill(false);

      set({
        currentLesson: {
          ...lesson,
          slides: sorted,
        },
        completedSlides: progressArray,
		submittedAssessments: submissions,
        isLoading: false,
      });
    } catch (error) {
      console.log("error");
      console.error("Error fetching module:", error);
    }
  },

  setCurrentSlideIndex: (index: number) =>
    set((state) => ({
      prevSlideIndex: state.currentSlideIndex,
      currentSlideIndex: index,
    })),

  nextSlide: () => {
    const { currentSlideIndex, currentLesson } = get();
    if (currentLesson && currentSlideIndex < currentLesson.slides.length - 1) {
      set((state) => ({
        prevSlideIndex: state.currentSlideIndex,
        currentSlideIndex: currentSlideIndex + 1,
      }));
    }
  },

  previousSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set((state) => ({
        prevSlideIndex: state.currentSlideIndex,
        currentSlideIndex: currentSlideIndex - 1,
      }));
    }
  },

  setSubmittableState: (index, isSubmittable, source) => {
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
    });
  },

  setCorrectnessState: (index, isCorrect) =>
    set((state) => {
      if (state.correctnessStates[index] === isCorrect) {
        return state; // Return the current state if there's no change
      }
      return {
        correctnessStates: { ...state.correctnessStates, [index]: isCorrect },
      };
    }),

  submitAssessment: async (assessment_id) => {
    const {
      currentSlideIndex,
      correctnessStates,
      checkSlideCompletion,
      setSubmittableState,
      currentLesson,
    } = get();

    const quizMode = currentLesson?.quiz;
    const isCorrect = correctnessStates[currentSlideIndex] || false;
    if (!currentLesson) return;

    useAudioStore
      .getState()
      .playSound(isCorrect ? "success" : "failVariant", 0.6);

	const placeHolderSubmission = createSubmission(
	  assessment_id,
	  isCorrect,
	  [{ text: "25" }],
	  currentLesson?.id
	);

    set((state) => ({
      submittedAssessments: state.submittedAssessments.some(
        (submission) => submission.assessment_id === assessment_id
      )
        ? state.submittedAssessments.map((submission) =>
            submission.assessment_id === assessment_id
              ? { ...submission, correct: isCorrect }
              : submission
          )
        : [
            ...state.submittedAssessments,
			{
			  ...placeHolderSubmission,
			},
          ],
    }));
    if (isCorrect || quizMode) {
      checkSlideCompletion();
    }
	// Post submission to server and replace placeholder submission
	await postLessonSubmission(currentLesson.id, placeHolderSubmission); 

    setSubmittableState(currentSlideIndex, false);
  },

  markSlideAsCompleted: async (index: number) => {
    const { completedSlides, currentLesson } = get();
    if (completedSlides[index] || !currentLesson) {
      return;
    }

    const newCompletedSlides = [...completedSlides];
    newCompletedSlides[index] = true;
    console.log("Marking slide as completed", {
      index,
      completedSlides,
      newCompletedSlides,
      currentLesson,
    });
    await postLessonProgress(currentLesson?.id, newCompletedSlides);
    set({ completedSlides: newCompletedSlides });
  },

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
        if (correctnessStates[currentSlideIndex] || currentLesson.quiz) {
          markSlideAsCompleted(currentSlideIndex);
        }
        break;
      case "Content":
        if (slide.content_info.type === "Video") {
          if (data?.completed) {
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
        currentLesson?.slides[currentSlideIndex].assessment_id;
      const submission = submittedAssessments.find(
        (submission) => submission.assessment_id === currentAssessmentID
      );
      return (
        submittableStates[currentSlideIndex] &&
        (!submission || !submission.isCorrect)
      );
    } else {
      return false;
    }
  },
  isNavMenuVisible: false,
  setNavMenuVisible: (isVisible) => set({ isNavMenuVisible: isVisible }),
  clearCurrentLesson: () =>
    set({
      currentLesson: undefined,
      currentSlideIndex: 0,
      completedSlides: [],
      submittableStates: {},
      correctnessStates: {},
      submittedAssessments: [],
    }),
}));
