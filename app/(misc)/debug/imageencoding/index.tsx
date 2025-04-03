import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, ScrollView, Image, TextInput, Platform } from "react-native";
import { Surface, Text, Button, SegmentedButtons, IconButton, ActivityIndicator, Tooltip } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import styles from "@/styles/styles";
import { Colors } from "@/constants/Colors";
import ImagePixelExtractor from "@/components/react/ImagePixelExtractor";
import ExpandableFunFact from "@/components/ui/ExpandableFunFact";

export default function ImageEncoding() {
	const [imageUri, setImageUri] = useState<string | null>(null);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [processing, setProcessing] = useState(false);
	const [rgbValues, setRgbValues] = useState<Array<[number, number, number]>>([]);
	const [grayscaleValues, setGrayscaleValues] = useState<number[]>([]);
	const [activeTab, setActiveTab] = useState<"grid" | "image">("grid");
	const pixelExtractorRef = useRef(null);

	// Separate hover states for RGB and grayscale grids
	const [hoveredRgbPixel, setHoveredRgbPixel] = useState<{
		index: number;
		rgb: [number, number, number];
	} | null>(null);

	const [hoveredGrayscalePixel, setHoveredGrayscalePixel] = useState<{
		index: number;
		grayscale: number;
	} | null>(null);

	// Pick an image from the device
	const pickImage = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.5,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				setProcessing(true);
				await processImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error("Error picking image:", error);
		}
	};

	// Load an image from URL
	const loadImageFromUrl = async () => {
		if (!imageUrl) {
			return;
		}

		try {
			setProcessing(true);

			// For web, we can use the URL directly
			if (Platform.OS === 'web') {
				await processImage(imageUrl);
				return;
			}

			// For native, we need to download the image first
			const fileUri = FileSystem.cacheDirectory + "temp_image.jpg";
			const download = await FileSystem.downloadAsync(imageUrl, fileUri);

			if (download.status === 200) {
				await processImage(fileUri);
			} else {
				throw new Error("Failed to download image");
			}
		} catch (error) {
			console.error("Error loading image from URL:", error);
			setProcessing(false);
		}
	};

	// Process the image to extract pixel data
	const processImage = async (uri: string) => {
		try {
			// Resize image to 30x30
			const resizedImage = await ImageManipulator.manipulateAsync(
				uri,
				[{ resize: { width: 30, height: 30 } }],
				{ format: ImageManipulator.SaveFormat.PNG }
			);

			setImageUri(resizedImage.uri);

			// The pixel extraction will be handled by the ImagePixelExtractor component
			setProcessing(false);
		} catch (error) {
			console.error("Error processing image:", error);
			setProcessing(false);
		}
	};

	// Handle the pixel data received from the extractor
	const handlePixelDataExtracted = (
		rgbArray: Array<[number, number, number]>,
		grayscaleArray: number[]
	) => {
		setRgbValues(rgbArray);
		setGrayscaleValues(grayscaleArray);
	};

	// Handle extraction errors
	const handleExtractionError = (error: string) => {
		console.error("Image pixel extraction error:", error);
		// You might want to show an error message to the user
	};

	// Updated hover handlers for separate states
	const handleRgbPixelHover = (index: number) => {
		if (rgbValues[index]) {
			setHoveredRgbPixel({
				index,
				rgb: rgbValues[index]
			});
		}
	};

	const handleGrayscalePixelHover = (index: number) => {
		if (grayscaleValues[index]) {
			setHoveredGrayscalePixel({
				index,
				grayscale: grayscaleValues[index]
			});
		}
	};

	const handleRgbPixelLeave = () => {
		setHoveredRgbPixel(null);
	};

	const handleGrayscalePixelLeave = () => {
		setHoveredGrayscalePixel(null);
	};

	return (
		<Surface style={styles.detailsContainer}>
			<Text style={styles.title}>Image Encoding</Text>

			<Text style={localStyles.introText}>
				Let's explore how computers "see" images! This fun activity shows how pictures transform into numbers that computers can understand and learn from.
			</Text>

			<Surface style={[localStyles.stepSection, { backgroundColor: 'transparent' }]}>
				<Text style={localStyles.stepTitle}>
					<Text style={localStyles.stepNumber}>Step 1</Text> Image Input
				</Text>
				<Text style={localStyles.stepDescription}>
					Choose any image you'd like to explore! While we see pictures, computers need to learn how to "see" them in their own special way.
				</Text>

				<Text style={localStyles.stepDescription}>
					Did you know? Computers are actually "number machines" - they can't really see your picture! Instead, they turn every dot (pixel) in your image into numbers they can understand.
				</Text>

				<View style={localStyles.inputGroup}>
					<View style={localStyles.inputSection}>
						<Text style={localStyles.sectionTitle}>Option 1: Enter Image URL</Text>
						<View style={localStyles.inputRow}>
							<TextInput
								style={localStyles.textInput}
								placeholder="Paste image URL here"
								value={imageUrl}
								onChangeText={setImageUrl}
							/>
							<Button
								mode="contained"
								onPress={loadImageFromUrl}
								disabled={processing || !imageUrl}
								style={[localStyles.button, styles.savvyButton, styles.primaryButton]}
							>
								Load URL
							</Button>
						</View>
					</View>

					<View style={localStyles.inputSection}>
						<Text style={localStyles.sectionTitle}>Option 2: Select Image</Text>
						<Button
							mode="contained"
							icon="image"
							onPress={pickImage}
							disabled={processing}
							style={[localStyles.button, styles.savvyButton, styles.primaryButton]}
						>
							Pick Image
						</Button>
					</View>
				</View>
			</Surface>

			{processing && (
				<View style={localStyles.loadingContainer}>
					<Text>Processing image...</Text>
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			)}

			{imageUri && (
				<Surface style={[localStyles.stepSection, { backgroundColor: 'transparent' }]}>
					<Text style={localStyles.stepTitle}>
						<Text style={localStyles.stepNumber}>Step 2</Text> Resizing and Standardization
					</Text>
					<Text style={localStyles.stepDescription}>
						Imagine if you tried to compare a tiny postcard with a giant poster - that would be hard! Computers feel the same way, so we make all pictures the exact same size. For our activity, we're using a 30×30 grid (like a tiny checkerboard with 900 squares).
					</Text>

					<View style={localStyles.imageContainer}>
						<Image
							source={{ uri: imageUri }}
							style={localStyles.originalImage}
							resizeMode="contain"
						/>
					</View>
					<ExpandableFunFact title="Fun Fact: AI Image Sizes">
						<Text style={localStyles.funFactText}>
							Different AI models use different sized grids! A handwriting recognition system (MNIST) uses 28×28 squares, while an object-spotting AI (MobileNet) uses much bigger 224×224 grids - that's over 50,000 squares! Bigger pictures can show more details but need more computing power.
						</Text>
					</ExpandableFunFact>
				</Surface>
			)}

			{rgbValues.length > 0 && (
				<Surface style={[localStyles.stepSection, { backgroundColor: 'transparent' }]}>
					<Text style={localStyles.stepTitle}>
						<Text style={localStyles.stepNumber}>Step 3</Text> RGB Value Extraction
					</Text>
					<Text style={localStyles.stepDescription}>
						Each tiny square in your image is like a recipe with three ingredients: Red, Green, and Blue (RGB). Mix different amounts of each (from 0 to 255) to create any color! The spicy red of a strawberry might be (255, 0, 0), while ocean blue could be (0, 0, 255). The grid below shows all 900 colorful squares from your image!
					</Text>

					<View style={localStyles.hoverInstructionContainer}>
						<IconButton icon="cursor-default-click-outline" size={16} style={localStyles.hoverIcon} />
						<Text style={localStyles.hoverInstructionText}>
							Hover over pixels to see their RGB values
						</Text>
					</View>

					<View style={localStyles.gridContainer}>
						<ScrollView horizontal style={localStyles.gridScrollView}>
							<View style={localStyles.grid}>
								{rgbValues.map((rgb, index) => (
									<Tooltip title={`R: ${rgb[0]}, G: ${rgb[1]}, B: ${rgb[2]}`} enterTouchDelay={0} leaveTouchDelay={0}>
										<View
											key={`rgb-${index}`}
											style={[
												localStyles.pixel,
												{ backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` }
											]}
											onPointerEnter={() => handleRgbPixelHover(index)}
											onPointerLeave={handleRgbPixelLeave}
										/>
									</Tooltip>
								))}
							</View>

						</ScrollView>
					</View>

					{/* RGB grid pixel info container */}
					<View style={localStyles.pixelInfoContainer}>
						<View style={localStyles.colorValuesContainer}>
							<Text style={localStyles.pixelInfoLabel}>
								<Text style={localStyles.labelText}>R: </Text>
								<Text style={[
									localStyles.pixelInfoValue,
									{ color: `rgb(${hoveredRgbPixel?.rgb?.[0] || 0}, 0, 0)` }
								]}>
									{hoveredRgbPixel?.rgb?.[0] || 0}
								</Text>

								<Text style={localStyles.separator}> | </Text>

								<Text style={localStyles.labelText}>G: </Text>
								<Text style={[
									localStyles.pixelInfoValue,
									{ color: `rgb(0, ${hoveredRgbPixel?.rgb?.[1] || 0}, 0)` }
								]}>
									{hoveredRgbPixel?.rgb?.[1] || 0}
								</Text>

								<Text style={localStyles.separator}> | </Text>

								<Text style={localStyles.labelText}>B: </Text>
								<Text style={[
									localStyles.pixelInfoValue,
									{ color: `rgb(0, 0, ${hoveredRgbPixel?.rgb?.[2] || 0})` }
								]}>
									{hoveredRgbPixel?.rgb?.[2] || 0}
								</Text>
							</Text>
						</View>
					</View>
					<ExpandableFunFact title="Fun Fact: RGB Colors">
						<Text style={localStyles.funFactText}>
							Did you know that with just these three colors (RGB), we can create over 16 million different colors? That's because each color has 256 possible values (0-255), which gives us 256 × 256 × 256 = 16,777,216 possible combinations!
						</Text>
					</ExpandableFunFact>
				</Surface>
			)}

			{grayscaleValues.length > 0 && (
				<Surface style={[localStyles.stepSection, { backgroundColor: 'transparent' }]}>
					<Text style={localStyles.stepTitle}>
						<Text style={localStyles.stepNumber}>Step 4</Text> Grayscale Conversion
					</Text>
					<Text style={localStyles.stepDescription}>
						Think about old black and white TV shows - they didn't need color to tell a story! Similarly, we can simplify our image by averaging the three color values into one brightness number between 0 (black) and 1 (white). This creates a grayscale image that's much simpler for computers to process, while still showing the important shapes and patterns.
					</Text>



					<SegmentedButtons
						value={activeTab}
						onValueChange={(value) => setActiveTab(value as "grid" | "image")}
						buttons={[
							{ value: 'grid', label: 'Grayscale Grid', style: { ...styles.toggleButton } },
							{ value: 'image', label: 'Reconstructed Image', style: { ...styles.toggleButton } }
						]}
						style={localStyles.tabButtons}
						theme={{ roundness: 0, colors: { secondaryContainer: `${Colors.primary}20` } }}
					/>

					{activeTab === "grid" && (
						<>
							<View style={localStyles.hoverInstructionContainer}>
								<IconButton icon="cursor-default-click-outline" size={16} style={localStyles.hoverIcon} />
								<Text style={localStyles.hoverInstructionText}>
									Hover over pixels to see their grayscale values
								</Text>
							</View>
							<View style={localStyles.gridContainer}>
								<ScrollView horizontal style={localStyles.gridScrollView}>
									<View style={localStyles.grid}>
										{grayscaleValues.map((gray, index) => {
											const grayValue = Math.round(gray * 255);
											return (
												<Tooltip title={gray.toFixed(2)} enterTouchDelay={0} leaveTouchDelay={0}>

													<View
														key={`gray-${index}`}
														style={[
															localStyles.pixel,
															{ backgroundColor: `rgb(${grayValue}, ${grayValue}, ${grayValue})` }
														]}
														onPointerEnter={() => handleGrayscalePixelHover(index)}
														onPointerLeave={handleGrayscalePixelLeave}
													/>
												</Tooltip>

											);
										})}
									</View>
								</ScrollView>
							</View>
						</>
					)}

					{/* Grayscale grid pixel info container */}
					{activeTab === "grid" && (
						<View style={localStyles.pixelInfoContainer}>
							<View style={localStyles.colorValuesContainer}>
								<Text style={localStyles.pixelInfoLabel}>
									<Text style={localStyles.labelText}>Value: </Text>
									<Text style={localStyles.pixelInfoValue}>
										{hoveredGrayscalePixel?.grayscale !== undefined
											? hoveredGrayscalePixel.grayscale.toFixed(2)
											: '0.00'}
									</Text>
								</Text>
							</View>
						</View>
					)}

					{activeTab === "image" && (
						<View style={localStyles.reconstructedContainer}>
							<View style={localStyles.reconstructedImage}>
								<View style={localStyles.pixelatedGrid}>
									{grayscaleValues.map((gray, index) => {
										const grayValue = Math.round(gray * 255);
										return (
											<View
												key={`recon-${index}`}
												style={[
													localStyles.reconPixel,
													{ backgroundColor: `rgb(${grayValue}, ${grayValue}, ${grayValue})` }
												]}
											/>
										);
									})}
								</View>
							</View>
						</View>
					)}
					<ExpandableFunFact title="Fun Fact: Grayscale Images">
						<Text style={localStyles.funFactText}>
							The first digital photos were grayscale! Even today, many AI systems work with grayscale images because they focus on shapes and patterns rather than colors. This makes processing faster and often works just as well for many tasks.
						</Text>
					</ExpandableFunFact>
				</Surface>
			)}

			<ImagePixelExtractor
				ref={pixelExtractorRef}
				imageUri={imageUri}
				width={30}
				height={30}
				onPixelDataExtracted={handlePixelDataExtracted}
				onError={handleExtractionError}
			/>
		</Surface>
	);
}

const localStyles = StyleSheet.create({
	introText: {
		fontSize: 16,
		color: Colors.revealedText,
	},
	stepSection: {
		backgroundColor: "transparent",
		borderRadius: 8,
		padding: 20,
		borderLeftWidth: 4,
		borderLeftColor: Colors.blue,
	},
	stepTitle: {
		color: Colors.orange,
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 10,
	},
	stepNumber: {
		fontWeight: "bold",
		color: Colors.blue,
		backgroundColor: `${Colors.blue}20`,
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		marginRight: 5,
	},
	stepDescription: {
		marginBottom: 20,
		color: "#555",
		fontSize: 14,
	},
	inputGroup: {
		gap: 15,
		marginBottom: 20,
	},
	inputSection: {
		backgroundColor: Colors.revealedBackground,
		padding: 16,
		borderRadius: 8,
	},
	sectionTitle: {
		fontWeight: "bold",
		marginBottom: 10,
		color: Colors.blue,
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	textInput: {
		flex: 1,
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.revealed,
		borderRadius: 8,
		fontSize: 16,
		backgroundColor: "white",
		color: Colors.revealedText,
	},
	button: {
		borderRadius: 8,
	},
	loadingContainer: {
		alignItems: "center",
		padding: 20,
	},
	imageContainer: {
		alignItems: "center",
		marginVertical: 15,
	},
	originalImage: {
		width: 250,
		height: 250,
		borderRadius: 8,
	},
	gridContainer: {
		alignItems: "center",
		width: "100%",
	},
	gridScrollView: {
		maxHeight: 300,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		width: 300,
		height: 300,
		backgroundColor: Colors.revealedBackground,
	},
	pixel: {
		width: 9,
		height: 9,
		margin: 0.5, // Use margin instead of gap for more consistent spacing
	},
	tabButtons: {
		marginBottom: 15,
	},
	reconstructedContainer: {
		alignItems: "center",
		marginTop: 15,
	},
	reconstructedImage: {
		width: 300,
		height: 300,
		borderRadius: 8,
		overflow: "hidden",
	},
	pixelatedGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		width: 300,
		height: 300,
		backgroundColor: 'transparent',
	},
	reconPixel: {
		width: 10,
		height: 10,
		margin: 0,
	},
	pixelInfoContainer: {
		marginTop: 10,
		padding: 10,
		backgroundColor: Colors.revealedBackground,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.revealed,
		minHeight: 44,
		justifyContent: 'center',
		width: '100%',
	},
	colorValuesContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	pixelInfoLabel: {
		fontSize: 16,
	},
	pixelInfoValue: {
		fontSize: 16,
		fontWeight: '600',
	},
	labelText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	separator: {
		color: Colors.revealed,
	},
	funFactText: {
		fontSize: 14,
		lineHeight: 20,
		color: Colors.revealedText,
	},
	hoverInstructionContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
		backgroundColor: `${Colors.blue}10`,
		padding: 8,
		borderRadius: 4,
		alignSelf: 'center',
		width: '100%',
	},
	hoverInstructionText: {
		fontSize: 14,
		color: Colors.blue,
		fontStyle: 'italic',
	},
	hoverIcon: {
		margin: 0,
		padding: 0,
	},
}); 