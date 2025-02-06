import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import AssessmentWrapper from "../AssessmentWrapper";
import { QuestionInfo } from "@/types";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";
import CustomCheckbox from "@/components/SavvyCheckbox";

export type AssessmentProps = {
	question: QuestionInfo;
	index: number;
	quizMode: boolean;
};

function createAnswer(
	selectedValues: string[],
	showAnswer: boolean
): AssessmentAnswer {
	return {
		answer: selectedValues.map((value) => ({
			text: value,
		})),
		revealed: showAnswer,
	};
}

const getOptionStyles = (
	option: string,
	question: QuestionInfo,
	showAnswer: boolean,
	quizMode: boolean,
	isWrong: boolean,
	selectedValues: string[],
	isCorrect: boolean
) => {
	const baseStyles =
		question.subtype === "Image" ? [styles.imageOption] : [styles.option];

	const correctAnswers = question.options
		.filter((option) => option.isCorrect)
		.map((option) => option.text);

	if (showAnswer && correctAnswers.includes(option)) {
		if (!quizMode) {
			return [...baseStyles, styles.revealedOption];
		}
	}

	if (quizMode && isWrong) {
		if (correctAnswers.includes(option)) {
			return [...baseStyles, styles.correctOption];
		}
		if (selectedValues.includes(option)) {
			return [...baseStyles, styles.incorrectOption];
		}
		return [...baseStyles, styles.disabledOption];
	}

	if (selectedValues.includes(option)) {
		if (isCorrect) {
			return [...baseStyles, styles.correctOption];
		} else if (isWrong) {
			return [...baseStyles, styles.incorrectOption];
		} else if (showAnswer) {
			return [...baseStyles, styles.revealedOption];
		}
		if (question.subtype === "Image") {
			return [...baseStyles, styles.selectedImage];
		}
		return [...baseStyles, styles.selectedOption];
	}
	return baseStyles;
};

export default function MultipleChoice({
	question,
	index,
	quizMode = false,
}: AssessmentProps) {
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [isWrong, setIsWrong] = useState(false);
	const [showFeedback, setShowFeedback] = useState(false);

	const {
		setSubmittableState,
		setCorrectnessState,
		submittedAssessments,
		submitAssessment,
		completedSlides,
		checkSlideCompletion,
		currentSlideIndex,
		setAnswer,
		tryAgain,
		revealAnswer,
		setHiddenFeedback,
		triggerTryAgain,
		triggerRevealAnswer,
	} = useCourseStore();

	const options = useMemo(
		() => question.options.map((option) => option.text),
		[question]
	);

	const correctAnswers = useMemo(
		() =>
			question.options
				.filter((option) => option.isCorrect)
				.map((option) => option.text),
		[question]
	);

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
		if (selectedValues.length > 0) {
			let correct =
				selectedValues.length === correctAnswers.length &&
				selectedValues.every((val) => correctAnswers.includes(val));
			setCorrectnessState(index, correct);
		} else {
			setCorrectnessState(index, false);
		}
	}, [selectedValues, correctAnswers, setCorrectnessState]);

	useEffect(() => {
		if (currentSubmission) {
			if (!currentSubmission.isCorrect) {
				setIsWrong(true);
			}
			setSelectedValues(currentSubmission.answer.map((answer) => answer.text));
			setShowFeedback(true);
		}
	}, [
		submittedAssessments,
		currentSubmission,
		quizMode,
		completedSlides,
		index,
		checkSlideCompletion,
	]);

	const isActive = index === currentSlideIndex;
	const blocked =
		currentSubmission?.isCorrect || showAnswer || (quizMode && isWrong);

	const handleChoiceSelection = (value: string) => {
		if (quizMode && (isWrong || currentSubmission?.isCorrect)) {
			return;
		}
		setSelectedValues((prevSelectedValues) => {
			const newSelectedValues = prevSelectedValues.includes(value)
				? prevSelectedValues.filter((item) => item !== value)
				: [...prevSelectedValues, value];
			setIsWrong(false);
			setShowAnswer(false);
			setShowFeedback(false);
			const answer = createAnswer(newSelectedValues, false);
			setAnswer(index, answer);
			setHiddenFeedback(currentSlideIndex, true);
			if (newSelectedValues.length === 0) {
				setSubmittableState(index, false);
			} else {
				setSubmittableState(index, true);

			}
			return newSelectedValues;
		});
	};

	const resetStates = () => {
		setSelectedValues([]);
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
			setSelectedValues(correctAnswers);
			setShowAnswer(true);
			setIsWrong(false);
			setShowFeedback(true);
			setCorrectnessState(index, true);
			const answer = createAnswer(correctAnswers, true);
			setAnswer(index, answer);
			submitAssessment(question.id);
		}
	};

	useEffect(() => {
		if (isActive && tryAgain) {
			handleTryAgain();
			triggerTryAgain();
		}
	}, [tryAgain]);

	useEffect(() => {
		if (isActive && revealAnswer) {
			handleRevealAnswer();
			triggerRevealAnswer();
		}
	}, [revealAnswer]);

	const renderStatusIcon = (option: string) => {
		if (quizMode && isWrong) {
			if (correctAnswers.includes(option)) {
				return (
					<StatusIcon isCorrect={true} isWrong={false} showAnswer={false} />
				);
			}
			if (selectedValues.includes(option)) {
				return (
					<StatusIcon isCorrect={false} isWrong={true} showAnswer={false} />
				);
			}
			return null;
		}

		if (selectedValues.includes(option)) {
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

	const renderImageOption = (option: string, index: number) => (
		<TouchableOpacity
			key={index}
			style={styles.imageContainer}
			onPress={() => handleChoiceSelection(option)}
			disabled={blocked}
			accessibilityRole="checkbox"
			accessibilityState={{ checked: selectedValues.includes(option) }}
		>
			<View
				style={getOptionStyles(
					option,
					question,
					showAnswer,
					quizMode,
					isWrong,
					selectedValues,
					currentSubmission?.isCorrect ?? false
				)}
			>
				<Image
					source={{ uri: option }}
					style={styles.image}
					resizeMode="contain"
				/>
				<View style={styles.imageIconContainer}>
					{renderStatusIcon(option)}
				</View>
			</View>
		</TouchableOpacity>
	);

	const renderTextOption = (option: string, index: number) => (
		<View key={index} style={styles.optionContainer}>
			<CustomCheckbox
				label={option}
				status={selectedValues.includes(option) ? "checked" : "unchecked"}
				onPress={() => handleChoiceSelection(option)}
				disabled={blocked && !correctAnswers.includes(option)}
				style={getOptionStyles(
					option,
					question,
					showAnswer,
					quizMode,
					isWrong,
					selectedValues,
					currentSubmission?.isCorrect ?? false
				)}
				disabledTouchable={blocked}
			/>
			<View style={styles.iconContainer}>{renderStatusIcon(option)}</View>
		</View>
	);

	return (
		<AssessmentWrapper
			question={question}
			isActive={isActive}
		>
			{question.subtype === "Image" ? (
				<View style={styles.imageGrid}>
					{options.map((option, index) => renderImageOption(option, index))}
				</View>
			) : (
				<View style={styles.optionsContainer}>
					{options.map((option, index) => renderTextOption(option, index))}
				</View>
			)}
		</AssessmentWrapper>
	);
}
