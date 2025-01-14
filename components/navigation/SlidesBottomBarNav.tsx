import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Button } from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import CustomNavMenu from "../CustomNavMenu";
import { hexToRgbA } from "@/utils/utilfunctions";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { Colors } from "@/constants/Colors";
import { FeedbackModal } from "../FeedbackModal";
import ConfirmationDialog from "../ConfirmationDialog";
import { router } from "expo-router";
import { generateColors } from "@/utils/utilfunctions";

const navButtonColors = generateColors(Colors.navigationOrange, 0.5);
const checkButtonColors = generateColors(Colors.navigationWhite, 0.5);

type BottomBarNavProps = {
	onShowTopSheet: () => void;
};


const BottomBarNav = ({ onShowTopSheet }: BottomBarNavProps) => {
	const {
		previousSlide,
		currentView,
		currentSlideIndex,
		nextSlide,
		submitAssessment,
		isCurrentSlideSubmittable,
		isNavMenuVisible,
		setNavMenuVisible,
		completedSlides,
		restartView,
		hiddenFeedbacks,
		setHiddenFeedback,
		submittedAssessments,
		triggerTryAgain,
		triggerScrollToEnd,
		setSubmittableState,
	} = useCourseStore();

	const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
	const [showRestartViewDialog, setShowRestartViewDialog] = useState(false);
	const [showFinishDialog, setShowFinishDialog] = useState(false);
	const showFeedbackModal = () => setFeedbackModalVisible(true);

	const showRestartDialog = () => {
		setShowRestartViewDialog(true);
	};
	const hideRestartDialog = () => {
		setShowRestartViewDialog(false);
	};

	let currentAssessmentID = undefined;

	const isLastSlide =
		currentView && currentSlideIndex === currentView.slides.length - 1;
	if (currentView?.slides[currentSlideIndex].type === "Assessment") {
		currentAssessmentID =
			currentView?.slides[currentSlideIndex].assessment_id;
	}
	const currentSlide = currentView?.slides[currentSlideIndex];

	const currentSubmissionIndex = submittedAssessments.findIndex(submission => currentView?.slides[currentSlideIndex].type === "Assessment" && submission.assessment_id === currentView.slides[currentSlideIndex].assessment_info?.id);
	const currentSubmission = submittedAssessments[currentSubmissionIndex];

	const revealedAnswer = currentSubmission?.revealed ?? false;


	const handleCheck = useCallback(() => {
		if (currentAssessmentID !== undefined) {
			submitAssessment(currentAssessmentID);
			setHiddenFeedback(currentSlideIndex, false);
			triggerScrollToEnd();
		}
	}, [currentAssessmentID, submitAssessment, triggerScrollToEnd]);

	const toggleMenu = useCallback(
		() => setNavMenuVisible(!isNavMenuVisible),
		[isNavMenuVisible, setNavMenuVisible]
	);

	const handleDismissMenu = useCallback(
		() => setNavMenuVisible(false),
		[setNavMenuVisible]
	);

	const handleShowCaptions = useCallback(() => {
		// Implement show captions functionality
		handleDismissMenu();
	}, [handleDismissMenu]);

	const handleExplanation = useCallback(() => {
		// Implement explanation functionality
		handleDismissMenu();
	}, [handleDismissMenu]);

	const handleReportProblem = useCallback(() => {
		// Implement report problem functionality
		handleDismissMenu();
	}, [handleDismissMenu]);

	const handlePreviousSlide = useCallback(() => {
		previousSlide();
		handleDismissMenu();
	}, [previousSlide, handleDismissMenu]);

	const handleNextSlide = useCallback(() => {
		nextSlide();
		handleDismissMenu();
	}, [nextSlide, handleDismissMenu]);

	const isCurrentSlideCompleted = completedSlides[currentSlideIndex];

	const handleFinish = useCallback(() => {
		// Implement finish functionality
		setShowFinishDialog(true);
	}, [handleDismissMenu]);

	const handleTryAgain = useCallback(() => {
		triggerTryAgain();
		setHiddenFeedback(currentSlideIndex, true);
		setSubmittableState(currentSlideIndex, false);
	}, [triggerTryAgain, setHiddenFeedback, currentSlideIndex]);

	const currentContents = currentSlide?.contents && currentSlide.contents.length > 0 ? currentSlide.contents.sort((a, b) => a.order - b.order) : [];
	const lastContent = currentContents[currentContents.length-1]


	const moduleViews = currentView?.module_info.views.sort((a, b) => a.order - b.order);
	const currentViewIndex = moduleViews?.findIndex(view => view.view_id === currentView?.id);
	const isLastView = moduleViews ? currentViewIndex === moduleViews.length - 1 : false;
	const isAssessment = currentView?.slides[currentSlideIndex].type === "Assessment";
	const isCorrect = currentSubmission && currentSubmission.isCorrect;

	const showBackgroundFeedback = isAssessment && currentSubmission && !hiddenFeedbacks[currentSlideIndex];

	const backgroundColor = !showBackgroundFeedback ? "none" : revealedAnswer ? generateColors(Colors.revealed, 0.2).muted : isCorrect ? generateColors(Colors.success, 0.2).muted : generateColors(Colors.error, 0.2).muted;
	const borderColor = !showBackgroundFeedback ? "none" : revealedAnswer ? generateColors(Colors.revealed, 0.2).normal : isCorrect ? generateColors(Colors.success, 0.2).normal : generateColors(Colors.error, 0.2).normal;
	const borderWidth = !showBackgroundFeedback ? 0 : 1;

	const MiddleButton = () => {
		const buttonLabel = currentSlide?.buttonLabel ? currentSlide.buttonLabel : currentSubmission && currentSubmission.revealed ? "GOT IT" : "CONTINUE";
		return (
			<>
				{isLastSlide ? (
					<Button
						mode="contained"
						onPress={handleFinish}
						style={[styles.checkButton]}
						labelStyle={localStyles.checkButtonLabel}
						dark={false}
						theme={{
							colors: {
								primary: checkButtonColors.normal,
								surfaceDisabled: checkButtonColors.muted,
							},
						}}
					>
						FINISH
					</Button>
				) : (
					<>
						{!currentAssessmentID || isCurrentSlideCompleted ? (
							<>
								{currentSlide?.type === "Content" &&
									lastContent.type === "Video" ? (
									<Button
										mode="contained"
										disabled={!isCurrentSlideCompleted}
										onPress={handleNextSlide}
										style={[styles.checkButton]}
										labelStyle={localStyles.checkButtonLabel}
										dark={false}
										theme={{
											colors: {
												primary: checkButtonColors.normal,
												surfaceDisabled: checkButtonColors.muted,
											},
										}}
									>
										{buttonLabel}
									</Button>
								) : (currentSubmission && !currentSubmission.isCorrect) ? (
									<Button
										mode="contained"
										style={[localStyles.incorrectButton]}
										labelStyle={localStyles.incorrectLabel}
										dark={false}
										onPress={handleNextSlide}
									>
										GOT IT
									</Button>
								) : (
									<Button
										mode="contained"
										disabled={!isCurrentSlideCompleted}
										onPress={handleNextSlide}
										style={[styles.checkButton]}
										labelStyle={localStyles.checkButtonLabel}
										dark={false}
										theme={{
											colors: {
												primary: checkButtonColors.normal,
												surfaceDisabled: checkButtonColors.muted,
											},
										}}
									>
										{buttonLabel}
									</Button>
								)}
							</>
						) : (currentSubmission && !currentSubmission.isCorrect && !hiddenFeedbacks[currentSlideIndex]) ? (
							<Button
								mode="contained"
								style={[localStyles.incorrectButton]}
								labelStyle={localStyles.incorrectLabel}
								dark={false}
								onPress={handleTryAgain}
							>
								TRY AGAIN
							</Button>
						) : (
							<Button
								mode="contained"
								disabled={!isCurrentSlideSubmittable()}
								onPress={handleCheck}
								style={[styles.checkButton]}
								labelStyle={localStyles.checkButtonLabel}
								dark={false}
								theme={{
									colors: {
										primary: checkButtonColors.normal,
										surfaceDisabled: checkButtonColors.muted,
									},
								}}
							>
								CHECK
							</Button>
						)}
					</>
				)}
			</>
		)
	}

	return (
		<View style={[localStyles.container, { backgroundColor: backgroundColor, borderColor: borderColor, borderWidth: borderWidth, borderTopWidth: 0 }]}>
			<View style={[localStyles.menusContainer]}>
				<CustomNavMenu
					visible={isNavMenuVisible}
					onDismiss={handleDismissMenu}
					onShowTopSheet={onShowTopSheet}
					showModal={showFeedbackModal}
					onRestart={showRestartDialog}
				/>
			</View>
			<View
				style={[
					styles.bottomNavigation,
					styles.centeredMaxWidth,
					localStyles.navMenu,
				]}
			>
				<IconButton
					icon="arrow-left"
					size={20}
					onPress={handlePreviousSlide}
					disabled={currentSlideIndex === 0}
					style={styles.navButton}
					mode="contained"
					iconColor="#000"
					theme={{
						colors: {
							surfaceVariant: navButtonColors.normal,
							surfaceDisabled: navButtonColors.muted,
						},
					}}
				/>
				<VerticalSeparator />
				<IconButton
					icon="dots-vertical"
					size={20}
					onPress={toggleMenu}
					mode="contained"
					iconColor="#000"
					containerColor="rgb(244, 187, 98)"
					style={styles.navButton}
				/>
				<MiddleButton />

				<VerticalSeparator />
				<IconButton
					icon="arrow-right"
					size={20}
					onPress={handleNextSlide}
					disabled={isLastSlide}
					style={styles.navButton}
					iconColor="#000"
					mode="contained"
					theme={{
						colors: {
							surfaceVariant: navButtonColors.normal,
							surfaceDisabled: navButtonColors.muted,
						},
					}}
				/>
			</View>
			<FeedbackModal
				visible={feedbackModalVisible}
				onDismiss={() => setFeedbackModalVisible(false)}
				currentViewInfo={{
					viewId: currentView?.id || 0,
					viewTitle: currentView?.name || "",
					currentIndex: currentSlideIndex,
				}}
				onSubmitFeedback={() => { }}
			/>
			<ConfirmationDialog
				visible={showRestartViewDialog}
				onDismiss={hideRestartDialog}
				onConfirm={restartView}
				title="Are you sure?"
				content="This will restart the view and you will lose your progress."
			/>
			<ConfirmationDialog
				visible={showFinishDialog}
				onDismiss={() => setShowFinishDialog(false)}
				onConfirm={() => {
					if (currentView && currentView.module_id) {
						if (isLastView) {
							router.dismissTo({
								pathname: "/modules/[id]",
								params: { id: currentView.module_id },
							});
						} else {
							const nextView = currentView?.module_info?.views[currentViewIndex! + 1];
							console.log({ nextView });
							router.dismissTo({
								pathname: "/views/[id]",
								params: { id: nextView?.view_id },
							});
						}
					}
				}}
				title={isLastView ? "This is the last view in this module. Are you sure you want to exit?" : "Are you ready to move on to the next view?"}
				content={isLastView ? "You can still check you answers later." : "You will go to the next view in this module."}
			/>
		</View>
	);
};

const localStyles = StyleSheet.create({
	navMenu: {
	},
	container: {
		position: "relative",
		paddingHorizontal: 8,
		paddingBottom: 8,
		maxWidth: SLIDE_MAX_WIDTH,
		alignSelf: "center",
		width: "100%",
	},
	menusContainer: {
		position: "absolute",
		bottom: 80,
		gap: 16,
		maxWidth: 300,
		alignSelf: "center",
		zIndex: 2,
	},
	checkButtonLabel: {
		fontSize: 18,
		lineHeight: 18,
		fontWeight: "bold",
		letterSpacing: 1,
	},
	incorrectLabel: {
		fontSize: 18,
		lineHeight: 18,
		fontWeight: "bold",
		letterSpacing: 1,
		color: Colors.orange,
	},
	incorrectButton: {
		flex: 1,
		backgroundColor: "#ffe7cc",
		borderRadius: 4,
	},
});

export default BottomBarNav;

function VerticalSeparator() {
	return <View style={styles.verticalSeparator} />;
}
