import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Platform } from "react-native";
import { Text, Button } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { generateColors } from "@/utils/utilfunctions";
import { useKeyPress } from "@/hooks/useKeyboard";
import styles from "@/styles/styles";

const pastelColors = [
	generateColors(Colors.primary, 0.3).muted,
	generateColors(Colors.orange, 0.3).muted,
	generateColors(Colors.success, 0.3).muted,
	generateColors(Colors.error, 0.3).muted,
	generateColors(Colors.blue, 0.3).muted,
];

interface TokenSegment {
	text: string;
	isToken: boolean;
	tokenId?: number;
}

const TokenizeComponent = () => {
	const [text] = useState(
		"Replace this text in the input field to see how tokenization works. Text in the input field to see how tokenization works."
	);
	const [tokenizingState, setTokenizingState] = useState<"tokenizing" | "stop" | "continue" | "end">("stop");
	const [selectionStart, setSelectionStart] = useState(0);
	const [selectionEnd, setSelectionEnd] = useState(0);
	const [segments, setSegments] = useState<TokenSegment[]>([
		{ text, isToken: false }
	]);
	const [tokenCount, setTokenCount] = useState(0);


	const startTokenizing = () => {
		setTokenizingState("continue");
		setSelectionStart(0);
		setSelectionEnd(1);
	};

	const stopTokenizing = () => {
		setTokenizingState("stop");
		setSelectionStart(0);
		setSelectionEnd(0);
	};

	const endTokenizing = () => {
		setTokenizingState("end");
		setSelectionStart(0);
		setSelectionEnd(0);
	};

	const moveSelectionRight = () => {
		if (tokenizingState !== "stop" && selectionEnd < text.length) {
			setSelectionEnd(selectionEnd + 1);
		}
	};

	const moveSelectionLeft = () => {
		if (tokenizingState !== "stop" && selectionEnd > selectionStart + 1) {
			setSelectionEnd(selectionEnd - 1);
		}
	};

	const createToken = () => {
		if (tokenizingState === "stop" || selectionStart === selectionEnd) return;

		// Create a new token from the current selection
		const newSegments: TokenSegment[] = [];
		let currentPos = 0;

		segments.forEach(segment => {
			if (!segment.isToken) {
				const segmentStart = currentPos;
				const segmentEnd = currentPos + segment.text.length;

				// If selection is within this segment
				if (selectionStart >= segmentStart && selectionStart < segmentEnd) {
					// Text before selection
					if (selectionStart > segmentStart) {
						newSegments.push({
							text: segment.text.substring(0, selectionStart - segmentStart),
							isToken: false
						});
					}

					// The new token
					newSegments.push({
						text: segment.text.substring(selectionStart - segmentStart, selectionEnd - segmentStart),
						isToken: true,
						tokenId: tokenCount
					});

					// Text after selection
					if (selectionEnd < segmentEnd) {
						newSegments.push({
							text: segment.text.substring(selectionEnd - segmentStart),
							isToken: false
						});
					}
				} else {
					newSegments.push(segment);
				}
			} else {
				newSegments.push(segment);
			}

			currentPos += segment.text.length;
		});

		setSegments(newSegments);
		setTokenCount(tokenCount + 1);

		// Move selection to the next character after the token
		setSelectionStart(selectionEnd);
		setSelectionEnd(selectionEnd + 1);

		// If we've reached the end, update the tokenizing state
		if (selectionEnd >= text.length) {
			endTokenizing();
		}
	};

	const resetTokenization = () => {
		// Reset to initial state
		setSegments([{ text, isToken: false }]);
		setTokenCount(0);
		setSelectionStart(0);
		setSelectionEnd(1);
		setTokenizingState("start");
	};

	// Render the text with tokens and current selection highlighted
	const renderText = () => {
		let currentPos = 0;

		return (
			<View style={localStyles.textRow}>
				{segments.map((segment, index) => {
					const segmentStart = currentPos;
					currentPos += segment.text.length;

					if (segment.isToken) {
						return (
							<View
								key={index}
								style={[
									localStyles.token,
									{ backgroundColor: pastelColors[segment.tokenId! % pastelColors.length] }
								]}
							>
								<Text>{segment.text}</Text>
							</View>
						);
					} else {
						// Split by words instead of characters
						const words = segment.text.split(/(\s+)/);
						return (
							<View key={index} style={localStyles.textSegment}>
								{words.map((word, wordIndex) => {
									const wordStart = segmentStart + 
										words.slice(0, wordIndex).join('').length;
									
									return (
										<View key={wordIndex} style={localStyles.word}>
											{word.split('').map((char, charIndex) => {
												const charPos = wordStart + charIndex;
												const isSelected = tokenizingState !== "stop" &&
													charPos >= selectionStart &&
													charPos < selectionEnd;

												return (
													<Text
														key={charIndex}
														style={[
															isSelected ? localStyles.selectedChar : localStyles.normalChar,
															localStyles.character
														]}
													>
														{char === ' ' ? '\u00A0' : char}
													</Text>
												);
											})}
										</View>
									);
								})}
							</View>
						);
					}
				})}
			</View>
		);
	};

	// Add keyboard shortcuts for web platform
	if (Platform.OS === 'web') {
		useKeyPress({
			'ArrowLeft': () => {
				if (tokenizingState !== "stop") {
					moveSelectionLeft();
				}
			},
			'ArrowRight': () => {
				if (tokenizingState !== "stop") {
					moveSelectionRight();
				}
			},
			'Enter': () => {
				if (tokenizingState !== "stop") {
					createToken();
				}
			},
			'Escape': () => {
				if (tokenizingState !== "stop") {
					stopTokenizing();
				}
			}
		});
	}

	return (
		<View style={localStyles.container}>
			<Text style={localStyles.title}>Manual Tokenization Exercise</Text>

			<ScrollView style={localStyles.textContainer}>
				{renderText()}
			</ScrollView>

			<View style={localStyles.buttonContainer}>
				{tokenizingState === "stop" ? (
					<>
						<Button
							mode="contained"
							onPress={startTokenizing}
							style={styles.savvyButton}
						>
							{tokenCount > 0 ? "Continue Tokenizing" : "Start Tokenizing"}
						</Button>

						{tokenCount > 0 && (
							<Button
								mode="outlined"
								onPress={resetTokenization}
								style={styles.savvyButton}
							>
								Restart
							</Button>
						)}
					</>
				) : tokenizingState === "continue" || tokenizingState === "start" ? (
					<>
						<Button
							mode="outlined"
							onPress={moveSelectionLeft}
							style={styles.savvyButton}
							icon="arrow-left"
						>
							Smaller
						</Button>

						<Button
							mode="contained"
							onPress={createToken}
							style={styles.savvyButton}
						>
							Create Token
						</Button>

						<Button
							mode="outlined"
							onPress={moveSelectionRight}
							style={styles.savvyButton}
							icon="arrow-right"
						>
							Larger
						</Button>

						<Button
							mode="outlined"
							onPress={stopTokenizing}
							style={styles.savvyButton}
							icon="stop"
						>
							Stop
						</Button>
					</>
				) : (
					<Button
						mode="contained"
						onPress={resetTokenization}
						style={styles.savvyButton}
					>
						Restart
					</Button>
				)}
			</View>

			{Platform.OS === 'web' && tokenizingState !== "stop" && (
				<View style={localStyles.keyboardHelpContainer}>
					<Text style={localStyles.keyboardHelpText}>
						Keyboard shortcuts: ← Smaller | → Larger | Enter Create Token | Esc Stop
					</Text>
				</View>
			)}

			<View style={localStyles.statistics}>
				<View style={localStyles.stat}>
					<Text style={localStyles.statValue}>{tokenCount}</Text>
					<Text style={localStyles.statLabel}>Tokens Created</Text>
				</View>
			</View>
		</View>
	);
};

