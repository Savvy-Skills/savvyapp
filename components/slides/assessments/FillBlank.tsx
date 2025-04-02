import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/common/StatusIcon";
import styles from "@/styles/styles";
import { useViewStore } from "@/store/viewStore";
import { Answer, LocalSlide, AssessmentInfo, Slide } from "@/types";


const FillBlankText = ({
	question,
	blanks,
	blocked,
	handleBlankPress,
	slide
}: {
	question: AssessmentInfo;
	blanks: string[];
	blocked: boolean;
	handleBlankPress: (index: number) => void;
	slide: LocalSlide;
}) => {
	const textParts = question.text.split(/\[(.*?)\]/g);
	return (
		<>
			{textParts.map((part, index) => (
				<React.Fragment key={`segment-${index}`}>
					{index % 2 === 0 ? (
						<Text key={`text-${index}`}>{part}</Text>
					) : (
						<Button
							key={`blank-${index}`}
							mode="outlined"
							onPress={() => handleBlankPress(Math.floor(index / 2))}
							disabled={blocked}
							style={[
								styles.ftbBlankButton,
								slide.revealed && styles.revealedOption,
								blocked && styles.disabledOption,
							]}
						>
							{blanks[Math.floor(index / 2)] || "______"}
						</Button>
					)}
				</React.Fragment>
			))}
		</>
	);
};

export default function FillBlankAssessment({
	slide,
	question,
	quizMode = false,
}: AssessmentProps) {
	const { setAnswer } = useViewStore();
	const [blanks, setBlanks] = useState<string[]>([]);
	const [remainingOptions, setRemainingOptions] = useState<string[]>([]);

	const correctAnswers = useMemo(() => {
		const matches = question.text.match(/\[(.*?)\]/g) || [];
		return matches.map(match => match.replace(/[\[\]]/g, ""));
	}, [question.text]);

	const questionOptions = useMemo(
		() => question.options?.map(option => option.text) || [],
		[question]
	);

	const isRevealed = slide.revealed || false;
	const blocked = (quizMode && slide.submitted) || (slide.submitted && slide.isCorrect);

	const updateRemainingOptions = useCallback((filledBlanks: string[]) => {
		const usedOptions = filledBlanks.filter(b => b !== "");
		const remaining = [...questionOptions, ...correctAnswers]
			.filter(opt => !usedOptions.includes(opt));
		setRemainingOptions(remaining);
	}, [questionOptions, correctAnswers]);

	// Initialize blanks and options
	useState(() => {
		const initialAnswers = slide.answer?.map(a => a.text) || [];
		const filledBlanks = initialAnswers.length > 0 ? initialAnswers : Array(correctAnswers.length).fill("");

		setBlanks(filledBlanks);
		updateRemainingOptions(filledBlanks);

	});

	useEffect(() => {
		if (isRevealed) {
			setBlanks(correctAnswers);
			updateRemainingOptions(correctAnswers);
		}
	}, [isRevealed, setBlanks, updateRemainingOptions, correctAnswers]);

	const checkCorrectness = useCallback((currentBlanks: string[]) => {
		return currentBlanks.every((blank, index) =>
			blank.toLowerCase() === correctAnswers[index]?.toLowerCase()
		);
	}, [correctAnswers]);


	const handleOptionPress = useCallback((option: string) => {
		if (blocked) return;

		setBlanks(prev => {
			const newBlanks = [...prev];
			const firstEmptyIndex = newBlanks.findIndex(b => b === "");

			console.log({ newBlanks, firstEmptyIndex });
			if (firstEmptyIndex !== -1) {
				newBlanks[firstEmptyIndex] = option;
			} else {
				// If there's not an empty blank, replace the last filled blank
				newBlanks[newBlanks.length - 1] = option;
			}

			const isCorrect = checkCorrectness(newBlanks);
			setAnswer(
				newBlanks.map(text => ({ text, order: 0 })),
				isCorrect
			);
			updateRemainingOptions(newBlanks);
			return newBlanks;
		});
	}, [blocked, checkCorrectness, setAnswer, questionOptions, correctAnswers, updateRemainingOptions, setBlanks]);

	const handleBlankPress = useCallback((index: number) => {
		if (blocked) return;

		setBlanks(prev => {
			const newBlanks = [...prev];
			// Replace the blank with an empty string
			newBlanks[index] = "";
			console.log({ newBlanks });
			updateRemainingOptions([...newBlanks]);
			return newBlanks;
		});
	}, [blocked, updateRemainingOptions, setBlanks]);

	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
		>
			<View style={styles.ftbTextContainer}>
				<FillBlankText
					question={question}
					blanks={blanks}
					blocked={blocked || false}
					handleBlankPress={handleBlankPress}
					slide={slide}
				/>
				<View style={styles.iconContainer}>
					<StatusIcon
						isCorrect={(slide.submitted && slide.isCorrect) || false}
						isWrong={(slide.submitted && !slide.isCorrect) || false}
						showAnswer={isRevealed}
					/>
				</View>
			</View>
			<View style={styles.ftbOptionsContainer}>
				{remainingOptions.map((option, index) => (
					<Button
						key={index}
						mode="contained"
						onPress={() => handleOptionPress(option)}
						disabled={blocked}
						style={[styles.ftbOptionButton, blocked && styles.disabledOption]}
					>
						{option}
					</Button>
				))}
			</View>
		</AssessmentWrapper>
	);
}
