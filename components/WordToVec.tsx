import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { IconButton, Surface, Tooltip } from 'react-native-paper';
import { Colors } from "@/constants/Colors";
import styles from "@/styles/styles";
import { Button, Text, TextInput, ActivityIndicator } from "react-native-paper";
import ConfirmationDialog from "./modals/ConfirmationDialog";
import { useWordToVec } from "@/hooks/useWordToVec";
import { DatasetInfo } from "@/types";

export default function WordToVec({ index, dataset_info }: { index: number, dataset_info: DatasetInfo }) {
	const [userInput, setUserInput] = useState<string>("");
	const [showGiveUpDialog, setShowGiveUpDialog] = useState<boolean>(false);

	const {
		currentWord,
		loading,
		guesses,
		gameStatus,
		currentWordHint,
		guessWord,
		giveUp,
		getWordHint,
		metadata,
		showAnswer,
	} = useWordToVec({ gameId: `word2vec-${index}`, dataset_info });

	const handleGuess = useCallback(async () => {
		if (!userInput) return;
		guessWord(userInput);
		try {
			setUserInput("");
		} catch (error) {
			console.error("Error handling guess:", error);
		} finally {
		}
	}, [userInput, guesses, currentWord]);

	const handleGiveUp = useCallback(() => {
		if (gameStatus === 'won') return;
		giveUp();
	}, [gameStatus, currentWord]);

	// Handle Enter key press
	const handleKeyPress = useCallback((e: any) => {
		if (e.key === 'Enter' && userInput && !loading) {
			handleGuess();
		}
	}, [userInput, loading, handleGuess]);

	const getHint = useCallback(() => {
		if (guesses.length === 0) return "No guesses yet";
		const lastSimilarity = guesses[guesses.length - 1]?.similarity || 0;
		if (lastSimilarity < 0.3) return "You're very cold";
		if (lastSimilarity < 0.5) return "Getting warmer";
		if (lastSimilarity < 0.7) return "You're hot!";
		if (lastSimilarity < 0.9) return "You're very close!";
		return "You got it!";
	}, [guesses]);

	const getSimilarityColor = useCallback((value: number) => {
		if (value < 0.3) return Colors.error; // red
		if (value < 0.5) return Colors.warning; // orange
		if (value < 0.7) return Colors.lightOrange; // yellow
		if (value < 0.9) return Colors.success; // light green
		return Colors.success; // green
	}, []);

	const hint = useMemo(() => getHint(), [getHint]);

	const similarity = useMemo(() => {
		if (guesses.length === 0) return 0;
		// Last guess similarity
		return guesses[guesses.length - 1].similarity || 0;
	}, [guesses]);

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
							{showAnswer ? currentWord : "?????"}
						</Text>
						{!showAnswer && (
							<IconButton
								icon={showAnswer ? "eye-off" : "eye"}
								size={20}
								onPress={() => setShowGiveUpDialog(true)}
								iconColor={Colors.revealedButton}
							/>
						)}
					</View>
				</View>
				<Text style={localStyles.instructionsText}>
					The nearest word has a similarity of 
					<Text style={{ fontWeight: 'bold' }}><Tooltip title={metadata.nearestSimilarity?.word}><Text style={{ fontWeight: 'bold' }}> {metadata.nearestSimilarity?.similarity.toFixed(2)}</Text></Tooltip></Text>,
					the tenth-nearest has a similarity of 
					<Text style={{ fontWeight: 'bold' }}><Tooltip title={metadata.tenthNearestSimilarity?.word}><Text style={{ fontWeight: 'bold' }}>{metadata.tenthNearestSimilarity?.similarity.toFixed(2)} </Text></Tooltip></Text> 
					and the hundreth nearest word has a similarity of 
					<Text style={{ fontWeight: 'bold' }}><Tooltip title={metadata.hundredthNearestSimilarity?.word}><Text style={{ fontWeight: 'bold' }}> {metadata.hundredthNearestSimilarity?.similarity.toFixed(2)}</Text></Tooltip></Text>
				</Text>
				{currentWordHint && (
					<Text style={[localStyles.wordHintText, styles.centerText]}>{currentWordHint}</Text>
				)}
				{/* {(gameStatus === 'won' || gameStatus === 'lost') && (
					<Button
						mode="contained"
						style={[styles.savvyButton, styles.lightOrangeButton]}
						labelStyle={[styles.buttonLabel]}
						onPress={() => { startGame() }}
					>
						New Game
					</Button>
				)} */}
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
						onPress={() => getWordHint()}
					>
						Hint
					</Button>
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
		alignSelf: "center",
		width: "100%",
		gap: 16,
		marginTop: 8,
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