const localStyles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: Colors.background,
		maxWidth: 600,
		alignSelf: 'center',
		width: '100%',
		gap: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	textContainer: {
		flex: 1,
		flexGrow: 1,
		maxHeight: 150,
		borderWidth: 1,
		borderColor: Colors.revealed,
		backgroundColor: Colors.revealedBackground,
		borderRadius: 4,
		padding: 8,
		width: '100%',
	},
	textDisplay: {
		flex: 1,
	},
	textRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'flex-start',
		width: '100%',
	},
	textSegment: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'flex-start',
	},
	word: {
		flexDirection: 'row',
		flexWrap: 'nowrap',
		alignItems: 'center',
		maxWidth: '100%',
		flexShrink: 1,
	},
	character: {
		flexShrink: 0,
	},
	token: {
		borderRadius: 3,
		marginRight: 2,
		marginBottom: 2,
		padding: 2,
		flexShrink: 1,
		maxWidth: '100%',
	},
	selectedChar: {
		backgroundColor: generateColors(Colors.primaryLighter, 0.3).normal,
	},
	normalChar: {
		backgroundColor: 'transparent',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		gap: 8,

	},
	button: {
		flex: 1,
		marginHorizontal: 4,
	},
	statistics: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	stat: {
		alignItems: 'center',
	},
	statValue: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	statLabel: {
		fontSize: 14,
	},
	keyboardHelpContainer: {
		marginTop: 8,
		paddingVertical: 8,
		backgroundColor: Colors.revealedBackground,
		borderRadius: 4,
		alignItems: 'center',
	},
	keyboardHelpText: {
		fontSize: 12,
		color: Colors.text,
	},
});

export default TokenizeComponent; 