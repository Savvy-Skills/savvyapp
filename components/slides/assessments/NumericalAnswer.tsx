import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Text } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";
import OperatorRenderer from "@/components/OperatorRenderer";
import { useViewStore } from "@/store/viewStore";

function checkCorrectness(operator: string, answer: number, currentValue: number) {
	// eq: equal to
	// ne: not equal to
	// gt: greater than
	// lt: less than
	// gte: greater than or equal to
	// lte: less than or equal to

	switch (operator) {
		case "eq":
			return currentValue === answer;
		case "neq":
			return currentValue !== answer;
		case "gt":
			return currentValue > answer;
		case "lt":
			return currentValue < answer;
		case "gte":
			return currentValue >= answer;
		case "lte":
			return currentValue <= answer;
		default:
			return false;
	}
}


export default function NumericalAnswerAssessment({
	slide,
	question,
	quizMode,
}: AssessmentProps) {
	const { setAnswer } = useViewStore();
	
	const answer = parseFloat(question.options[0].text);
	const currentValue = slide.answer?.[0]?.text || "";
	const isRevealed = slide.revealed || false;
	const isSubmitted = slide.submitted || false;
	const isCorrect = slide.isCorrect || false;

	const operator = question.extras?.operator || "eq";

	const handleChange = useCallback((text: string) => {
		const sanitizedText = text.replace(/[^0-9.]/g, "");
		const parsedValue = parseFloat(sanitizedText);
		const isCorrect = checkCorrectness(operator, answer, parsedValue);
		
		setAnswer([{ text: sanitizedText }], isCorrect);
	}, [setAnswer, answer]);

	const blocked = ((quizMode || isCorrect) && isSubmitted) || isRevealed;

	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
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
						value={currentValue}
						onChangeText={handleChange}
						disabled={blocked}
						textColor="black"
						style={[
							styles.input,
							isSubmitted &&isCorrect && styles.correctOption,
							isSubmitted && !isCorrect && styles.incorrectOption,
							isRevealed && styles.revealedOption,
						]}
						keyboardType="numeric"
					/>
					<View style={styles.iconContainer}>
						<StatusIcon
							isCorrect={isSubmitted && isCorrect}
							isWrong={isSubmitted && !isCorrect}
							showAnswer={isRevealed}
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
