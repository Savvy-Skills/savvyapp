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
	trigger: null,
	setSkipAssessments: (skip: boolean) => {
		set({ skipAssessments: skip });
	},
	setTrigger: (trigger: string) => {
		set({ trigger });
	},
	resetTrigger: () => {
		set({ trigger: null });
	},
	submitProgress: async () => {
		const { viewId, slides } = get();
		if (!viewId) return;
		const progress = slides.map((slide) => slide.completed || false);
		// TODO: HANDLE CASE WHERE POSTING PROGRESS FAILS
		await postViewProgress(viewId, progress);
	},
	completeSlide: async (index: number) => {
		const { viewId, slides, submitProgress } = get();
		if (!viewId || slides[index].completed) return;
		slides[index].completed = true;
		set({ slides: slides });
		// TODO: HANDLE CASE WHERE POSTING PROGRESS FAILS
		await submitProgress();
	},
	restartView: async () => {
		const { viewId } = get();
		if (!viewId) return;
		// TODO: HANDLE CASE WHERE RESTARTING VIEW FAILS
		await restartView(viewId);
		set({ viewStatus: "RESTARTING" });
		// Reset all game states
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
		get().checkSlideCompletion(index);
		set({ currentSlideIndex: index });
	},
	nextSlide: () => {
		const {currentSlideIndex, slides, checkSlideCompletion} = get();
		if (currentSlideIndex < slides.length - 1) {
			set({ currentSlideIndex: currentSlideIndex + 1 });
			checkSlideCompletion(currentSlideIndex+1);
		}
	},
	prevSlide: () => {
		const {currentSlideIndex, checkSlideCompletion} = get();
		if (currentSlideIndex > 0) {
			checkSlideCompletion(currentSlideIndex-1);
			set({ currentSlideIndex: currentSlideIndex - 1 });
		}
	},
	checkSlideCompletion: ( index: number) => {
		const {slides, completeSlide} = get();
		const slide = slides[index];
		if (!slide.completed) {
			switch (slide.type) {
				case "Content":
					if(slide.contents[0].type === "Image"){
						completeSlide(index);
					}
					break;
			}
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
			get().checkSlideCompletion(0);

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
		const {slides, currentSlideIndex, completeSlide} = get();
		const currentSlide = slides[currentSlideIndex];
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
			completeSlide(currentSlideIndex);
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
		const { currentSlideIndex, slides, view, viewId, completeSlide, submitProgress } = get();
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
						} : slide
					)
				}));
				// Slide is correct or quiz saved, so we can check the slide completion
				if (currentSlide.isCorrect || quizMode) {
					// Complete the slide
					completeSlide(currentSlideIndex);
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
