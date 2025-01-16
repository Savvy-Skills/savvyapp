import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { QuestionInfo } from "@/types";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import AssessmentWrapper from "../AssessmentWrapper";
import { Colors } from "@/constants/Colors";

export type TrueFalseQuestionProps = {
	question: QuestionInfo;
	index: number;
	quizMode: boolean;
};

function createAnswer(
	selectedValue: string,
	showAnswer: boolean
): AssessmentAnswer {
	return {
		answer: [
			{
				text: selectedValue,
			},
		],
		revealed: showAnswer,
	};
}

export default function TrueFalseQuestion({
	question,
	index,
	quizMode = false,
}: TrueFalseQuestionProps) {
	const [selectedValue, setSelectedValue] = useState<string | null>(null);
	const [isWrong, setIsWrong] = useState(false);
	const [showFeedback, setShowFeedback] = useState(false);

	const {
		setSubmittableState,
		setCorrectnessState,
		submittedAssessments,
		submitAssessment,
		currentSlideIndex,
		setAnswer,
		tryAgain,
		revealAnswer,
		setHiddenFeedback,
	} = useCourseStore();

	const isActive = index === currentSlideIndex;

	const options = question.options.map((option) => option.text);

	const correctAnswer =
		question.options.find((option) => option.isCorrect)?.text || "";

	const currentSubmissionIndex = submittedAssessments.findIndex(
		(submission) => submission.assessment_id === question.id
	);

	const currentSubmission =
		currentSubmissionIndex !== -1
			? submittedAssessments[currentSubmissionIndex]
			: undefined;

	const [showAnswer, setShowAnswer] = useState(
		currentSubmission?.revealed ?? false
	);

	useEffect(() => {
		if (selectedValue !== null) {
			setSubmittableState(index, true);
			let correct: boolean = selectedValue === correctAnswer;
			setCorrectnessState(index, correct);
			const answer = createAnswer(selectedValue, showAnswer);
			setAnswer(index, answer);
		}
	}, [
		selectedValue,
		index,
		setSubmittableState,
		correctAnswer,
		setCorrectnessState,
	]);

	useEffect(() => {
		if (currentSubmission) {
			if (!currentSubmission.isCorrect) {
				setIsWrong(true);
				if (quizMode) {
					setShowAnswer(true);
				}
			}
			setSelectedValue(currentSubmission.answer[0].text);
			setShowFeedback(true);
		}
	}, [submittedAssessments, currentSubmission, quizMode]);

	const blocked =
		currentSubmission?.isCorrect || showAnswer || (quizMode && isWrong);


	const getButtonStyle = (value: string) => {
		const baseStyle = [styles.button];

		if (showAnswer && value === correctAnswer) {
			return [...baseStyle, styles.revealedButton];
		}
		if (quizMode && isWrong) {
			if (value === correctAnswer) {
				return [...baseStyle, styles.correctButton];
			}
			if (value === selectedValue) {
				return [...baseStyle, styles.incorrectButton];
			}
			return [...baseStyle, styles.disabledButton];
		}
		if (value === selectedValue) {
			if (currentSubmission?.isCorrect) {
				return [...baseStyle, styles.correctButton];
			} else if (isWrong) {
				return [...baseStyle, styles.incorrectButton];
			} else if (showAnswer) {
				return [...baseStyle, styles.revealedButton];
			}
			return [...baseStyle, styles.selectedButton];
		}
		return [...baseStyle, styles.defaultButton];
	};

	const handleChoiceSelection = (value: string) => {
		if (quizMode && (isWrong || currentSubmission?.isCorrect)) {
			return;
		}
		if (value !== selectedValue) {
			setSelectedValue(value);
			setIsWrong(false);
			setShowAnswer(false);
			setShowFeedback(false);
			setHiddenFeedback(currentSlideIndex, true);
		}
	};

	const resetStates = () => {
		setSelectedValue(null);
		setShowAnswer(false);
		setIsWrong(false);
		setShowFeedback(false);
	};

	const handleTryAgain = () => {
		if (!quizMode) {
			resetStates();
		}
	};

	const handleRevealAnswer = () => {
		if (!quizMode) {
			setSelectedValue(correctAnswer);
			setShowAnswer(true);
			setIsWrong(false);
			setShowFeedback(true);
			setCorrectnessState(index, true);
			const answer = createAnswer(correctAnswer, true);
			setAnswer(index, answer);
			submitAssessment(question.id);
		}
	};

	useEffect(() => {
		if (isActive) {
			handleTryAgain();
		}
	}, [tryAgain]);

	useEffect(() => {
		if (isActive) {
			handleRevealAnswer();
		}
	}, [revealAnswer]);


	const renderStatusIcon = (value: string) => {
		if (quizMode && isWrong) {
			if (value === correctAnswer) {
				return (
					<StatusIcon isCorrect={true} isWrong={false} showAnswer={false} />
				);
			}
			if (value === selectedValue) {
				return (
					<StatusIcon isCorrect={false} isWrong={true} showAnswer={false} />
				);
			}
			return null;
		}

		if (value === selectedValue) {
			return (
				<StatusIcon
					isCorrect={currentSubmission?.isCorrect || false}
					isWrong={isWrong}
					showAnswer={showAnswer}
				/>
			);
		}
		return null;
	};

	return (
		<AssessmentWrapper
			question={question}
			isActive={isActive}
		>
			<View style={styles.container}>
				<View style={styles.buttonContainer}>
					<Button
						mode="contained"
						onPress={() => handleChoiceSelection(options[0])}
						disabled={blocked}
						style={getButtonStyle(options[0])}
						labelStyle={styles.buttonLabel}
						contentStyle={{ paddingVertical: 8 }}
					>
						{options[0]}
					</Button>
					<View style={styles.iconContainer}>
						{renderStatusIcon(options[0])}
					</View>
				</View>
				<View style={{ alignSelf: "center" }}>
					<Icon
						source="chevron-double-up"
						size={24}
						color={Colors.primary}
					/>
				</View>
				<Text style={styles.questionText}>{question.text}</Text>
				<View style={{ alignSelf: "center" }}>
					<Icon
						source="chevron-double-down"
						size={24}
						color={Colors.primary}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Button
						mode="contained"
						onPress={() => handleChoiceSelection(options[1])}
						disabled={blocked}
						style={getButtonStyle(options[1])}
						labelStyle={styles.buttonLabel}
						contentStyle={{ paddingVertical: 8 }}
					>
						{options[1]}
					</Button>
					<View style={styles.iconContainer}>
						{renderStatusIcon(options[1])}
					</View>
				</View>
			</View>
		</AssessmentWrapper>
	);
}

const styles = StyleSheet.create({
	iconContainer: {
		position: "absolute",
		right: -10,
		top: -10,
	},
	buttonContainer: {},
	container: {
		width: "100%",
		gap: 32,
		paddingVertical: 16,
	},
	questionText: {
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
		color: "#2D3748",
	},
	button: {
		justifyContent: "center",
		borderRadius: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	buttonLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#2D3748",
	},
	defaultButton: {
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E2E8F0",
	},
	selectedButton: {
		backgroundColor: "#a197f9",
		borderColor: "#a197f9",
	},
	correctButton: {
		backgroundColor: "rgba(35, 181, 236, 0.2)",
		borderColor: "#3bc2f5",
		borderWidth: 1,
	},
	incorrectButton: {
		backgroundColor: "rgba(252, 129, 129, 0.2)",
		borderColor: "#FC8181",
		borderWidth: 1,
	},
	revealedButton: {
		backgroundColor: "rgba(158, 158, 158, 0.1)",
		borderColor: "#9E9E9E",
	},
	disabledButton: {
		backgroundColor: "#EDF2F7",
		borderColor: "#E2E8F0",
		opacity: 0.7,
	},
});
