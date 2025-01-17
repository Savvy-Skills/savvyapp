import { create } from "zustand";
import {
	getViewByID,
	getViewProgress,
	getViewSubmissions,
	getModule,
	postViewProgress,
	postViewSubmission,
	restartView,
} from "../services/coursesApi";
import {
	CustomSlide,
	ViewType,
	ViewWithSlides,
	Submission,
	Answer,
} from "../types";
import { useAudioStore } from "./audioStore";

const createSubmission = (
	assessment_id: number,
	correct: boolean,
	answer: AssessmentAnswer,
	view_id: number,
	submission_id: number
): Submission => {
	return {
		id: submission_id,
		created_at: Date.now(),
		assessment_id,
		views_id: view_id,
		submissionTime: Date.now(),
		isCorrect: correct,
		answer: answer.answer,
		revealed: answer.revealed,
	};
};

function createCustomSlide(
	type: string,
	module_id: number,
	view: ViewWithSlides
): CustomSlide {
	if (type === "intro") {
		return {
			name: `Intro: ${view.name}`,
			order: 0,
			slide_id: 0,
			created_at: Date.now(),
			published: true,
			module_id: module_id,
			type: "Custom",
			subtype: "intro",
			image: `${view.view_info.intro_image}`,
			contents: [],
		};
	} else if (type ==="mid"){
		return {
			name: `Mid: ${view.name}`,
			order: 998,
			slide_id: 9999998,
			created_at: Date.now(),
			published: true,
			module_id: module_id,
			type: "Custom",
			subtype: "mid",
			contents: [],
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
			subtype: "outro",
			image: `${view.view_info.intro_image}`,
			contents: [],
		};
	}
}

export interface AssessmentAnswer {
	answer: Answer[];
	revealed: boolean;
}

interface CourseStore {
	views: ViewType[];
	currentSlideIndex: number;
	prevSlideIndex: number;
	currentView: ViewWithSlides | undefined;
	submittableStates: Record<number, boolean>;
	correctnessStates: Record<number, boolean | null>;
	submittedAssessments: Submission[];
	completedSlides: boolean[];
	answers: AssessmentAnswer[];
	setAnswer: (index: number, answer: AssessmentAnswer) => void;
	hiddenFeedbacks: Record<number, boolean>;
	setHiddenFeedback: (index: number, state: boolean) => void;
	skipAssessments: boolean;
	setSkipAssessments: (state: boolean) => void;

	error: string | null;
	isLoading: boolean;

	fetchModuleViews: (module_id: number) => Promise<void>;
	getViewById: (id: number) => Promise<void>;
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
	isCurrentSlideSubmittable: () => boolean;

	isNavMenuVisible: boolean;
	setNavMenuVisible: (isVisible: boolean) => void;
	clearCurrentView: () => void;
	showIncorrect: boolean;
	setShowIncorrect: (show: boolean) => void;

	restartView: () => void;
	restartingView: boolean;
	stopRestartingView: () => void;

	tryAgain: boolean;
	triggerTryAgain: () => void;
	setTryAgain: (state: boolean) => void;

	revealAnswer: boolean;
	triggerRevealAnswer: () => void;

	showExplanation: boolean;
	triggerShowExplanation: () => void;
	shownExplanations: boolean[];
	setShownExplanation: (index: number, state: boolean) => void;

	scrollToEnd: boolean;
	triggerScrollToEnd: () => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
	views: [],
	restartingView: false,
	currentSlideIndex: 0,
	prevSlideIndex: 0,
	currentView: undefined,
	submittableStates: {},
	correctnessStates: {},
	submittedAssessments: [],
	completedSlides: [],
	hiddenFeedbacks: {},
	shownExplanations: [],
	setHiddenFeedback: (index, state) => set({ hiddenFeedbacks: { ...get().hiddenFeedbacks, [index]: state } }),
	setShownExplanation: (index, state) => set({ shownExplanations: { ...get().shownExplanations, [index]: state } }),
	isLoading: false,
	error: null,
	showIncorrect: false,
	answers: [],
	scrollToEnd: false,
	triggerScrollToEnd: () => set((state) => ({ scrollToEnd: !state.scrollToEnd })),
	tryAgain: false,
	triggerTryAgain: () => set((state) => ({ tryAgain: !state.tryAgain })),
	revealAnswer: false,
	triggerRevealAnswer: () => set((state) => ({ revealAnswer: !state.revealAnswer })),
	showExplanation: false,
	triggerShowExplanation: () => set((state) => ({ showExplanation: !state.showExplanation })),
	setTryAgain: (state) => set({ tryAgain: state }),
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
	skipAssessments: false,
	setSkipAssessments: (state) => set({ skipAssessments: state }),

