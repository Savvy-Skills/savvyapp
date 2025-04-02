import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, Animated } from "react-native";
import { Text, IconButton } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/common/StatusIcon";
import { Colors } from "@/constants/Colors";
import { useViewStore } from "@/store/viewStore";

type Card = {
	id: string;
	text: string;
	type: "option" | "match";
	isMatched: boolean;
	showFeedback: boolean;
	isCorrect: boolean;
};

const ANIMATION_TIMING = {
	FEEDBACK_DURATION: 750,
	SHRINK_DURATION: 300,
	SHAKE_DURATION: 500,
} as const;

export default function MatchWordsAssessment({
	slide,
	question,
	quizMode = false,
}: AssessmentProps) {
	const [cards, setCards] = useState<Card[]>([]);
	const [originalCards, setOriginalCards] = useState<Card[]>([]);
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);
	const [allMatched, setAllMatched] = useState(false);
	const scaleAnims = useRef<Animated.Value[]>([]).current;
	const shakeAnims = useRef<Animated.Value[]>([]).current;

	const { setAnswer, submitAnswer } = useViewStore();

	const isRevealed = slide.revealed || false;
	const isSubmitted = slide.submitted || false;
	const isCorrect = slide.isCorrect || false;
	const blocked = (quizMode && isSubmitted) || (isSubmitted && isCorrect);

	useEffect(() => {
		initializeCards();
	}, []);

	const initializeCards = () => {
		const options = question.options?.map((opt, idx) => ({
			id: `option-${idx}`,
			text: opt.text,
			type: "option" as const,
			isMatched: false,
			showFeedback: false,
			isCorrect: false,
		})) || [];

		const matches = question.options?.map((opt, idx) => ({
			id: `match-${idx}`,
			text: opt.match || "",
			type: "match" as const,
			isMatched: false,
			showFeedback: false,
			isCorrect: false,
		})) || [];

		const allCards = [...options, ...matches];

		const originalCards = [];
		for (let i = 0; i < options.length; i++) {
			originalCards.push(options[i]);
			originalCards.push(matches[i]);
		}
		setOriginalCards(originalCards);

		if (slide.answer?.length) {
			setCards(
				allCards.map((card) => ({
					...card,
					isMatched: true,
					showFeedback: false,
					isCorrect: true,
				}))
			);
		} else {
			const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);
			setCards(shuffledCards);
			scaleAnims.length = shuffledCards.length;
			shakeAnims.length = shuffledCards.length;
			shuffledCards.forEach((_, index) => {
				scaleAnims[index] = new Animated.Value(1);
				shakeAnims[index] = new Animated.Value(0);
			});
			setAllMatched(false);
		}
	};

	const handleReset = () => {
		if (blocked || isRevealed) return;
		initializeCards();
		setAnswer([], false);
	};

	const shakeAnimation = (index: number) => {
		Animated.sequence([
			Animated.timing(shakeAnims[index], {
				toValue: 10,
				duration: ANIMATION_TIMING.SHAKE_DURATION / 4,
				useNativeDriver: true,
			}),
			Animated.timing(shakeAnims[index], {
				toValue: -10,
				duration: ANIMATION_TIMING.SHAKE_DURATION / 4,
				useNativeDriver: true,
			}),
			Animated.timing(shakeAnims[index], {
				toValue: 10,
				duration: ANIMATION_TIMING.SHAKE_DURATION / 4,
				useNativeDriver: true,
			}),
			Animated.timing(shakeAnims[index], {
				toValue: 0,
				duration: ANIMATION_TIMING.SHAKE_DURATION / 4,
				useNativeDriver: true,
			}),
		]).start();
	};

	const shrinkAnimation = (index: number) => {
		Animated.timing(scaleAnims[index], {
			toValue: 0,
			duration: ANIMATION_TIMING.SHRINK_DURATION,
			useNativeDriver: true,
		}).start();
	};

	const handleCardPress = useCallback((card: Card) => {
		if (blocked || isRevealed) return;

		if (!selectedCard) {
			setSelectedCard(card);
			return;
		}

		if (selectedCard.type === card.type) {
			setSelectedCard(card);
			return;
		}

		const cardIndex = cards.findIndex((c) => c.id === card.id);
		const selectedCardIndex = cards.findIndex((c) => c.id === selectedCard.id);

		const isMatchCorrect = question.options?.some(
			(opt) =>
				(selectedCard.text === opt.text && card.text === opt.match) ||
				(card.text === opt.text && selectedCard.text === opt.match)
		) || false;

		let newCards = cards.map((c) => {
			if (c.id === card.id || c.id === selectedCard.id) {
				return {
					...c,
					showFeedback: true,
					isCorrect: isMatchCorrect,
					isMatched: isMatchCorrect,
				};
			}
			return c;
		});

		setCards(newCards);

		if (isMatchCorrect) {
			setTimeout(() => {
				shrinkAnimation(cardIndex);
				shrinkAnimation(selectedCardIndex);
			}, ANIMATION_TIMING.FEEDBACK_DURATION);
		} else {
			shakeAnimation(cardIndex);
			shakeAnimation(selectedCardIndex);
		}

		newCards = newCards.map((c) => {
			if (c.id === card.id || c.id === selectedCard.id) {
				return { ...c, showFeedback: false };
			}
			return c;
		});

		setTimeout(() => {
			setCards(newCards);
		}, ANIMATION_TIMING.FEEDBACK_DURATION);

		setSelectedCard(null);

		// Update answer creation to show proper pairs
		const matchedPairs = newCards
			.filter((c) => c.isMatched && c.type === "option")
			.map(optionCard => ({
				text: optionCard.text,
				match: newCards.find(matchCard => 
					matchCard.type === 'match' && 
					matchCard.isMatched && 
					question.options?.some(opt => 
						opt.text === optionCard.text && 
						opt.match === matchCard.text
					)
				)?.text || ''
			}));


		const allMatched = matchedPairs.length === question.options?.length || false;
		setAnswer(matchedPairs, allMatched, !allMatched);
		if (allMatched) {
			setAllMatched(true);
			submitAnswer();
		}
	}, [
		blocked, 
		isRevealed, 
		selectedCard, 
		cards, 
		question.options, 
		shakeAnimation, 
		shrinkAnimation, 
		setAnswer
	]);

	const renderCard = (card: Card, idx: number, isOriginal: boolean = false) => (
		<Animated.View
			key={card.id}
			style={[
				styles.cardContainer,
				{
					transform: [
						{ scale: isOriginal ? 1 : scaleAnims[idx] },
						{ translateX: isOriginal ? 0 : shakeAnims[idx] },
					],
				},
			]}
		>
			<TouchableOpacity
				onPress={() => !isOriginal && handleCardPress(card)}
				style={[
					styles.card,
					card.type === "option" ? styles.optionCard : styles.matchCard,
					selectedCard?.id === card.id && styles.selectedCard,
					card.showFeedback && !card.isCorrect && styles.incorrectCard,
					card.showFeedback && card.isCorrect && styles.correctCard,
				]}
				disabled={blocked || isRevealed}
			>
				<Text style={styles.cardText}>{card.text}</Text>
				<StatusIcon
					isCorrect={isSubmitted && isCorrect}
					isWrong={isSubmitted && !isCorrect}
					showAnswer={isRevealed}
				/>
			</TouchableOpacity>
		</Animated.View>
	);

	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
		>
			<View style={styles.mainContainer}>
				<View style={styles.cardsContainer}>
					{allMatched
						? originalCards.map((card, idx) => renderCard(card, idx, true))
						: cards.map((card, idx) => renderCard(card, idx))}
				</View>
				{!isSubmitted && (
					<IconButton
						icon="refresh"
						mode="contained"
						onPress={handleReset}
						style={styles.resetButton}
					/>
				)}
			</View>
		</AssessmentWrapper>
	);
}

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		alignItems: "center",
	},
	cardsContainer: {
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 16,
		justifyContent: "center",
		padding: 16,
	},
	cardContainer: {
		maxWidth: "45%",
	},
	card: {
		flex: 1,
		width: "100%",
		borderRadius: 12,
		padding: 16,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
	},
	optionCard: {
		backgroundColor: "#FFB74D",
	},
	matchCard: {
		backgroundColor: "#FFFFFF",
	},
	selectedCard: {
		borderWidth: 2,
		borderColor: Colors.primary,
	},
	correctCard: {
		borderWidth: 2,
		borderColor: Colors.success,
	},
	incorrectCard: {
		borderWidth: 2,
		borderColor: Colors.error,
	},
	cardText: {
		textAlign: "center",
		fontSize: 16,
	},
	feedbackIcon: {
		position: "absolute",
		top: 8,
		right: 8,
	},
	resetButton: {
		marginTop: 16,
	},
});
