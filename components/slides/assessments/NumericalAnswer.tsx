import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Text } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";
import OperatorRenderer from "@/components/OperatorRenderer";

function createAnswer(value: string, showAnswer: boolean): AssessmentAnswer {
	return {
		answer: [
			{
				text: value,
			},
		],
		revealed: showAnswer,
	};
}

export default function NumericalAnswerAssessment({
	question,
	index,
	quizMode,
}: AssessmentProps) {
	const [value, setValue] = useState("");
	const [showFeedback, setShowFeedback] = useState(false);
	const [isWrong, setIsWrong] = useState(false);

	const answer = parseFloat(question.options[0].text);
	const {
		setSubmittableState,
		setCorrectnessState,
		submittedAssessments,
		submitAssessment,
		currentSlideIndex,
		setAnswer,
		tryAgain,
		revealAnswer,
	} = useCourseStore();

	const isActive = index === currentSlideIndex;
	const currentSubmissionIndex = submittedAssessments.findIndex(
		(submission) => submission.assessment_id === question.id
	);

	const currentSubmission =
		currentSubmissionIndex !== -1
			? submittedAssessments[currentSubmissionIndex]
			: undefined;

	const [showAnswer, setShowAnswer] = useState(currentSubmission ? currentSubmission.revealed : false);

	const handleChange = (text: string) => {
		const sanitizedText = text.replace(/[^0-9.]/g, "");
		setValue(sanitizedText);
		setShowFeedback(false);
		setIsWrong(false);
		setShowAnswer(false);
	};

	useEffect(() => {
		const isSubmittable = value.trim() !== "";
		setSubmittableState(index, isSubmittable);

		if (isSubmittable) {
			let correct: boolean;
			if (Array.isArray(answer)) {
				correct = answer.includes(parseFloat(value));
			} else {
				correct = Math.abs(parseFloat(value)) === answer;
			}
			const assessmentAnswer = createAnswer(value, showAnswer);
			setAnswer(index, assessmentAnswer);
			setCorrectnessState(index, correct);
		}
	}, [value, index, setSubmittableState, answer, setCorrectnessState]);

	useEffect(() => {
		if (currentSubmission) {
			if (quizMode) {
				setShowAnswer(true);
			}
			if (!currentSubmission.isCorrect) {
				setIsWrong(true);
			}
			setValue(currentSubmission.answer[0].text);
			setShowFeedback(true);
		}
	}, [submittedAssessments, currentSubmission, quizMode]);

	const blocked = currentSubmission?.isCorrect || showAnswer;

	useEffect(() => {
		if (isActive) {
			handleRevealAnswer();
		}
	}, [revealAnswer]);

	useEffect(() => {
		if (isActive) {
			handleTryAgain();
		}
	}, [tryAgain]);

	const handleTryAgain = () => {
		setValue("");
		setShowAnswer(false);
		setIsWrong(false);
		setShowFeedback(false);
	};

	const handleRevealAnswer = () => {
		if (!quizMode) {
			setValue(answer.toString());
			setShowAnswer(true);
			setIsWrong(false);
			setShowFeedback(true);
			setCorrectnessState(index, true);
			const assessmentAnswer = createAnswer(answer.toString(), true);
			setAnswer(index, assessmentAnswer);
			submitAssessment(question.id);
		}
	};

	return (
		<AssessmentWrapper
			question={question}
			isActive={isActive}
		>
			<View style={localStyles.container}>
				{!!question.extras?.text && (
					<Text style={localStyles.text}>{question.extras.text}</Text>
				)}
				{!!question.extras?.operator && (
					<OperatorRenderer operator={question.extras.operator} />
				)}
				<View style={localStyles.inputContainer}>
					<TextInput
						value={value}
						onChangeText={handleChange}
						disabled={blocked}
						textColor="black"
						style={[
							localStyles.input,
							currentSubmission?.isCorrect && localStyles.correctInput,
							isWrong && localStyles.incorrectInput,
							showAnswer && localStyles.revealedInput,
						]}
						keyboardType="numeric"
					/>
					<View style={styles.iconContainer}>
						<StatusIcon
							isCorrect={currentSubmission?.isCorrect || false}
							isWrong={isWrong}
							showAnswer={showAnswer}
						/>
					</View>
				</View>
				{!!question.extras?.text2 && (
					<Text style={localStyles.text}>{question.extras.text2}</Text>
				)}
			</View>
		</AssessmentWrapper>
	);
}

const localStyles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		justifyContent: "center",
		padding: 16,
	},
	text: {
		fontSize: 16,
	},
	operatorContainer: {
		backgroundColor: "#ff7b09",
		borderRadius: 4,
		padding: 8,
	},
	operator: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	inputContainer: {
		position: "relative",
		width: 80,
	},
	input: {
		height: 40,
		textAlign: "center",
		backgroundColor: "white",
		borderRadius: 4,
		color: "black",
		borderWidth: 1,
		borderColor: "grey",
	},
	correctInput: {
		borderColor: "#23b5ec",
		borderWidth: 1,
		backgroundColor: "rgba(35, 181, 236, 0.1)",
	},
	incorrectInput: {
		borderColor: "#ff7b09",
		borderWidth: 1,
		backgroundColor: "rgba(255, 123, 9, 0.1)",
	},
	revealedInput: {
		borderColor: "#9E9E9E",
		borderWidth: 1,
		backgroundColor: "rgba(158, 158, 158, 0.1)",
	},
});
