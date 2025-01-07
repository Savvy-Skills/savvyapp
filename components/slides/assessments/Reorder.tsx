import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { List, IconButton } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";

function createAnswer(
	currentOrder: string[],
	showAnswer: boolean
): AssessmentAnswer {
	return {
		answer: currentOrder.map((value, i) => ({
			text: value,
			order: i + 1,
		})),

		revealed: showAnswer,
	};
}

export default function ReorderAssessment({
	question,
	index,
	quizMode = false,
}: AssessmentProps) {
	const [currentOrder, setCurrentOrder] = useState<string[]>([]);
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
	} = useCourseStore();

	const correctOrder = useMemo(
		() =>
			question.options
				.sort((a, b) => a.correctOrder - b.correctOrder)
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

	const isActive = index === currentSlideIndex;

	const [showAnswer, setShowAnswer] = useState(
		currentSubmission?.revealed ?? false
	);

	useEffect(() => {
		const items = question.options
			.map((option) => option.text)
			.sort(() => Math.random() - 0.5);
		setCurrentOrder(items);
		setSubmittableState(index, true);
	}, [question, index, setSubmittableState]);

	useEffect(() => {
		const correct =
			JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
		setCorrectnessState(index, correct);
		const answer = createAnswer(currentOrder, showAnswer);
		setAnswer(index, answer);
	}, [currentOrder, correctOrder, index, setCorrectnessState]);

	useEffect(() => {
		if (currentSubmission) {
			if (!currentSubmission.isCorrect) {
				setIsWrong(true);
				if (quizMode) {
					setShowAnswer(true);
				}
			}
			const currentSubmissionOrder = currentSubmission.answer.sort((a, b) => {
				if (a.order === undefined || b.order === undefined) return 0;
				return a.order - b.order;
			});
			setCurrentOrder(currentSubmissionOrder.map((answer) => answer.text));
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

	const blocked =
		currentSubmission?.isCorrect || showAnswer || (quizMode && isWrong);



	const moveItem = useCallback(
		(itemIndex: number, direction: string) => {
			if (blocked) return;

			const newOrder = [...currentOrder];
			const item = newOrder[itemIndex];
			const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
			newOrder.splice(itemIndex, 1);
			newOrder.splice(newIndex, 0, item);
			setCurrentOrder(newOrder);
			setSubmittableState(index, true, "Reorder component");
			setIsWrong(false);
			setShowAnswer(false);
			setShowFeedback(false);
		},
		[
			blocked,
			currentOrder,
			setCurrentOrder,
			setIsWrong,
			setShowAnswer,
			setShowFeedback,
			setSubmittableState,
		]
	);

	const resetStates = useCallback(() => {
		const items = question.options
			.map((option) => option.text)
			.sort(() => Math.random() - 0.5);
		setCurrentOrder(items);
		setShowAnswer(false);
		setIsWrong(false);
		setShowFeedback(false);
	}, [
		question.options,
		setCurrentOrder,
		setShowAnswer,
		setIsWrong,
		setShowFeedback,
	]);

	const handleTryAgain = useCallback(() => {
		if (!quizMode) {
			resetStates();
		}
	}, [quizMode, resetStates]);

	const handleRevealAnswer = useCallback(() => {
		if (!quizMode) {
			setCurrentOrder(correctOrder);
			setShowAnswer(true);
			setIsWrong(false);
			setShowFeedback(true);
			setCorrectnessState(index, true);
			const assessmentAnswer = createAnswer(correctOrder, true);
			setAnswer(index, assessmentAnswer);
			submitAssessment(question.id);
		}
	}, [
		quizMode,
		correctOrder,
		setCurrentOrder,
		setShowAnswer,
		setIsWrong,
		setShowFeedback,
		setCorrectnessState,
		index,
		question.id,
		submitAssessment,
	]);

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

	const renderStatusIcon = () => {
		if (isWrong) {
			return <StatusIcon isCorrect={false} isWrong={true} showAnswer={false} />;
		}

		if (showAnswer || currentSubmission?.isCorrect) {
			return (
				<StatusIcon
					isCorrect={true}
					isWrong={false}
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
			<List.Section
				style={[
					localStyles.container,
					isWrong
						? localStyles.wrongContainer
						: currentSubmission?.isCorrect
							? localStyles.correctContainer
							: {},
					showAnswer && localStyles.revealedContainer,
				]}
			>
				{currentOrder.map((item, index) => (
					<View key={index} style={styles.optionContainer}>
						<List.Item
							title={item}
							left={() => (
								<View style={localStyles.buttonContainer}>
									<IconButton
										icon="arrow-up"
										onPress={() => moveItem(index, "up")}
										disabled={index === 0 || blocked}
									/>
									<IconButton
										icon="arrow-down"
										onPress={() => moveItem(index, "down")}
										disabled={index === currentOrder.length - 1 || blocked}
									/>
								</View>
							)}
							style={[styles.option]}
						/>
					</View>
				))}
				<View style={[styles.iconContainer, { top: -10, right: -10 }]}>
					{renderStatusIcon()}
				</View>
			</List.Section>
		</AssessmentWrapper>
	);
}

const localStyles = StyleSheet.create({
	buttonContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	container: {
		borderRadius: 4,
		gap: 4,
	},

	wrongContainer: {
		backgroundColor: "rgba(255, 0, 0, 0.1)",
		borderWidth: 1,
		borderColor: "red",
	},
	revealedContainer: {
		backgroundColor: "rgba(158, 158, 158, 0.1)",
		borderWidth: 1,
		borderColor: "#29e9e9e",
	},
	correctContainer: {
		backgroundColor: "rgba(35, 181, 236, 0.2)",
		borderWidth: 1,
		borderColor: "#23b5ec",
	},
});
