import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View, TextInput, Button, Text, ActivityIndicator, ScrollView } from "react-native";
import { Surface } from 'react-native-paper';
import { getEmbeddings } from "@/services/openaiAPI";
import { Colors } from "@/constants/Colors";

function dotProduct(vecA: number[], vecB: number[]) {
    let product = 0;
    for(let i=0;i<vecA.length;i++){
        product += vecA[i] * vecB[i];
    }
    return product;
}

function magnitude(vec: number[]) {
    let sum = 0;
    for (let i = 0;i<vec.length;i++){
        sum += vec[i] * vec[i];
    }
    return Math.sqrt(sum);
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
    return dotProduct(vecA,vecB)/ (magnitude(vecA) * magnitude(vecB));
}

export default function WordToVec() {
	const [targetWord, setTargetWord] = useState<string>("apple");
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
		const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
		setTargetWord("consist");
		
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
	const handleKeyPress = (e:any) => {
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
		<View style={styles.contentContainer}>
			{gameStatus === 'won' && (
				<Surface style={styles.wonBanner}>
					<Text style={styles.wonText}>You found it! 🎉</Text>
				</Surface>
			)}
			
			<Surface style={styles.card}>
				<View style={styles.targetContainer}>
					<Text style={styles.label}>Target Word:</Text>
					<Text style={styles.targetText}>
						{showAnswer ? targetWord : "?????"}
					</Text>
					
					<View style={styles.buttonRow}>
						<View style={styles.buttonContainer}>
							<Button
								title={showAnswer ? "Hide Answer" : "Reveal Answer"}
								onPress={() => setShowAnswer(!showAnswer)}
								color={Colors.blue}
							/>
						</View>
						<View style={styles.buttonContainer}>
							<Button
								title="New Game"
								onPress={startGame}
								color={Colors.success}
							/>
						</View>
					</View>
				</View>

				{guesses.length > 0 && (
					<View style={styles.hintContainer}>
						<Text style={styles.hintText}>{getHint()}</Text>
					</View>
				)}

				<TextInput
					style={styles.input}
					placeholder="Enter your guess"
					value={userInput}
					onChangeText={setUserInput}
					onKeyPress={handleKeyPress}
					editable={!loading && gameStatus !== 'won'}
				/>
				
				<View style={styles.submitButtonContainer}>
					<Button
						title={loading ? "Calculating..." : "Submit Guess"}
						onPress={handleGuess}
						disabled={loading || !userInput || gameStatus === 'won'}
						color={Colors.primary}
					/>
				</View>

				{loading && <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />}

				{similarity > 0 && (
					<View style={styles.similarityContainer}>
						<Text style={styles.resultLabel}>Similarity: </Text>
						<Text style={[styles.resultText, { color: getSimilarityColor(similarity) }]}>
							{similarity.toFixed(2)}
						</Text>
					</View>
				)}
			</Surface>

			{guesses.length > 0 && (
				<Surface style={styles.card}>
					<Text style={styles.guessesTitle}>Previous Guesses:</Text>
					<ScrollView style={styles.guessesListContainer}>
						{guesses.map((guess, index) => (
							<View key={index} style={styles.guessItem}>
								<Text style={styles.guessWord}>{guess.word}</Text>
								{guess.similarity === null ? (
									<ActivityIndicator size="small" color="#0000ff" />
								) : (
									<Text style={[
										styles.guessSimilarity, 
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
			
			<Surface style={styles.card}>
				<Text style={styles.instructionsTitle}>How to Play:</Text>
				<Text style={styles.instructionsText}>
					Try to guess the hidden word. The similarity score (0-1) shows how close your guess is semantically to the target word.
				</Text>
			</Surface>
		</View>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		alignItems: 'center',
		padding: 16,
		maxWidth: 600,
		alignSelf: "center",
		width: "100%",
	},
	card: {
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 16,
		width: '100%',
		marginBottom: 16,
	},
	targetContainer: {
		marginBottom: 20,
		alignItems: 'center',
	},
	label: {
		fontSize: 16,
		color: '#7f8c8d',
		marginBottom: 5,
	},
	targetText: {
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 16,
		color: '#2c3e50',
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
	buttonContainer: {
		flex: 1,
		marginHorizontal: 5,
	},
	submitButtonContainer: {
		marginVertical: 10,
	},
	input: {
		height: 50,
		borderColor: '#bdc3c7',
		borderWidth: 1,
		borderRadius: 8,
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
		marginTop: 16,
	},
	resultLabel: {
		fontSize: 18,
		color: '#7f8c8d',
	},
	resultText: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	hintContainer: {
		padding: 10,
		marginBottom: 16,
		backgroundColor: '#ecf0f1',
		borderRadius: 8,
		alignItems: 'center',
	},
	hintText: {
		fontSize: 16,
		fontStyle: 'italic',
		color: '#34495e',
	},
	guessesTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#2c3e50',
	},
	guessesListContainer: {
		maxHeight: 220,
	},
	guessItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#ecf0f1',
	},
	guessWord: {
		fontSize: 16,
		color: '#2c3e50',
	},
	guessSimilarity: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	instructionsTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#2c3e50',
	},
	instructionsText: {
		fontSize: 14,
		lineHeight: 20,
		color: '#7f8c8d',
	},
	wonBanner: {
		backgroundColor: '#2ecc71',
		padding: 10,
		borderRadius: 8,
		marginBottom: 16,
		width: '100%',
		alignItems: 'center',
	},
	wonText: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
	},
});
