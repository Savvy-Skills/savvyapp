import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Button } from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import CustomNavMenu from "@/components/navigation/CustomNavMenu";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { Colors } from "@/constants/Colors";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";
import { router } from "expo-router";
import { generateColors } from "@/utils/utilfunctions";
import { useAudioStore } from "@/store/audioStore";
import { useViewStore } from "@/store/viewStore";

const navButtonColors = generateColors(Colors.navigationPurple, 0.5);
const checkButtonColors = generateColors(Colors.navigationOrange, 0.5);

type BottomBarNavProps = {
	onShowTopSheet: () => void;
	onShowBottomSheet: () => void;
	showBottomSheet: boolean;
	onCloseBottomSheet: () => void;
};


const BottomBarNav = ({ onShowTopSheet, onShowBottomSheet, showBottomSheet, onCloseBottomSheet }: BottomBarNavProps) => {

	const { playSound } = useAudioStore();
	const { currentSlideIndex, view, slides, prevSlide, nextSlide, submitAnswer, skipAssessments, setSkipAssessments, restartView, tryAgain } = useViewStore();

	const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
	const [showRestartViewDialog, setShowRestartViewDialog] = useState(false);
	const [showFinishDialog, setShowFinishDialog] = useState(false);
	const [navMenuVisible, setNavMenuVisible] = useState(false);
	const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
	const showFeedbackModal = () => setFeedbackModalVisible(true);

	const showRestartDialog = () => {
		setShowRestartViewDialog(true);
	};
	const hideRestartDialog = () => {
		setShowRestartViewDialog(false);
	};

	const hideConfirmationDialog = () => {
		setShowConfirmationDialog(false);
	};


	const isLastSlide = slides.length - 1 === currentSlideIndex;
	const currentSlide = slides[currentSlideIndex];
	const revealedAnswer = currentSlide?.revealed ?? false;
	const isCurrentSlideCompleted = currentSlide?.completed ?? false;

	const handleCheck = useCallback(() => {
		if (currentSlide?.type === "Assessment") {
			if (currentSlide.submittable) {
				if (currentSlide.isCorrect) {
					playSound("success", 0.5);
				} else {
					playSound("failVariant", 0.5);
				}
				submitAnswer();
			} else {
				onShowBottomSheet();
			}
		}
	}, [showBottomSheet, currentSlide]);

	const toggleMenu = useCallback(
		() => setNavMenuVisible((prev) => !prev),
		[navMenuVisible, setNavMenuVisible]
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
		prevSlide();
		handleDismissMenu();
	}, [prevSlide, handleDismissMenu]);

	const handleNextSlide = useCallback(() => {
		if (currentSlide?.type === "Assessment" && !isCurrentSlideCompleted && !skipAssessments) {
			setShowConfirmationDialog(true);
		} else {
			nextSlide();
			handleDismissMenu();
		}
	}, [nextSlide, handleDismissMenu, isCurrentSlideCompleted, skipAssessments]);


	const handleFinish = useCallback(() => {
		// Implement finish functionality
		setShowFinishDialog(true);
	}, [handleDismissMenu]);

	const handleTryAgain = useCallback(() => {
		tryAgain();
	}, [tryAgain]);


	const moduleViews = view?.module_info.views.sort((a, b) => a.order - b.order);
	const currentViewIndex = moduleViews?.findIndex(view => view.view_id === view?.id);
	const isLastView = moduleViews ? currentViewIndex === moduleViews.length - 1 : false;

	const MiddleButton = () => {
		const { type, submitted, isCorrect, assessment_id, buttonLabel: slideLabel } = currentSlide || {};
		const isAssessment = type === "Assessment";
		const isCompleted = isCurrentSlideCompleted;
		const isIncorrectAssessment = isAssessment && submitted && !isCorrect;

		// Determine button label
		const buttonLabel = slideLabel ||
			(isAssessment && submitted && currentSlide?.revealed) ? "Got it" : "Continue";

		// Common button props
		const baseButtonProps = {
			mode: "contained" as const,
			dark: false,
			style: [styles.checkButton],
			labelStyle: styles.buttonLabel,
			theme: {
				colors: {
					primary: checkButtonColors.normal,
					surfaceDisabled: checkButtonColors.muted,
				},
			},
		};

		// Handle last slide case first
		// if (isLastSlide) {
		// 	return (
		// 		<Button
		// 			{...baseButtonProps}
		// 			onPress={handleFinish}
		// 			theme={{
		// 				colors: {
		// 					primary: checkButtonColors.normal,
		// 					surfaceDisabled: checkButtonColors.muted,
		// 				},
		// 			}}
		// 		>
		// 			FINISH
		// 		</Button>
		// 	);
		// }

		// Completed slide or non-assessment
		if (!assessment_id || isCompleted) {
			const buttonVariant = isIncorrectAssessment ? 'incorrect' :
				revealedAnswer ? 'revealed' :
					isAssessment ? 'correct' : 'normal';

			return (
				<Button
					{...baseButtonProps}
					onPress={handleNextSlide}
					style={[
						styles.checkButton,
						buttonVariant === 'incorrect' && styles.incorrectButton,
						buttonVariant === 'revealed' && styles.revealedButton,
						buttonVariant === 'correct' && styles.correctButton
					]}
					labelStyle={[
						styles.buttonLabel,
						buttonVariant === 'incorrect' && styles.incorrectLabel,
						buttonVariant === 'revealed' && styles.revealedLabel,
						buttonVariant === 'correct' && styles.correctLabel
					]}
				>
					{buttonLabel}
				</Button>
			);
		}

		// Incomplete assessment slide
		if (isIncorrectAssessment) {
			return (
				<Button
					{...baseButtonProps}
					style={[styles.checkButton, styles.incorrectButton]}
					labelStyle={[styles.buttonLabel, styles.incorrectLabel]}
					onPress={handleTryAgain}
				>
					Try again
				</Button>
			);
		}

		// Default case (check button)
		return (
			<Button
				{...baseButtonProps}
				onPress={handleCheck}
				theme={{
					colors: {
						primary: checkButtonColors.normal,
						surfaceDisabled: checkButtonColors.muted,
					},
				}}
			>
				Check
			</Button>
		);
	};

	return (
		<View style={[localStyles.container]}>
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
					iconColor={Colors.primaryDarker}
					theme={{
						colors: {
							surfaceVariant: navButtonColors.normal,
							surfaceDisabled: navButtonColors.muted,
						},
					}}
				/>
				<IconButton
					icon="dots-vertical"
					size={20}
					onPress={toggleMenu}
					mode="contained"
					iconColor={Colors.primaryDarker}
					containerColor={Colors.navigationPurple}
					style={styles.navButton}
				/>
				<MiddleButton />

				<IconButton
					icon="arrow-right"
					size={20}
					onPress={handleNextSlide}
					disabled={isLastSlide}
					style={styles.navButton}
					iconColor={Colors.primaryDarker}
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
					viewId: view?.id || 0,
					viewTitle: view?.name || "",
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
					if (view?.module_info.id) {
						if (isLastView) {
							router.dismissTo({
								pathname: "/modules/[id]",
								params: { id: view?.module_info.id },
							});
						} else {
							const nextView = moduleViews?.[currentViewIndex! + 1];
							console.log({ nextView });
							router.dismissTo({
								pathname: "/views/[id]",
								params: { id: nextView?.view_id! },
							});
						}
					}
				}}
				title={isLastView ? "This is the last view in this module. Are you sure you want to exit?" : "Are you ready to move on to the next view?"}
				content={isLastView ? "You can still check you answers later." : "You will go to the next view in this module."}
			/>
			<ConfirmationDialog
				visible={showConfirmationDialog}
				onDismiss={hideConfirmationDialog}
				onConfirm={(skip) => {
					nextSlide();
					if (skip) {
						setSkipAssessments(true);
					}
				}}
				title="Are you sure?"
				content="You haven't completed this assessment yet."
				skip={true}
			/>
			<View style={[localStyles.menusContainer]}>
				<CustomNavMenu
					visible={navMenuVisible}
					onDismiss={handleDismissMenu}
					onShowTopSheet={onShowTopSheet}
					showModal={showFeedbackModal}
					onRestart={showRestartDialog}
				/>
			</View>
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
		zIndex: 11,
	},
	menusContainer: {
		position: "absolute",
		bottom: 80,
		gap: 16,
		alignSelf: "center",
		zIndex: 2,
	},
});

export default BottomBarNav;

function VerticalSeparator() {
	return <View style={styles.verticalSeparator} />;
}
