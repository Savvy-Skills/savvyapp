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
		setHiddenFeedback,
		triggerTryAgain,
		triggerRevealAnswer,
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
		setIsWrong(false);
		setShowAnswer(false);
		setHiddenFeedback(currentSlideIndex, true);
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
		}
	}, [submittedAssessments, currentSubmission, quizMode]);

	const blocked = currentSubmission?.isCorrect || showAnswer;

	useEffect(() => {
		if (isActive && revealAnswer) {
			handleRevealAnswer();
			triggerRevealAnswer();
		}
	}, [revealAnswer]);

	useEffect(() => {
		if (isActive && tryAgain) {
			handleTryAgain();
			triggerTryAgain();
		}
	}, [tryAgain]);

	const handleTryAgain = () => {
		setValue("");
		setShowAnswer(false);
		setIsWrong(false);
	};

	const handleRevealAnswer = () => {
		if (!quizMode) {
			setValue(answer.toString());
			setShowAnswer(true);
			setIsWrong(false);
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
					<Text style={styles.optionLabel}>{question.extras.text}</Text>
				)}
				{!!question.extras?.operator && (
					<OperatorRenderer operator={question.extras.operator} />
				)}
				<View style={styles.inputContainer}>
					<TextInput
						value={value}
						onChangeText={handleChange}
						disabled={blocked}
						textColor="black"
						style={[
							styles.input,
							currentSubmission?.isCorrect && styles.correctOption,
							isWrong && styles.incorrectOption,
							showAnswer && styles.revealedOption,
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
					<Text style={styles.optionLabel}>{question.extras.text2}</Text>
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
});
