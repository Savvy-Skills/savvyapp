import React from "react";
import styles from "@/styles/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog, Icon, Portal, Text } from "react-native-paper";
import ConfirmationDialog from "../modals/ConfirmationDialog";
import { useCourseStore } from "@/store/courseStore";
import { View } from "react-native";
import { AnimationObject } from "lottie-react-native";
import { LottieComponentAutoplay } from "../LottieComponentAutoplay";
import { useAudioStore } from "@/store/audioStore";
import { generateColors } from "@/utils/utilfunctions";
import { Colors } from "@/constants/Colors";

type AnimationConfig = {
	source: AnimationObject;
	inactiveStartFrame: number;
};

const animations: AnimationConfig[] = [
	{
		source: require('@/assets/lottie/incorrect.json'),
		inactiveStartFrame: 45
	},
	{
		source: require('@/assets/lottie/revealed.json'),
		inactiveStartFrame: 85
	},
	{
		source: require('@/assets/lottie/correct.json'),
		inactiveStartFrame: 45
	}
];

function FeedbackComponent({
	correctness,
	revealed,
	onRevealAnswer,
	onShowExplanation,
	quizMode,
	showExplanation,
	slideIndex,
}: {
	correctness: boolean;
	revealed: boolean;
	onTryAgain: () => void;
	onRevealAnswer: () => void;
	onShowExplanation: () => void;
	quizMode: boolean;
	showExplanation: boolean;
	slideIndex: number;
}) {
	const [visible, setVisible] = useState(false);
	const showDialog = () => setVisible(true);
	const hideDialog = () => setVisible(false);

	const { playSound } = useAudioStore();


	const handleShowReveal = useCallback(() => {
		showDialog();
	}, [showDialog]);

	const handleReveal = useCallback(() => {
		playSound("success", 0.6);
		onRevealAnswer();
		hideDialog();
	}, [onRevealAnswer, hideDialog, playSound]);


	const getFeedbackTextStyle = () => {
		if (revealed) return styles.revealedTitle;
		if (correctness) return styles.correctTitle;
		return styles.incorrectTitle;
	};

	const getLottieSource = useCallback(() => {
		if (revealed) return require('@/assets/lottie/revealed.json');
		if (correctness) return require('@/assets/lottie/correct.json');
		return require('@/assets/lottie/incorrect.json');
	}, [revealed, correctness]);

	const getFeedbackTitle = useCallback(() => {
		if (revealed) return "Answer revealed";
		if (correctness) return "Correct!";
		return "Not quite!";
	}, [revealed, correctness]);


	return (
		<View style={[styles.feedbackContainer]}>
			<View style={styles.feedbackHeader}>
				<View style={styles.lottieContainer}>
					<LottieComponentAutoplay source={getLottieSource()} webStyle={{ width: revealed ? "250%" : "350%", height: revealed ? "250%" : "350%" }} />
				</View>
				<Text style={[styles.feedbackTitle, getFeedbackTextStyle()]}>
					{getFeedbackTitle()}
				</Text>
			</View>
			<View style={styles.buttonContainer}>
				{revealed || correctness ? (
					<Button
						mode="text"
						onPress={onShowExplanation}
						textColor="#321A5F"
						buttonColor={generateColors(Colors.assessmentBackground, 0.4).muted}
						style={{ borderRadius: 4 }}
					>
						{showExplanation ? "Go back to question" : "See explanation"}
					</Button>
				) : (
					<>
						{!quizMode && (
							<Button
								mode="text"
								onPress={handleShowReveal}
								textColor="#321A5F"
								buttonColor={generateColors(Colors.assessmentBackground, 0.4).muted}
								style={{ borderRadius: 4 }}
							>
								See answer
							</Button>
						)}
						{quizMode && (
							<Button
								mode="text"
								onPress={onShowExplanation}
								textColor="#321A5F"
								buttonColor={generateColors(Colors.assessmentBackground, 0.4).muted}
								style={{ borderRadius: 4 }}
							>
								{showExplanation ? "Go back to question" : "See explanation"}
							</Button>
						)}
					</>
				)}
			</View>
			{!correctness && !revealed && (
				<ConfirmationDialog
					visible={visible}
					onDismiss={hideDialog}
					onConfirm={handleReveal}
					title="Are you sure?"
					content="This will give you no points for this question."
				/>
			)}
		</View>
	);
}

export default FeedbackComponent;

