import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	View,
	StyleSheet,
	Pressable,
	Platform,
	ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import SlideRenderer from "../../../components/slides/SlideRenderer";
import BottomBarNav from "@/components/navigation/SlidesBottomBarNav";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import TopNavBar from "@/components/navigation/TopNavBar";
import AnimatedSlide from "@/components/slides/AnimatedSlide";
import { useCourseStore } from "@/store/courseStore";
import { useKeyPress } from "@/hooks/useKeyboard";
import TopSheet, { TopSheetRefProps } from "@/components/TopSheet";
import { ActivityIndicator, FAB, Text } from "react-native-paper";
import SlideListItem from "@/components/slides/SlideListItem";
import FeedbackComponent from "@/components/Feedback";
import LoadingIndicator from "@/components/LoadingIndicator";
import { CopilotProvider } from "react-native-copilot";

export default function ModuleDetail() {
	const ref = useRef<TopSheetRefProps>(null);

	const { id } = useLocalSearchParams();
	const {
		getViewById,
		currentView,
		currentSlideIndex,
		isNavMenuVisible,
		setNavMenuVisible,
		clearCurrentView,
		nextSlide,
		previousSlide,
		setCurrentSlideIndex,
		restartingView,
		stopRestartingView,
		completedSlides,
		submittedAssessments,
		hiddenFeedbacks,
		setHiddenFeedback,
		triggerTryAgain,
		triggerShowExplanation,
		triggerRevealAnswer,
		setShownExplanation,
		shownExplanations,
	} = useCourseStore();

	const [direction, setDirection] = useState<"forward" | "backward" | null>(
		null
	);
	const currentSubmissionIndex = submittedAssessments.findIndex(submission => currentView?.slides[currentSlideIndex].type === "Assessment" && submission.assessment_id === currentView.slides[currentSlideIndex].assessment_info?.id);
	const currentSubmission = submittedAssessments[currentSubmissionIndex];

	const prevIndexRef = useRef(currentSlideIndex);
	const [isInitialRender, setIsInitialRender] = useState(true);

	const revealedAnswer = currentSubmission?.revealed ?? false;

	const onPress = useCallback(() => {
		ref?.current?.scrollToEnd();
	}, []);


	useEffect(() => {
		clearCurrentView();
		getViewById(Number(id));
	}, [id]);

	useEffect(() => {
		if (restartingView) {
			clearCurrentView();
			getViewById(Number(id));
			stopRestartingView();
		}
	}, [restartingView]);

	const handleArrowRight = () => {
		if (currentView && currentSlideIndex < currentView.slides.length - 1) {
			nextSlide();
		}
	};
	const handleArrowLeft = () => {
		if (currentSlideIndex > 0) {
			previousSlide();
		}
	};

	if (Platform.OS === "web") {
		useKeyPress({
			ArrowRight: () => handleArrowRight(),
			ArrowLeft: () => handleArrowLeft(),
		});
	}

	useEffect(() => {
		if (currentSlideIndex !== prevIndexRef.current) {
			setDirection(
				currentSlideIndex > prevIndexRef.current ? "forward" : "backward"
			);
			prevIndexRef.current = currentSlideIndex;
			setIsInitialRender(false);
		}
	}, [currentSlideIndex]);

	const handlePressOutside = useCallback(() => {
		if (isNavMenuVisible) {
			setNavMenuVisible(false);
		}
	}, [isNavMenuVisible, setNavMenuVisible]);

	const handleTryAgain = useCallback(() => {
		triggerTryAgain();
		setHiddenFeedback(currentSlideIndex, true);
	}, [triggerTryAgain, setHiddenFeedback, currentSlideIndex]);

	const handleToggleExplanation = useCallback(() => {
		triggerShowExplanation();
		setShownExplanation(currentSlideIndex, !shownExplanations[currentSlideIndex]);
	}, [triggerShowExplanation, setShownExplanation, currentSlideIndex, shownExplanations]);

	const isAssessment = currentView?.slides[currentSlideIndex].type === "Assessment";

	if (!currentView || restartingView) {
		return <LoadingIndicator />
	}

	return (
		<ScreenWrapper style={{ overflow: "hidden" }}>
				<Pressable style={[styles.pressableArea]} onPress={handlePressOutside}>
					<TopNavBar />
					<>
					{/* TopSheet */}
					<TopSheet ref={ref}>
						<ScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>
							{currentView.slides.map((slide, index) => (
								<SlideListItem
									key={`slide-${slide.slide_id}-${index}`}
									name={slide.name}
									type={slide.type}
									subtype={
										slide.type === "Assessment"
											? slide.assessment_info?.type
											: slide.type === "Content"
												? slide.content_info?.type
												: undefined
									}
									isCompleted={completedSlides[index]}
									isActive={index === currentSlideIndex}
									onPress={() => setCurrentSlideIndex(index)}
								/>
							))}
						</ScrollView>
					</TopSheet>
					{/* Slides */}
					<View style={styles.slidesContainer}>
						{currentView.slides.map((slide, index) => (
							<AnimatedSlide
								key={`${slide.slide_id}-${index}`}
								isActive={index === currentSlideIndex}
								direction={index === currentSlideIndex ? direction : null}
								isInitialRender={
									isInitialRender && index === currentSlideIndex
								}
							>
								<SlideRenderer
									slide={slide}
									index={index}
									quizMode={currentView.quiz}
								/>
							</AnimatedSlide>
						))}
					</View>
					<View style={{ flexDirection: "column" }}>
						{(isAssessment && currentSubmission && !hiddenFeedbacks[currentSlideIndex]) && (
							<FeedbackComponent
								correctness={currentSubmission?.isCorrect}
								revealed={revealedAnswer}
								onTryAgain={handleTryAgain}
								onRevealAnswer={triggerRevealAnswer}
								onShowExplanation={handleToggleExplanation}
								quizMode={currentView.quiz}
								showExplanation={shownExplanations[currentSlideIndex]}
								slideIndex={currentSlideIndex}
							/>
						)}
						<BottomBarNav onShowTopSheet={onPress} />
					</View>
					</>
			</Pressable>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	pressableArea: {
		flex: 1,
		cursor: "auto",
	},
	slidesContainer: {
		flex: 1,
		position: "relative",
		flexDirection: "column",
	},
	fab: {
		position: "absolute",
		margin: 8,
		right: 0,
		bottom: 68,
	},
});
