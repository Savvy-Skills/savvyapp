import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Icon, Surface, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { QuestionInfo, LocalSlide } from "@/types";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import AssessmentWrapper from "../AssessmentWrapper";
import { Colors } from "@/constants/Colors";
import { generateColors } from "@/utils/utilfunctions";
import styles from "@/styles/styles";
import { useViewStore } from "@/store/viewStore";

export type TrueFalseQuestionProps = {
	slide: LocalSlide;
	question: QuestionInfo;
	quizMode: boolean;
};

export default function TrueFalseQuestion({
	slide,
	question,
	quizMode = false,
}: TrueFalseQuestionProps) {
	const { setAnswer } = useViewStore();
	const currentValue = slide.answer?.[0]?.text || "";
	const correctAnswer = question.options.find(option => option.isCorrect)?.text || "";

	const isCorrect = slide.isCorrect || false;
	const isRevealed = slide.revealed || false;
	const isSubmitted = slide.submitted || false;

	const handleChoiceSelection = useCallback((value: string) => {
		if (value !== currentValue) {
			const correct = value === correctAnswer;
			setAnswer([{ text: value }], correct);
		}
	}, [currentValue, correctAnswer, setAnswer]);


	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
		>
			<View style={localStyles.container}>
				{question.options.map((option, index) => (
					<React.Fragment key={option.text}>
						<Surface style={localStyles.buttonContainer}>
							<Button
								mode="contained"
								onPress={() => handleChoiceSelection(option.text)}
								disabled={isSubmitted && (quizMode || isCorrect)}
								style={[
									styles.trueFalseButton,
									currentValue === option.text && styles.selectedOption,
									isSubmitted && !isCorrect && currentValue === option.text && styles.incorrectOption,
									isSubmitted && isCorrect && currentValue === option.text && styles.correctOption,
									isRevealed && currentValue === option.text && styles.revealedOption,
								]}
								labelStyle={styles.trueFalseButtonText}
								contentStyle={{ paddingVertical: 8 }}
							>
								{option.text}
							</Button>
							<View style={localStyles.iconContainer}>
								{isSubmitted && !isCorrect && quizMode && (
									<StatusIcon
										isCorrect={option.isCorrect}
										isWrong={!option.isCorrect}
										showAnswer={false}
									/>
								)}
								{!quizMode && isSubmitted && currentValue === option.text && (
									<StatusIcon
										isCorrect={option.isCorrect}
										isWrong={!option.isCorrect}
										showAnswer={isRevealed}
									/>
								)}
							</View>
						</Surface>

						{index === 0 && (
							<Text style={localStyles.questionText}>
								{question.text}
							</Text>
						)}
					</React.Fragment>
				))}
			</View>
		</AssessmentWrapper>
	);
}

const localStyles = StyleSheet.create({
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
		textAlign: 'center',
		marginVertical: 16,
		fontSize: 18,
		lineHeight: 24,
		paddingHorizontal: 24
	},
});
