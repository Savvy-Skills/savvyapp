import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, StyleSheet, Platform, useWindowDimensions, LayoutChangeEvent } from "react-native";
import { Text, Button } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { generateColors } from "@/utils/utilfunctions";
import { useKeyPress } from "@/hooks/useKeyboard";
import styles from "@/styles/styles";
import Svg, { Text as SvgText, Rect } from "react-native-svg";
import { ContentInfo } from "@/types";

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


const TokenizeComponent = ({ content }: { content?: ContentInfo }) => {
	const [text] = useState(
		content?.state.value ?? ""
	);
	const [tokenizingState, setTokenizingState] = useState<"tokenizing" | "stop" | "end" | "initial">("initial");
	const [selectionStart, setSelectionStart] = useState(0);
	const [selectionEnd, setSelectionEnd] = useState(0);
	const [segments, setSegments] = useState<TokenSegment[]>([
		{ text, isToken: false }
	]);
	const [tokenCount, setTokenCount] = useState(0);

	// Add new state for SVG dimensions
	const [svgWidth, setSvgWidth] = useState(0);
	const containerRef = useRef<ScrollView>(null);
	const { width } = useWindowDimensions();

	// Calculate character positions and dimensions
	const [charPositions, setCharPositions] = useState([]);

	// Function to measure container width when mounted
	useEffect(() => {
		if (containerRef.current && Platform.OS === 'web') {
		} else {
			// For non-web platforms
			setSvgWidth(width - 16); // Account for padding
		}
	}, []);

	const handleLayout = (event: LayoutChangeEvent) => {
		if (containerRef.current) {
			const containerWidth = event.nativeEvent.layout.width;
			setSvgWidth(containerWidth - 16); // Account for container padding
		}
	};

	const startTokenizing = () => {
		// Find position after the last token
		let startPosition = 0;
		let currentPos = 0;

		// Loop through segments to find the end of the last token
		segments.forEach(segment => {
			currentPos += segment.text.length;
			// If this segment is a token, update our start position to the end of it
			if (segment.isToken) {
				startPosition = currentPos;
			}
		});

		// Start tokenizing from that position
		setTokenizingState("tokenizing");
		setSelectionStart(startPosition);
		setSelectionEnd(startPosition + 1);
	};

	const stopTokenizing = () => {
		setTokenizingState("stop");
		setSelectionStart(0);
		setSelectionEnd(0);
		if (tokenCount === 0) {
			setTokenizingState("initial");
		}
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

					// The new token - IMPORTANT: preserve spaces exactly as they appear
					const tokenText = segment.text.substring(
						selectionStart - segmentStart,
						selectionEnd - segmentStart
					);

					newSegments.push({
						text: tokenText, // Don't trim or modify the token text
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
		setTokenizingState("tokenizing");
	};

	// New function to render text in SVG with improved word wrapping
	const renderSvgText = () => {
		// Calculate positions for each character
		const characters: {
			char: string;
			x: number;
			y: number;
			selected: boolean;
			absPosition: number;
			isTokenChar: boolean;
			tokenId: number;
		}[] = [];

		const tokens: {
			text: string;
			x: number;
			y: number;
			width: number;
			height: number;
			tokenId: number
		}[] = [];

		let currentX = 0;
		let currentY = 20; // Starting Y position
		let charPos = 0; // Track absolute character position
		const lineHeight = 20;
		const charWidth = 8; // Approximate width for monospace character

		// Process segments
		segments.forEach((segment) => {
			if (segment.isToken) {
				// Handle token as a unit for display
				const tokenWidth = segment.text.length * charWidth;

				// Wrap token to next line if needed
				if (currentX + tokenWidth > svgWidth) {
					currentX = 0;
					currentY += lineHeight;
				}

				// Render each character of the token individually to preserve spaces
				for (let i = 0; i < segment.text.length; i++) {
					const char = segment.text[i];

					characters.push({
						char: char,
						x: currentX + (i * charWidth),
						y: currentY,
						selected: false,
						absPosition: charPos + i,
						isTokenChar: true,
						tokenId: segment.tokenId || 0
					});
				}

				// Add token background rectangle
				tokens.push({
					text: segment.text,
					x: currentX,
					y: currentY,
					width: tokenWidth,
					height: lineHeight,
					tokenId: segment.tokenId || 0,
				});

				// Advance character position by token length
				charPos += segment.text.length;
				currentX += tokenWidth;
			} else {
				// Process non-token text word by word for wrapping
				const words = segment.text.split(/(\s+)/); // Split by whitespace, keeping separators

				for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
					const word = words[wordIndex];
					const wordWidth = word.length * charWidth;

					// Check if this word should wrap to next line
					const isWhitespace = word.trim() === '';
					if (!isWhitespace && currentX + wordWidth > svgWidth) {
						// Move to next line before rendering this word
						currentX = 0;
						currentY += lineHeight;
					} else if (isWhitespace && currentX + wordWidth > svgWidth) {
						// If it's just whitespace at the end of a line, skip to next line
						currentX = 0;
						currentY += lineHeight;
						continue; // Skip rendering the space at line end
					}

					// Process each character in the word 
					for (let i = 0; i < word.length; i++) {
						const char = word[i];

						// Track if this character is selected
						const isSelected =
							tokenizingState !== "stop" &&
							charPos >= selectionStart &&
							charPos < selectionEnd;

						characters.push({
							char: char,
							x: currentX,
							y: currentY,
							selected: isSelected,
							absPosition: charPos,
							isTokenChar: false,
							tokenId: 0
						});

						// Move to next character position within word
						currentX += charWidth;
						charPos++;
					}
				}
			}
		});

		// Calculate SVG height based on the last line
		const svgHeight = currentY + lineHeight;

		return (
			<Svg width={svgWidth} height={svgHeight}>
				{/* Render tokens */}
				{tokens.map((token, index) => (
					<Rect
						key={`token-${index}`}
						x={token.x}
						y={token.y - 15}
						width={token.width}
						height={token.height}
						fill={pastelColors[token.tokenId % pastelColors.length]}
						rx={3}
						ry={3}
					/>
				))}

				{/* Render all characters */}
				{characters.map((char, index) => (
					<React.Fragment key={`char-${index}`}>
						{/* Highlight selected characters individually */}
						{char.selected && !char.isTokenChar && (
							<Rect
								x={char.x}
								y={char.y - 15}
								width={charWidth}
								height={lineHeight}
								fill={generateColors(Colors.primaryLighter, 0.3).normal}
								rx={2}
								ry={2}
							/>
						)}

						<SvgText
							key={`char-text-${index}`}
							x={char.x}
							y={char.y}
							fill="black"
							fontSize="14"
							fontFamily="monospace"
						>
							{char.char === ' ' ? '\u00A0' : char.char}
						</SvgText>
					</React.Fragment>
				))}
			</Svg>
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


	const instructions = tokenizingState === "initial" ?
		"Click the start button below to start tokenizing." :
		tokenizingState === "tokenizing" ?
			"Cut the sentence into the tokens you want to create. Use the buttons or the keyboard to create tokens." :
			tokenizingState === "stop" ?
				"You can continue your progress or restart." :
				tokenizingState === "end" ?
					"You've finished tokenizing. You can restart your progress." : "";

	return (
		<View style={localStyles.container}>
			<Text style={localStyles.title}>Do your tokens!</Text>
			<Text style={localStyles.instructions}>
				{instructions}
			</Text>

			<ScrollView
				style={localStyles.textContainer}
				ref={containerRef}
				onLayout={handleLayout}
			>
				{svgWidth > 0 ? renderSvgText() : null}
			</ScrollView>

			<View style={localStyles.buttonContainer}>
				{tokenizingState === "initial" || tokenizingState === "stop" ? (
					<View style={localStyles.buttonRow}>
						{tokenCount > 0 && tokenizingState === "stop" && (
							<Button
								mode="outlined"
								onPress={resetTokenization}
								style={[styles.savvyButton, { backgroundColor: Colors.lightOrange, borderColor: Colors.lightOrange }]}
								labelStyle={[styles.savvyContainedButtonText, { color: Colors.text }]}
								icon="restart"
							>
								Restart
							</Button>
						)}
						<Button
							mode="contained"
							onPress={startTokenizing}
							style={[styles.savvyButton, styles.savvyContainedButton]}
							labelStyle={styles.savvyContainedButtonText}
							icon="play"
						>
							{tokenCount > 0 ? "Continue Tokenizing" : "Start Tokenizing"}
						</Button>


					</View>
				) : tokenizingState === "tokenizing" ? (
					<View style={localStyles.tokenizingButtonsContainer}>
						{/* Top row - arrow buttons */}
						<View style={localStyles.arrowButtonsRow}>
							<Button
								mode="outlined"
								onPress={moveSelectionLeft}
								style={[styles.savvyButton, styles.savvyOutlinedButton, localStyles.arrowButton]}
								labelStyle={styles.savvyOutlinedButtonText}
								icon="arrow-left"
							>
								Smaller
							</Button>

							<Button
								mode="outlined"
								onPress={moveSelectionRight}
								style={[styles.savvyButton, styles.savvyOutlinedButton, localStyles.arrowButton]}
								labelStyle={styles.savvyOutlinedButtonText}
								icon="arrow-right"
							>
								Larger
							</Button>
						</View>

						{/* Bottom row - action buttons */}
						<View style={localStyles.actionButtonsRow}>
							<Button
								mode="outlined"
								onPress={stopTokenizing}
								style={[styles.savvyButton, styles.savvyOutlinedButton, localStyles.wideButton, { borderColor: Colors.orange }]}
								labelStyle={[styles.savvyOutlinedButtonText, { color: Colors.orange }]}
								icon="stop"
							>
								Stop
							</Button>
							<Button
								mode="contained"
								onPress={createToken}
								style={[styles.savvyButton, styles.savvyContainedButton, localStyles.wideButton]}
								labelStyle={styles.savvyContainedButtonText}
								icon="scissors-cutting"
							>
								Create Token
							</Button>
						</View>
					</View>
				) : (
					<Button
						mode="contained"
						onPress={resetTokenization}
						style={[styles.savvyButton, styles.savvyContainedButton, localStyles.wideButton]}
						labelStyle={styles.savvyContainedButtonText}
					>
						Restart
					</Button>
				)}
			</View>

			{Platform.OS === 'web' && tokenizingState === "tokenizing" && (
				<View style={localStyles.keyboardHelpContainer}>
					<Text style={localStyles.keyboardHelpText}>
						Keyboard shortcuts: ← Smaller | → Larger | Enter Create Token | Esc Stop
					</Text>
				</View>
			)}

			<View style={localStyles.statistics}>
				<View style={localStyles.stat}>
					{/* Show the length of the text */}
					<Text style={localStyles.statValue}>{text.length}</Text>
					<Text style={localStyles.statLabel}>Characters</Text>
				</View>
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
	instructions: {
		fontSize: 16,
	},
	textContainer: {
		flex: 1,
		flexGrow: 1,
		maxHeight: 150,
		borderWidth: 1,
		borderColor: Colors.revealed,
		borderRadius: 4,
		padding: 8,
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
		width: '100%',
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 8,
	},
	tokenizingButtonsContainer: {
		width: '100%',
		gap: 8,
	},
	arrowButtonsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 8,
	},
	actionButtonsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 8,
	},
	arrowButton: {
		minWidth: 100,
		flex: 1,
	},
	wideButton: {
		minWidth: 100,
		alignSelf: 'stretch',
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
		textAlign: 'center',
	},
});

export default TokenizeComponent; 