import { create } from "zustand";
import { getViewByID, getViewSubmissions, postViewProgress, postViewSubmission, restartView } from "@/services/coursesApi";
import { Answer, view } from "@/types";
import { ViewStore } from "@/types";
import { createSubmission, getCorrectAnswers } from "@/utils/utilfunctions";

export const useViewStore = create<ViewStore>((set, get) => ({
	viewId: null,
	skipAssessments: false,
	view: null,
	viewStatus: "LOADING",
	slides: [],
	currentSlideIndex: 0,
	setSkipAssessments: (skip: boolean) => {
		set({ skipAssessments: skip });
	},
	submitProgress: async () => {
		const { viewId, slides } = get();
		if (!viewId) return;
		const progress = slides.map((slide) => slide.completed || false);
		// TODO: HANDLE CASE WHERE POSTING PROGRESS FAILS
		await postViewProgress(viewId, progress);
	},
	completeSlide: async () => {
		const { viewId, currentSlideIndex, slides } = get();
		if (!viewId || slides[currentSlideIndex].completed) return;
		slides[currentSlideIndex].completed = true;
		set({ slides: slides });
		const progress = slides.map((slide) => slide.completed || false);
		// TODO: HANDLE CASE WHERE POSTING PROGRESS FAILS
		await postViewProgress(viewId, progress);
	},
	restartView: async () => {
		const { viewId } = get();
		if (!viewId) return;
		// TODO: HANDLE CASE WHERE RESTARTING VIEW FAILS
		await restartView(viewId);
		set({ viewStatus: "RESTARTING" });
		// Empty the slides, submissions, currentSlideIndex, and view
		set({ slides: [], currentSlideIndex: 0, view: null });
		// Fetch the view data again
		await get().fetchViewData(viewId);
	},
	setAnswer: (answer: Answer[], isCorrect: boolean, notSubmittable?: boolean) => {
		const slides = get().slides;
		const currentSlide = slides[get().currentSlideIndex];
		if (currentSlide) {
			currentSlide.answer = answer;
			currentSlide.isCorrect = isCorrect;
			currentSlide.submittable = answer.length > 0 && !notSubmittable;
			if (currentSlide.submitted) {
				currentSlide.submitted = false;
			}
		} 
		set({ slides: slides });
	},
	setCurrentSlideIndex: (index: number) => {
		// Check if the index is out of bounds
		if (index < 0 || index >= get().slides.length) {
			return;
		}
		// Set the current slide index
		set({ currentSlideIndex: index });
	},
	nextSlide: () => {
		const currentIndex = get().currentSlideIndex;
		const slides = get().slides;
		if (currentIndex < slides.length - 1) {
			set({ currentSlideIndex: currentIndex + 1 });
		}
	},
	prevSlide: () => {
		const currentIndex = get().currentSlideIndex;
		if (currentIndex > 0) {
			set({ currentSlideIndex: currentIndex - 1 });
		}
	},
	fetchViewData: async (viewId: number) => {
		set({ viewId, slides: [], viewStatus: "LOADING", view: null });

		try {

			// 1. Fetch View Data
			const view = await getViewByID(viewId);
			const sortedSlides = view.slides.slice().sort((a, b) => a.order - b.order);

			// 2. Remove Slides from View
			// const view = {
			// 	...view,
			// } as view;
			// 3. Get User Progress
			const progress = view.progress;
			// 4. Fetch Submissions
			const submissions = await getViewSubmissions(viewId);

			// Combine all data into single local state of slides
			const structuredSlides = sortedSlides.map((slide, index) => {
				// Check if the slide is completed
				const progressArray = progress ? progress.progress : Array(sortedSlides.length).fill(false);
				const isCompleted = progressArray[index];

				const slideObj: any = {
					...slide,
					completed: isCompleted,
					submittable: false,
				};
				// Check if the slide is an assessment
				const isAssessment = slide.type === "Assessment";
				if (isAssessment) {
					// Fetch the submission for the assessment
					const submission = submissions.find((s) => s.assessment_id === slide.assessment_id);
					// Check if the assessment has been revealed
					const isRevealed = submission ? submission.revealed : false;
					// Check if the assessment is correct
					const isCorrect = submission ? submission.isCorrect : false;
					// Get the initial answer for the assessment
					const initialAnswer = submission ? submission.answer : [];
					// Add the answer, revealed, and correct to the slide object
					slideObj["submission_id"] = submission?.id || 0;
					slideObj["answer"] = initialAnswer;
					slideObj["submitted"] = submission ? true : false;
					slideObj["revealed"] = isRevealed;
					slideObj["isCorrect"] = isCorrect;
				}
				return slideObj;
			});
			set({ slides: structuredSlides, viewStatus: "READY", view });

		} catch (error) {
			console.error(error);
		}
	},
	toggleExplanation: () => {
		const slides = get().slides;
		const currentSlide = slides[get().currentSlideIndex];
		currentSlide.showExplanation = !currentSlide.showExplanation;
		set({ slides: slides });
	},
	revealAnswer: async () => {
		const slides = get().slides;
		const currentSlide = slides[get().currentSlideIndex];
		const viewId = get().viewId;
		if (!viewId) return;

		// Function to get correct answers, based on the slide type
		const correctAnswers = getCorrectAnswers(currentSlide);
		if (currentSlide.type === "Assessment" && currentSlide.assessment_id && currentSlide.submission_id) {
			currentSlide.revealed = true;
			currentSlide.submittable = false;
			currentSlide.submitted = true;
			currentSlide.completed = true;
			currentSlide.isCorrect = true;
			currentSlide.answer = correctAnswers;
			set({ slides: slides });
			get().completeSlide();
			const placeHolderSubmission = createSubmission(
				currentSlide.assessment_id,
				true,
				{ answer: correctAnswers, revealed: true },
				viewId,
				currentSlide.submission_id
			);
			// TODO: HANDLE CASE WHERE POSTING SUBMISSION FAILS
			// Post the submission
			await postViewSubmission(
				viewId,
				placeHolderSubmission
			);

		}
	},
	submitAnswer: async () => {
		const { currentSlideIndex, slides, view, viewId } = get();
		const currentSlide = slides[currentSlideIndex];
		const quizMode = view?.quiz || false;

		if (!viewId) return;
		if (currentSlide.type === "Assessment" && currentSlide.assessment_id) {
			if (currentSlide.submittable) {

				// Update the slide to be submitted
				set((state) => ({
					slides: state.slides.map((slide, index) =>
						index === state.currentSlideIndex ? {
							...slide,
							submitted: true,
							submittable: false,
							completed: slide.isCorrect ? true : quizMode
						} : slide
					)
				}));
				// Slide is correct or quiz saved, so we can check the slide completion
				if (currentSlide.isCorrect || quizMode) {
					// Complete the slide
					get().completeSlide();
				}

				// Create a placeholder submission
				const placeHolderSubmission = createSubmission(
					currentSlide.assessment_id,
					currentSlide.isCorrect || false,
					{ answer: currentSlide.answer || [], revealed: false },
					viewId,
					currentSlide.submission_id || 0
				);
				// TODO: HANDLE CASE WHERE POSTING SUBMISSION FAILS
				// Post the submission
				const postedSubmission = await postViewSubmission(
					viewId,
					placeHolderSubmission
				);

				// Update the slide with the posted submission id for future reference if it doesn't already have one
				if (postedSubmission.id && !currentSlide.submission_id) {
					set((state) => ({
						slides: state.slides.map((slide, index) =>
							index === state.currentSlideIndex ? {
								...slide,
								submission_id: postedSubmission.id
							} : slide
						)
					}));
				}
			}
		}
	},
	tryAgain: () => {
		const slides = get().slides;
		const currentSlide = slides[get().currentSlideIndex];
		currentSlide.submitted = false;
		currentSlide.completed = false;
		currentSlide.answer = [];
		currentSlide.isCorrect = false;
		set({ slides: slides });
	},
}));
