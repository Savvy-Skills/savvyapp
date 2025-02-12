import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import AssessmentWrapper from "../AssessmentWrapper";
import { LocalSlide, QuestionInfo } from "@/types";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";
import CustomCheckbox from "@/components/SavvyCheckbox";
import { useViewStore } from "@/store/viewStore";
import ImageOptionMultiple from "./ImageOptionMultiple";
import TextOptionMultiple from "./TextOptionMultiple";

export type AssessmentProps = {
	slide: LocalSlide;
	question: QuestionInfo;
	quizMode: boolean;
};

export default function MultipleChoice({
	slide,
	question,
	quizMode = false,
}: AssessmentProps) {

	const { setAnswer } = useViewStore();
	
	const currentAnswers = slide.answer || [];
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


	const handleChoiceSelection = useCallback((value: string) => {
		if (quizMode && (slide.submitted)) {
			return;
		}
		const isCorrect = currentAnswers.length === correctAnswers.length && currentAnswers.every((val) => correctAnswers.includes(val.text));
		if (currentAnswers.length === 0) {
			setAnswer([{ text: value }], isCorrect);
		} else {
			if (currentAnswers.some((answer) => answer.text === value)) {
				setAnswer(currentAnswers.filter((answer) => answer.text !== value), isCorrect);
			} else {
				setAnswer([...currentAnswers, { text: value }], isCorrect);
			}
		}

	}, [quizMode, slide.submitted, currentAnswers, correctAnswers, setAnswer]);

	console.log({ currentAnswers });

	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
		>
			{question.subtype === "Image" ? (
				<View style={styles.imageGrid}>
					{options.map((option, index) =>
						<ImageOptionMultiple
							key={`${option}-${index}`}
							option={option}
							selectedValues={currentAnswers.map((answer) => answer.text)}
							handleChoiceSelection={handleChoiceSelection}
							blocked={quizMode && slide.submitted}
							correctAnswers={correctAnswers}
							showAnswer={quizMode && slide.submitted}
							quizMode={quizMode}
							currentSubmission={slide.submitted}
						/>
					)}
				</View>
			) : (
				<View style={styles.optionsContainer}>
					{options.map((option, index) =>
						<TextOptionMultiple
							key={`${option}-${index}`}
							option={option}
							selectedValues={currentAnswers.map((answer) => answer.text)}
							handleChoiceSelection={handleChoiceSelection}
							blocked={quizMode && slide.submitted}
							correctAnswers={correctAnswers}
							showAnswer={quizMode && slide.submitted}
							quizMode={quizMode}
							isCorrect={correctAnswers.includes(option)}
							isRevealed={quizMode && slide.submitted}
							isSubmitted={slide.submitted}
						/>
					)}
				</View>
			)}
		</AssessmentWrapper>
	);
}
