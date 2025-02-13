import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { List, IconButton } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";
import { useViewStore } from "@/store/viewStore";

export default function ReorderAssessment({
	slide,
	question,
	quizMode = false,
}: AssessmentProps) {
	const { setAnswer } = useViewStore();
	const [currentOrder, setCurrentOrder] = useState<string[]>(
		slide.answer?.map(a => a.text) || []
	);
	
	const correctOrder = useMemo(
		() => question.options
			.sort((a, b) => a.correctOrder - b.correctOrder)
			.map(option => option.text),
		[question]
	);

	const isCorrect = slide.isCorrect || false;
	const isRevealed = slide.revealed || false;
	const blocked = (quizMode && slide.submitted) || (slide.submitted && isCorrect);

	const moveItem = useCallback((itemIndex: number, direction: "up" | "down") => {
		if (blocked || isRevealed) return;
		
		const newOrder = [...currentOrder];
		const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
		const [item] = newOrder.splice(itemIndex, 1);
		newOrder.splice(newIndex, 0, item);
		
		const isCorrectOrder = JSON.stringify(newOrder) === JSON.stringify(correctOrder);
		setCurrentOrder(newOrder);
		setAnswer(
			newOrder.map((text, index) => ({ text, order: index + 1 })),
			isCorrectOrder
		);
	}, [currentOrder, correctOrder, blocked, isRevealed, setAnswer]);

	useEffect(() => {
		if (!slide.answer?.length) {
			const shuffled = question.options
				.map(option => option.text)
				.sort(() => Math.random() - 0.5);
			setCurrentOrder(shuffled);
			
			const isCorrect = shuffled.every((text, index) => text === correctOrder[index]);
			setAnswer(
				shuffled.map((text, index) => ({ text, order: index + 1 })),
				isCorrect
			);
		}
	}, []);

	useEffect(() => {
		setCurrentOrder(slide.answer?.map(a => a.text) || []);
	}, [slide.answer]);

	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
		>
			<List.Section
				style={[
					localStyles.container,
					isRevealed ? styles.revealedOption :
					slide.submitted && isCorrect ? styles.correctOption :
					slide.submitted && !isCorrect ? styles.incorrectOption : {},
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
										disabled={index === 0 || blocked || isRevealed}
									/>
									<IconButton
										icon="arrow-down"
										onPress={() => moveItem(index, "down")}
										disabled={index === currentOrder.length - 1 || blocked || isRevealed}
									/>
								</View>
							)}
							style={styles.option}
						/>
					</View>
				))}
				<View style={[styles.iconContainer, { top: -10, right: -10 }]}>
					<StatusIcon
						isCorrect={slide.submitted && isCorrect}
						isWrong={slide.submitted && !isCorrect}
						showAnswer={isRevealed}
					/>
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
});
