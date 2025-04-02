import React, { useCallback } from "react";
import { View } from "react-native";
import { RadioButton } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { LocalSlide, AssessmentInfo } from "@/types";
import styles from "@/styles/styles";
import { useViewStore } from "@/store/viewStore";
import ImageOption from "../../common/ImageOption";
import TextOption from "../../common/TextOption";

export type AssessmentProps = {
	slide: LocalSlide;
	question: AssessmentInfo;
	quizMode: boolean;
};

export default function SingleChoice({
	slide,
	question,
	quizMode = false,
}: AssessmentProps) {

	const { setAnswer } = useViewStore();

	const currentValue = slide.answer?.[0]?.text || "";

	const options = question.options?.map((option) => option.text) || [];
	const correctAnswer =
		question.options?.find((option) => option.isCorrect)?.text || "";

	const handleChoiceSelection = useCallback((value: string) => {
		if (value !== currentValue) {
			const isCorrect = value === correctAnswer;
			// setSelectedValue(value);
			setAnswer([{ text: value }], isCorrect);
		}
	}, [currentValue]);

	const isCorrect = slide.isCorrect || false;
	const isRevealed = slide.revealed || false;

	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
		>

			{question.subtype === "Image" ? (
				<View style={styles.imageGrid}>
					{options.map((option, index) =>
						<ImageOption
							key={`image-option-${index}`}
							option={option}
							selectedValue={currentValue}
							correctAnswer={correctAnswer}
							isRevealed={isRevealed}
							isCorrect={isCorrect}
							quizMode={quizMode}
							isSubmitted={slide.submitted}
							handleChoiceSelection={handleChoiceSelection}
							questionType="Image"
						/>
					)}
				</View>
			) : (
				<RadioButton.Group
					onValueChange={handleChoiceSelection}
					value={currentValue}
				>
					<View style={styles.optionsContainer}>
						{options.map((option, index) =>
							<TextOption
								key={`text-option-${index}`}
								option={option}
								selectedValue={currentValue}
								correctAnswer={correctAnswer}
								isRevealed={isRevealed}
								isCorrect={isCorrect}
								isSubmitted={slide.submitted}
								quizMode={quizMode}
								handleChoiceSelection={handleChoiceSelection}
								questionType="Text"
							/>
						)}
					</View>
				</RadioButton.Group>
			)}
		</AssessmentWrapper>
	);
}