	setShowIncorrect: (show) => set({ showIncorrect: show }),

	fetchModuleViews: async (module_id: number) => {
		try {
			const moduleResponse = await getModule(module_id);
			set({ views: moduleResponse.views });
		} catch (error) {
			console.error("Error fetching views:", error);
		}
	},

	getViewById: async (id: number) => {
		try {
			set({ isLoading: true });
			const view = await getViewByID(id);
			const progress = await getViewProgress(id);
			const submissions = await getViewSubmissions(id);

			const sorted = view.slides.sort((a, b) => a.order - b.order);

			const firstSlide: CustomSlide = createCustomSlide(
				"intro",
				view.module_id,
				view
			);
			
			const lastSlide: CustomSlide = createCustomSlide(
				"outro",
				view.module_id,
				view
			);

			sorted.unshift(firstSlide);
			if ([1,10].includes(view.id)) {
				const midSlide: CustomSlide = createCustomSlide(
					"mid",
					view.module_id,
					view
				);
				sorted.push(midSlide);
			}
			sorted.push(lastSlide);

			let progressArray = progress.id
				? progress.progress
				: Array(sorted.length).fill(false);

			set({
				currentView: {
					...view,
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
		const { currentSlideIndex, currentView } = get();
		if (currentView && currentSlideIndex < currentView.slides.length - 1) {
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
			currentView,
			answers,
		} = get();

		const quizMode = currentView?.quiz;
		const isCorrect = correctnessStates[currentSlideIndex] || false;
		if (!currentView) return;

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
			currentView?.id,
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
		const postedSubmission = await postViewSubmission(
			currentView.id,
			placeHolderSubmission
		);

		// Replace placeholder submission with the actual submission
		// Logic is as follows: Search for placeholder submission in the array of submissions with its ID=0
		// If found, replace it with the actual submission

		const newSubmissions = newSubmittedAssessments.map((submission) =>
			submission.id === 0 ? { ...postedSubmission } : submission
		);

		set({ submittedAssessments: newSubmissions });

		setSubmittableState(currentSlideIndex, false);
	},

	markSlideAsCompleted: async (index: number) => {
		const { completedSlides, currentView } = get();
		if (completedSlides[index] || !currentView) {
			return;
		}

		const newCompletedSlides = [...completedSlides];
		newCompletedSlides[index] = true;

		set({ completedSlides: newCompletedSlides });
		await postViewProgress(currentView?.id, newCompletedSlides);
	},

	checkSlideCompletion: (data, source?) => {
		const {
			currentSlideIndex,
			markSlideAsCompleted,
			currentView,
			correctnessStates,
		} = get();
		const slide = currentView?.slides[currentSlideIndex];

		if (!slide) return;

		// console.log("Checking slide completion", { data, source, slide, currentSlideIndex, currentView, correctnessStates });

		switch (slide.type) {
			case "Assessment":
				if (correctnessStates[currentSlideIndex] || currentView.quiz) {
					markSlideAsCompleted(currentSlideIndex);
				}
				break;
			case "Content":
				if (slide.content_info?.type === "Video") {
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

	isCurrentSlideSubmittable: () => {
		const {
			currentSlideIndex,
			submittableStates,
			submittedAssessments,
			currentView,
		} = get();
		if (currentView?.slides[currentSlideIndex].type === "Assessment") {
			const currentAssessmentID =
				currentView?.slides[currentSlideIndex].assessment_id;
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
	clearCurrentView: () =>
		set({
			currentView: undefined,
			currentSlideIndex: 0,
			completedSlides: [],
			submittableStates: {},
			correctnessStates: {},
			submittedAssessments: [],
		}),

	restartView: async () => {
		const { currentView } = get();
		if (!currentView) return;
		const view_id = currentView.id;
		await restartView(view_id);
		set({ restartingView: true });
	},

	stopRestartingView: () => set({ restartingView: false }),
}));
