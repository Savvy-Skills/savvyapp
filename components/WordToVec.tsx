import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { IconButton, Surface } from 'react-native-paper';
import { getEmbeddings } from "@/services/openaiAPI";
import { Colors } from "@/constants/Colors";
import styles from "@/styles/styles";
import { Button, Text, TextInput, ActivityIndicator } from "react-native-paper";

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
	const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
	const [wordList, setWordList] = useState<string[]>([
		"apple", "banana", "orange", "computer", "music",
		"mountain", "ocean", "coffee", "book", "moon"
	]);

	useEffect(() => {
		startGame();
	}, []);

	const startGame = async () => {
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
			const targetEmbedding = await getEmbeddings(randomWord);
			setTargetEmbedding(targetEmbedding.data[0].embedding);
		} catch (error) {
			console.error("Error starting game:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleGuess = async () => {
		if (!userInput) return;
		setLoading(true);
		setGuesses(prev => [...prev, { word: userInput, similarity: null }]);
		try {
			const userEmbedding = await getEmbeddings(userInput);
			const similarity = cosineSimilarity(targetEmbedding, userEmbedding.data[0].embedding);
			setSimilarity(similarity);
			setGuesses(prev => {
				const newGuesses = [...prev];
				newGuesses[newGuesses.length - 1].similarity = similarity;
				return newGuesses;
			});

			// Check if won (similarity > 0.95 or exact match)
			if (similarity > 0.95 || userInput.toLowerCase() === targetWord.toLowerCase()) {
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
	};

	// Handle Enter key press
	const handleKeyPress = (e: any) => {
		if (e.key === 'Enter' && userInput && !loading) {
			handleGuess();
		}
	};

	const getHint = () => {
		const highestSimilarity = Math.max(...guesses.map(g => g.similarity || 0), 0);
		if (highestSimilarity < 0.3) return "You're very cold";
		if (highestSimilarity < 0.5) return "Getting warmer";
		if (highestSimilarity < 0.7) return "You're hot!";
		if (highestSimilarity < 0.9) return "You're very close!";
		return "You're extremely close!";
	};

	const getSimilarityColor = (value: number) => {
		if (value < 0.3) return Colors.error; // red
		if (value < 0.5) return Colors.warning; // orange
		if (value < 0.7) return Colors.lightOrange; // yellow
		if (value < 0.9) return Colors.success; // light green
		return Colors.success; // green
	};

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
							onPress={() => setShowAnswer(!showAnswer)}
							iconColor={Colors.revealedButton}
						/>
					</View>
				</View>

				{guesses.length > 0 && (
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
						editable={!loading && gameStatus !== 'won'}
					/>

					<Button
						mode="contained"
						loading={loading}
						style={[styles.savvyButton, { maxWidth: 100 }]}
						labelStyle={styles.buttonLabel}
						onPress={handleGuess}
						disabled={loading || !userInput || gameStatus === 'won'}
					>
						Guess
					</Button>
				</View>
				{guesses.length > 0 && (
					<View style={localStyles.hintContainer}>
						<Text style={localStyles.hintText}>{getHint()}</Text>
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
		gap: 16,
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
		borderRadius: 4,
		padding: 16,
		width: '100%',
		gap: 16,
	},
	targetContainer: {
		alignItems: 'center',
	},
	label: {
		fontSize: 16,
		color: Colors.mutedText,
	},
	targetText: {
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 16,
		color: Colors.text,
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 8,
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
		padding: 10,
		marginBottom: 16,
		backgroundColor: Colors.revealedBackground,
		borderRadius: 4,
		alignItems: 'center',
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
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.mutedText,
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
	instructionsText: {
		fontSize: 14,
		lineHeight: 20,
		color: Colors.mutedText,
	},
	wonBanner: {
		backgroundColor: Colors.success,
		padding: 10,
		borderRadius: 4,
		marginBottom: 16,
		width: '100%',
		alignItems: 'center',
	},
	wonText: {
		color: Colors.background,
		fontSize: 20,
		fontWeight: 'bold',
	},
});
