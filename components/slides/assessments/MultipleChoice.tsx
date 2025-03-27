import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import AssessmentWrapper from "../AssessmentWrapper";
import { Answer, LocalSlide, AssessmentInfo } from "@/types";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";
import CustomCheckbox from "@/components/SavvyCheckbox";
import { useViewStore } from "@/store/viewStore";
import ImageOptionMultiple from "./ImageOptionMultiple";
import TextOptionMultiple from "./TextOptionMultiple";

export type AssessmentProps = {
	slide: LocalSlide;
	question: AssessmentInfo;
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
		() => question.options?.map((option) => option.text) || [],
		[question]
	);

	const correctAnswers = useMemo(
		() =>
			question.options
				?.filter((option) => option.isCorrect)
				.map((option) => option.text) || [],
		[question]
	);


	const handleChoiceSelection = useCallback((value: string) => {
		if (quizMode && slide.submitted) return;

		const checkAnswersCorrect = (answers: Answer[]) => 
			answers.length === correctAnswers.length && 
			answers.every(val => correctAnswers.includes(val.text));

		const isSelected = currentAnswers.some(answer => answer.text === value);
		const newAnswers = isSelected
			? currentAnswers.filter(answer => answer.text !== value)
			: [...currentAnswers, { text: value }];

		const isCorrect = checkAnswersCorrect(newAnswers);
		setAnswer(newAnswers, isCorrect);

	}, [quizMode, slide.submitted, currentAnswers, correctAnswers, setAnswer]);

	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
		>
			{question.subtype === "Image" ? (
				<View style={styles.imageGrid}>
					{options.map((option, index) =>
						<ImageOptionMultiple
							key={`image-option-${index}`}
							option={option}
							selectedValues={currentAnswers.map((answer) => answer.text)}
							handleChoiceSelection={handleChoiceSelection}
							blocked={quizMode && slide.submitted}
							correctAnswers={correctAnswers}
							quizMode={quizMode}
							isCorrect={slide.isCorrect || false}
							isRevealed={slide.revealed || false}
							isSubmitted={slide.submitted || false}
						/>
					)}
				</View>
			) : (
				<View style={styles.optionsContainer}>
					{options.map((option, index) =>
						<TextOptionMultiple
							key={`text-option-${index}`}
							option={option}
							selectedValues={currentAnswers.map((answer) => answer.text)}
							handleChoiceSelection={handleChoiceSelection}
							blocked={(quizMode && slide.submitted) || (slide.submitted && (slide.isCorrect || false))}
							correctAnswers={correctAnswers}
							quizMode={quizMode}
							isCorrect={slide.isCorrect || false}
							isRevealed={slide.revealed || false}
							isSubmitted={slide.submitted || false}
						/>
					)}
				</View>
			)}
		</AssessmentWrapper>
	);
}
