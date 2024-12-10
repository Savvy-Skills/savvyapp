import { create } from "zustand";
import {
  getLessonByID,
  getLessonProgress,
  getLessonSubmissions,
  getModuleLessons,
  postLessonProgress,
  postLessonSubmission,
  restartLesson,
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
  answer: AssessmentAnswer,
  lesson_id: number,
  submission_id: number
): Submission => {
  return {
    id: submission_id,
    created_at: Date.now(),
    assessment_id,
    lessons_id: lesson_id,
    submissionTime: Date.now(),
    isCorrect: correct,
    answer: answer.answer,
    revealed: answer.revealed,
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

export interface AssessmentAnswer {
  answer: Answer[];
  revealed: boolean;
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
  answers: AssessmentAnswer[];
  setAnswer: (index: number, answer: AssessmentAnswer) => void;

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
  checkSlideCompletion: (data?: any, source?: string) => void;
  setScrollToEnd: (scrollFn: () => void) => void;
  isCurrentSlideSubmittable: () => boolean;

  isNavMenuVisible: boolean;
  setNavMenuVisible: (isVisible: boolean) => void;
  clearCurrentLesson: () => void;
  showIncorrect: boolean;
  setShowIncorrect: (show: boolean) => void;

  restartLesson: () => void;
  restartingLesson: boolean;
  stopRestartingLesson: () => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  lessons: [],
  restartingLesson: false,
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
  answers: [],
  setAnswer: (index, answers) => {
    set((state) => {
      if (state.answers[index] === answers) {
        return state; // Return the current state if there's no change
      }
      const newAnswers = [...state.answers];
      newAnswers[index] = answers;
      return {
        answers: newAnswers,
      };
    });
  },

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
      submittedAssessments,
      currentLesson,
      answers,
    } = get();

    const quizMode = currentLesson?.quiz;
    const isCorrect = correctnessStates[currentSlideIndex] || false;
    if (!currentLesson) return;

    const currentSubmission = submittedAssessments.find(
      (submission) => submission.assessment_id === assessment_id
    );

    useAudioStore
      .getState()
      .playSound(isCorrect ? "success" : "failVariant", 0.6);

    const placeHolderSubmission = createSubmission(
      assessment_id,
      isCorrect,
      answers[currentSlideIndex],
      currentLesson?.id,
      currentSubmission?.id || 0
    );

    const newSubmittedAssessments = submittedAssessments.some(
      (submission) => submission.assessment_id === assessment_id
    )
      ? submittedAssessments.map((submission) =>
          submission.assessment_id === assessment_id
            ? {
                ...submission,
                isCorrect,
                answer: answers[currentSlideIndex].answer,
                revealed: answers[currentSlideIndex].revealed,
              }
            : submission
        )
      : [
          ...submittedAssessments,
          {
            ...placeHolderSubmission,
          },
        ];

    set({ submittedAssessments: newSubmittedAssessments });

    if (isCorrect || quizMode) {
      checkSlideCompletion();
    }

    // Post submission to server and replace placeholder submission
    const postedSubmission = await postLessonSubmission(
      currentLesson.id,
      placeHolderSubmission
    );

    // Replace placeholder submission with the actual submission
    // Logic is as follows: Search for placeholder submission in the array of submissions with its ID=0
    // If found, replace it with the actual submission

    const newSubmissions = newSubmittedAssessments.map((submission) =>
      submission.id === 0 ? { ...postedSubmission } : submission
    );

    set({ submittedAssessments: newSubmissions });

    console.log("Submitting assessment", {
      submission: placeHolderSubmission,
      postedSubmission,
      newSubmissions,
      newSubmittedAssessments,
    });

    setSubmittableState(currentSlideIndex, false);
  },

  markSlideAsCompleted: async (index: number) => {
    const { completedSlides, currentLesson } = get();
    if (completedSlides[index] || !currentLesson) {
      return;
    }

    const newCompletedSlides = [...completedSlides];
    newCompletedSlides[index] = true;

    set({ completedSlides: newCompletedSlides });
    await postLessonProgress(currentLesson?.id, newCompletedSlides);
  },

  checkSlideCompletion: (data, source?) => {
    const {
      currentSlideIndex,
      markSlideAsCompleted,
      currentLesson,
      correctnessStates,
    } = get();
    const slide = currentLesson?.slides[currentSlideIndex];

    if (!slide) return;

	console.log("Checking slide completion", {data, source, slide, currentSlideIndex, currentLesson, correctnessStates});

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

  restartLesson: async () => {
    const { currentLesson } = get();
    if (!currentLesson) return;
    const lesson_id = currentLesson.id;
    await restartLesson(lesson_id);
    set({ restartingLesson: true });
  },

  stopRestartingLesson: () => set({ restartingLesson: false }),
}));
