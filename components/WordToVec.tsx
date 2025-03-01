import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { IconButton, Surface } from 'react-native-paper';
import { getEmbeddings } from "@/services/openaiAPI";
import { Colors } from "@/constants/Colors";
import styles from "@/styles/styles";
import { Button, Text, TextInput, ActivityIndicator } from "react-native-paper";
import ConfirmationDialog from "./modals/ConfirmationDialog";

function dotProduct(vecA: number[], vecB: number[]) {
	let product = 0;
	for (let i = 0; i < vecA.length; i++) {
		product += vecA[i] * vecB[i];
	}
	return product;
}

function magnitude(vec: number[]) {
	let sum = 0;
	for (let i = 0; i < vec.length; i++) {
		sum += vec[i] * vec[i];
	}
	return Math.sqrt(sum);
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
	return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

export default function WordToVec() {
	const [targetWord, setTargetWord] = useState<string>("");
	const [userInput, setUserInput] = useState<string>("");
	const [similarity, setSimilarity] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [targetEmbedding, setTargetEmbedding] = useState<number[]>([]);
	const [showAnswer, setShowAnswer] = useState<boolean>(false);
	const [guesses, setGuesses] = useState<Array<{ word: string, similarity: number | null }>>([]);
	const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
	const [showGiveUpDialog, setShowGiveUpDialog] = useState<boolean>(false);
	const [currentWordHint, setCurrentWordHint] = useState<string>("");

	useEffect(() => {
		startGame();
	}, []);

	const startGame = useCallback(async () => {
		setLoading(true);
		setGuesses([]);
		setSimilarity(0);
		setShowAnswer(false);
		setGameStatus('playing');
		// Pick a random word from wordList
		// const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
		// setTargetWord(randomWord);
		const randomWord = "apple";
		setTargetWord(randomWord);
		try {
			// const targetEmbedding = await getEmbeddings(randomWord);
			// setTargetEmbedding(targetEmbedding.data[0].embedding);
		} catch (error) {
			console.error("Error starting game:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const getWordHint = useCallback(() => {
		// TODO: Logic to get a random word hint from list of hints
		const wordList = ["Hint #1", "Hint #2", "Hint #3", "Hint #4", "Hint #5"];
		const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
		setCurrentWordHint(randomWord);
	}, []);

	const handleGuess = useCallback(async () => {
		if (!userInput) return;
		setLoading(true);
		setGuesses(prev => [...prev, { word: userInput, similarity: null }]);
		try {
			// const userEmbedding = await getEmbeddings(userInput);
			// const similarity = cosineSimilarity(targetEmbedding, userEmbedding.data[0].embedding);
			// const randomSimilarity = Math.random() * 100;
			let randomSimilarity = 0;
			if (guesses.length > 4) {
				randomSimilarity = 100;
			} else {
				// Random between 0 and 60
				randomSimilarity = Math.random() * 60;
			}
			setSimilarity(randomSimilarity);
			setGuesses(prev => {
				const newGuesses = [...prev];
				newGuesses[newGuesses.length - 1].similarity = randomSimilarity;
				return newGuesses;
			});

			// Check if won (similarity > 0.95 or exact match)
			if (randomSimilarity > 95 || userInput.toLowerCase() === targetWord.toLowerCase()) {
				setGameStatus('won');
				setShowAnswer(true);
			}

			setUserInput("");
		} catch (error) {
			console.error("Error handling guess:", error);
			setGuesses(prev => prev.slice(0, -1));
		} finally {
			setLoading(false);
		}
	}, [userInput, guesses, targetWord]);

	const handleGiveUp = useCallback(() => {
		if (gameStatus === 'won') return;
		setShowAnswer(true);
		setGameStatus('lost');
		setGuesses(prev => [...prev, { word: targetWord, similarity: 100 }]);
	}, [gameStatus, targetWord]);

	// Handle Enter key press
	const handleKeyPress = useCallback((e: any) => {
		if (e.key === 'Enter' && userInput && !loading) {
			handleGuess();
		}
	}, [userInput, loading, handleGuess]);

	const getHint = useCallback(() => {
		const highestSimilarity = Math.max(...guesses.map(g => g.similarity || 0), 0);
		if (highestSimilarity < 30) return "You're very cold";
		if (highestSimilarity < 50) return "Getting warmer";
		if (highestSimilarity < 70) return "You're hot!";
		if (highestSimilarity < 90) return "You're very close!";
		return "You got it!";
	}, [guesses]);

	const getSimilarityColor = useCallback((value: number) => {
		if (value < 30) return Colors.error; // red
		if (value < 50) return Colors.warning; // orange
		if (value < 70) return Colors.lightOrange; // yellow
		if (value < 90) return Colors.success; // light green
		return Colors.success; // green
	}, []);

	const hint = useMemo(() => getHint(), [getHint]);

	return (
		<View style={localStyles.contentContainer}>
			<Surface style={localStyles.card}>
				<Text style={localStyles.instructionsTitle}>How to Play:</Text>
				<Text style={localStyles.instructionsText}>
					Try to guess the hidden word. The similarity score (0-1) shows how close your guess is semantically to the target word.
				</Text>
			</Surface>
			{gameStatus === 'won' && (
				<Surface style={localStyles.wonBanner}>
					<Text style={localStyles.wonText}>You found it! 🎉</Text>
				</Surface>
			)}
			{gameStatus === 'lost' && (
				<Surface style={localStyles.lostBanner}>
					<Text style={localStyles.lostText}>Answer was revealed! 👀</Text>
				</Surface>
			)}

			<Surface style={localStyles.card}>
				<View style={localStyles.targetContainer}>
					<Text style={localStyles.label}>Target Word:</Text>
					<View style={localStyles.targetTextContainer}>
						<Text style={localStyles.targetText}>
							{showAnswer ? targetWord : "?????"}
						</Text>
						<IconButton
							icon={showAnswer ? "eye-off" : "eye"}
							size={20}
							onPress={() => setShowGiveUpDialog(true)}
							iconColor={Colors.revealedButton}
						/>
					</View>
				</View>
				<Text style={localStyles.instructionsText}>The nearest word has a similarity of <Text style={{ fontWeight: 'bold' }}>75.98</Text>, the tenth-nearest has a similarity of <Text style={{ fontWeight: 'bold' }}>49.97</Text> and the hundreth nearest word has a similarity of <Text style={{ fontWeight: 'bold' }}>30.65</Text></Text>
				<Text style={[localStyles.wordHintText, styles.centerText]}>{currentWordHint}</Text>
				{gameStatus === 'won' || gameStatus === 'lost' && (
					<Button
						mode="contained"
						style={[styles.savvyButton, styles.lightOrangeButton]}
						labelStyle={[styles.buttonLabel]}
						onPress={startGame}
					>
						New Game
					</Button>
				)}
				<View style={localStyles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Enter your guess"
						value={userInput}
						onChangeText={setUserInput}
						onKeyPress={handleKeyPress}
						editable={!loading && gameStatus !== 'won' && gameStatus !== 'lost'}
					/>

					<Button
						mode="contained"
						loading={loading}
						style={[styles.savvyButton, { maxWidth: 100 }]}
						labelStyle={styles.buttonLabel}
						onPress={handleGuess}
						disabled={loading || !userInput || gameStatus === 'won' || gameStatus === 'lost'}
					>
						Guess
					</Button>
					<Button mode="outlined"
						style={[styles.savvyButton, { maxWidth: 100 }]}
						disabled={gameStatus === 'won' || gameStatus === 'lost'}
						labelStyle={styles.buttonLabel}
						onPress={getWordHint}> Hint</Button>
				</View>
				{guesses.length > 0 && (
					<View style={localStyles.hintContainer}>
						<Text style={localStyles.hintText}>{hint}</Text>
					</View>
				)}

				{similarity > 0 && (
					<View style={localStyles.similarityContainer}>
						<Text style={localStyles.resultLabel}>Similarity: </Text>
						<Text style={[localStyles.resultText, { color: getSimilarityColor(similarity) }]}>
							{similarity.toFixed(2)}
						</Text>
					</View>
				)}

			</Surface>

			{guesses.length > 0 && (
				<Surface style={localStyles.card}>
					<Text style={localStyles.guessesTitle}>Previous Guesses:</Text>
					<ScrollView style={localStyles.guessesListContainer} contentContainerStyle={{ flexDirection: "column-reverse" }}>
						{guesses.map((guess, index) => (
							<View key={index} style={localStyles.guessItem}>
								<Text style={localStyles.guessWord}>{guess.word}</Text>
								{guess.similarity === null ? (
									<ActivityIndicator size="small" color="#0000ff" />
								) : (
									<Text style={[
										localStyles.guessSimilarity,
										{ color: getSimilarityColor(guess.similarity) }
									]}>
										{guess.similarity.toFixed(2)}
									</Text>
								)}
							</View>
						))}
					</ScrollView>
				</Surface>
			)}
			<ConfirmationDialog
				visible={showGiveUpDialog}
				onDismiss={() => setShowGiveUpDialog(false)}
				onConfirm={handleGiveUp}
				title="Give Up?"
				content="Are you sure you want to give up?"
			/>
		</View>
	);
}

const localStyles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		alignItems: 'center',
		padding: 16,
		maxWidth: 600,
		alignSelf: "center",
		width: "100%",
		gap: 20,
	},
	hintButton: {
	},
	targetTextContainer: {
		flexDirection: "row",
		gap: 8,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	card: {
		backgroundColor: Colors.background,
		borderRadius: 8,
		padding: 20,
		width: '100%',
		gap: 20,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	targetContainer: {
		alignItems: 'center',
	},
	label: {
		fontSize: 16,
		color: Colors.mutedText,
	},
	targetText: {
		fontSize: 36,
		fontWeight: 'bold',
		marginBottom: 16,
		color: Colors.text,
		letterSpacing: 2,
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 12,
	},
	input: {
		height: 50,
		borderColor: Colors.mutedText,
		borderWidth: 1,
		borderRadius: 4,
		padding: 10,
		width: '100%',
		fontSize: 16,
	},
	loader: {
		marginTop: 10,
	},
	similarityContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	resultLabel: {
		fontSize: 18,
		color: Colors.mutedText,
	},
	resultText: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	hintContainer: {
		padding: 14,
		marginBottom: 16,
		backgroundColor: Colors.revealedBackground,
		borderRadius: 6,
		alignItems: 'center',
		width: '100%',
	},
	hintText: {
		fontStyle: 'italic',
		color: Colors.revealedText,
	},
	guessesTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
		color: Colors.text,
	},
	guessesListContainer: {
		maxHeight: 220,
	},
	guessItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
		alignItems: 'center',
	},
	guessWord: {
		fontSize: 16,
		color: Colors.text,
	},
	guessSimilarity: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	instructionsTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
		color: Colors.text,
	},
	wordHintText: {
		fontSize: 14,
		lineHeight: 20,
		color: Colors.whiteText,
		backgroundColor: Colors.blue,
		padding: 10,
		borderRadius: 4,
	},
	instructionsText: {
		fontSize: 14,
		lineHeight: 20,
		color: Colors.mutedText,
	},
	wonBanner: {
		backgroundColor: Colors.success,
		padding: 14,
		borderRadius: 6,
		marginBottom: 16,
		width: '100%',
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 10,
	},
	wonText: {
		color: Colors.background,
		fontSize: 20,
		fontWeight: 'bold',
	},
	lostBanner: {
		backgroundColor: Colors.revealedBackground,
		padding: 14,
		borderRadius: 6,
		marginBottom: 16,
		width: '100%',
		alignItems: 'center',
	},
	lostText: {
		color: Colors.text,
		fontSize: 20,
		fontWeight: 'bold',
	},
});
