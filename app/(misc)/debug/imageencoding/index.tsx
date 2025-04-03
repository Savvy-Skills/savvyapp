import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, ScrollView, TextInput, Platform } from "react-native";
import { Surface, Text, Button, SegmentedButtons, IconButton, ActivityIndicator, Tooltip, Chip } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Image } from 'expo-image';
import styles from "@/styles/styles";
import { Colors } from "@/constants/Colors";
import ImagePixelExtractor from "@/components/react/ImagePixelExtractor";
import Expandable from "@/components/ui/Expandable";
import PixelGridCanvas from "@/components/react/PixelGridCanvas";

// Define an interface for component props
interface ImageEncodingProps {
	// Control which resolutions are available (defaults to all)
	availableResolutions?: Array<30 | 50 | 100 | 224>;
	// Default resolution (must be one of availableResolutions)
	defaultResolution?: 30 | 50 | 100 | 224;
	// Whether to show sample images
	showSampleImages?: boolean;
	// Whether to allow uploading images
	allowImageUpload?: boolean;
	// Custom sample images (optional)
	customSampleImages?: Array<{
		uri: any;
		title: string;
		description?: string;
	}>;
}

const DEFAULT_LOCAL_IMAGES = [
	{
		uri: require("@/assets/images/pngs/ai.png"),
		title: "AI Simple",
		description: "This is the first image",
	},
	{
		uri: require("@/assets/images/pngs/robot.png"),
		title: "Robot",
		description: "This is the second image",
	},
	{
		uri: require("@/assets/images/pngs/icon.png"),
		title: "Savvy Logo",
		description: "This is the third image",
	},
	{
		uri: require("@/assets/images/pngs/headphones.png"),
		title: "Headphones",
		description: "This is the fourth image",
	},
];

// Default resolution options
const DEFAULT_RESOLUTION_OPTIONS = [
	{ label: '30×30', value: 30 },
	{ label: '50×50', value: 50 },
	{ label: '100×100', value: 100 },
	{ label: '224×224', value: 224 },
];

const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onerror = reject;
	reader.onload = () => {
		resolve(reader.result);
	};
	reader.readAsDataURL(blob);
});

export default function ImageEncoding({
	availableResolutions = [30, 50, 100, 224],
	defaultResolution = 30,
	showSampleImages = true,
	allowImageUpload = true,
	customSampleImages
}: ImageEncodingProps) {
	// Use the custom sample images if provided, otherwise use defaults
	const LOCAL_IMAGES = customSampleImages || DEFAULT_LOCAL_IMAGES;

	// Filter resolution options based on availableResolutions prop
	const RESOLUTION_OPTIONS = DEFAULT_RESOLUTION_OPTIONS.filter(option =>
		availableResolutions.includes(option.value as 30 | 50 | 100 | 224)
	);

	// Ensure defaultResolution is in availableResolutions
	const initialResolution = availableResolutions.includes(defaultResolution)
		? defaultResolution
		: availableResolutions[0] || 30;

	const [imageUri, setImageUri] = useState<string | null>(null);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [processing, setProcessing] = useState(false);
	const [rgbValues, setRgbValues] = useState<Array<[number, number, number]>>([]);
	const [grayscaleValues, setGrayscaleValues] = useState<number[]>([]);
	const [activeTab, setActiveTab] = useState<"grid" | "image">("grid");
	const pixelExtractorRef = useRef(null);
	const [selectedResolution, setSelectedResolution] = useState<number>(initialResolution);

	// Separate hover states for RGB and grayscale grids
	const [hoveredRgbPixel, setHoveredRgbPixel] = useState<{
		index: number;
		rgb: [number, number, number];
	} | null>(null);

	const [hoveredGrayscalePixel, setHoveredGrayscalePixel] = useState<{
		index: number;
		grayscale: number;
	} | null>(null);

	// Add a new state to track the selected image index
	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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

	// Select a local image
	const selectLocalImage = async (index: number) => {
		// Skip if already processing or this image is already selected
		if (processing || index === selectedImageIndex) {
			return;
		}
		
		try {
			setProcessing(true);
			// For local images, we need to create a URI that can be processed
			const asset = LOCAL_IMAGES[index].uri;
			// In web we need the base64 of the image
			if (Platform.OS === 'web') {
				const response = await fetch(asset.uri);
				const blob = await response.blob();
				const base64 = await convertBlobToBase64(blob) as string;
				await processImage(base64);
			} else {
				await processImage(asset);
			}
			
			// Set the selected image index after successful processing
			setSelectedImageIndex(index);
		} catch (error) {
			console.error("Error selecting local image:", error);
			setProcessing(false);
		}
	};

	// Process the image to extract pixel data
	const processImage = async (uri: string) => {
		try {
			// Resize image to selected resolution
			const resizedImage = await ImageManipulator.manipulateAsync(
				uri,
				[{ resize: { width: selectedResolution, height: selectedResolution } }],
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

	// When resolution changes, we need to reprocess the image if one is loaded
	useEffect(() => {
		if (imageUri) {
			setProcessing(true);
			processImage(imageUri);
		}
	}, [selectedResolution]);

	// For higher resolutions, use smaller gaps
	const getGapSize = (resolution: number) => {
		if (resolution <= 30) return 1;
		if (resolution <= 50) return 0.8;
		if (resolution <= 100) return 0.5;
		return 0.3; // For very high resolutions like 224x224
	};

	return (
		<View style={styles.detailsContainer}>
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

				<View style={localStyles.inputGroup}>
					{/* Resolution Selector - Only show if we have more than one resolution */}
					{RESOLUTION_OPTIONS.length > 1 && (
						<View style={localStyles.resolutionSection}>
							<Text style={localStyles.sectionTitle}>Select Resolution</Text>
							<View style={localStyles.resolutionChips}>
								{RESOLUTION_OPTIONS.map((option) => (
									<Chip
										key={option.value}
										selected={selectedResolution === option.value}
										onPress={() => setSelectedResolution(option.value)}
										style={[
											localStyles.resolutionChip,
											selectedResolution === option.value && localStyles.selectedResolutionChip
										]}
										textStyle={selectedResolution === option.value ? { color: Colors.whiteText } : null}
									>
										{option.label}
									</Chip>
								))}
							</View>
						</View>
					)}

					{/* Local Images Section - Only show if enabled */}
					{showSampleImages && LOCAL_IMAGES.length > 0 && (
						<View style={localStyles.inputSection}>
							<Text style={localStyles.sectionTitle}>
								{allowImageUpload ? "Option 1: Sample Images" : "Sample Images"}
							</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								style={localStyles.localImagesScroll}
								contentContainerStyle={localStyles.localImagesContainer}
							>
								{LOCAL_IMAGES.map((img, index) => (
									<Surface key={index} style={[
										localStyles.localImageCard,
										selectedImageIndex === index && localStyles.selectedImageCard
									]}>
										<Image
											source={img.uri}
											style={localStyles.localImageThumbnail}
											contentFit="cover"
										/>
										<Text style={localStyles.localImageTitle}>{img.title}</Text>
										<Button
											mode="outlined"
											onPress={() => selectLocalImage(index)}
											disabled={processing || selectedImageIndex === index}
											style={[
												styles.savvyButton,
												styles.savvyOutlinedButton,
												localStyles.selectButton,
												selectedImageIndex === index && localStyles.selectedButton
											]}
											contentStyle={[styles.savvyButton, localStyles.selectButton]}
											labelStyle={[
												styles.savvyOutlinedButtonText,
												localStyles.selectButtonLabel, 
												selectedImageIndex === index && localStyles.selectedButtonLabel
											]}
										>
											{selectedImageIndex === index ? "Selected" : "Select"}
										</Button>
									</Surface>
								))}
							</ScrollView>
						</View>
					)}

					{/* Upload Option - Only show if enabled */}
					{allowImageUpload && (
						<View style={localStyles.inputSection}>
							<Text style={localStyles.sectionTitle}>
								{showSampleImages ? "Option 2: Upload Image" : "Upload Image"}
							</Text>
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
					)}
					<Expandable title="Savvy Fact: Image Encoding" emoji="🖼️" color={Colors.blue}>
						<Text style={localStyles.funFactText}>
							Did you know? Computers are actually "number machines" - they can't really see your picture! Instead, they turn every dot (pixel) in your image into numbers they can understand.
						</Text>
					</Expandable>
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
						Imagine if you tried to compare a tiny postcard with a giant poster - that would be hard! Computers feel the same way, so we make all pictures the exact same size. For our activity, we're using a {selectedResolution}×{selectedResolution} grid (like a tiny checkerboard with {selectedResolution * selectedResolution} squares).
					</Text>

					<View style={localStyles.imageContainer}>
						<Image
							source={{ uri: imageUri }}
							style={localStyles.originalImage}
							contentFit="contain"
						/>
					</View>
					<Expandable title="Savvy Fact: AI Image Sizes" emoji="🖼️" color={Colors.blue}>
						<Text style={localStyles.funFactText}>
							Different AI models use different sized grids! A handwriting recognition system (MNIST) uses 28×28 squares, while an object-spotting AI (MobileNet) uses much bigger 224×224 grids - that's over 50,000 squares! Bigger pictures can show more details but need more computing power.
						</Text>
					</Expandable>
				</Surface>
			)}

			{rgbValues.length > 0 && (
				<Surface style={[localStyles.stepSection, { backgroundColor: 'transparent' }]}>
					<Text style={localStyles.stepTitle}>
						<Text style={localStyles.stepNumber}>Step 3</Text> RGB Value Extraction
					</Text>
					<Text style={localStyles.stepDescription}>
						Each tiny square in your image is like a recipe with three ingredients: Red, Green, and Blue (RGB). Mix different amounts of each (from 0 to 255) to create any color! The spicy red of a strawberry might be (255, 0, 0), while ocean blue could be (0, 0, 255). The grid below shows all {selectedResolution * selectedResolution} colorful squares from your image!
					</Text>

					<View style={localStyles.hoverInstructionContainer}>
						<IconButton icon="cursor-default-click-outline" size={16} style={localStyles.hoverIcon} />
						<Text style={localStyles.hoverInstructionText}>
							Hover over pixels to see their RGB values
						</Text>
					</View>

					<View style={[localStyles.gridContainer]}>
						<PixelGridCanvas
							rgbValues={rgbValues}
							resolution={selectedResolution}
							width={320}
							height={320}
							mode="rgb"
							gap={getGapSize(selectedResolution)}
							onPixelHover={handleRgbPixelHover}
							onPixelLeave={handleRgbPixelLeave}
						/>
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
					<Expandable title="Savvy Fact: RGB Colors" emoji="🎨" color={Colors.orange}>
						<Text style={localStyles.funFactText}>
							Did you know that with just these three colors (RGB), we can create over 16 million different colors? That's because each color has 256 possible values (0-255), which gives us 256 × 256 × 256 = 16,777,216 possible combinations!
						</Text>
					</Expandable>
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
							{ value: 'grid', label: '⊞ Grid', style: { ...styles.toggleButton } },
							{ value: 'image', label: '🖼️ Image', style: { ...styles.toggleButton } }
						]}
						style={[localStyles.tabButtons, { position: 'sticky', bottom: 0, zIndex: 10 }]}
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
								<View style={{ width: 320, height: 320 }}>
									<PixelGridCanvas
										grayscaleValues={grayscaleValues}
										resolution={selectedResolution}
										width={320}
										height={320}
										mode="grayscale"
										gap={getGapSize(selectedResolution)}
										onPixelHover={handleGrayscalePixelHover}
										onPixelLeave={handleGrayscalePixelLeave}
									/>
								</View>
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
							<View style={{ width: 320, height: 320 }}>
								<PixelGridCanvas
									grayscaleValues={grayscaleValues}
									resolution={selectedResolution}
									width={320}
									height={320}
									mode="grayscale"
									isReconstruction={true}
								/>
							</View>
						</View>
					)}
					<Expandable title="Savvy Fact: Grayscale Images" emoji="🎨" color={Colors.blue}>
						<Text style={localStyles.funFactText}>
							The first digital photos were grayscale! Even today, many AI systems work with grayscale images because they focus on shapes and patterns rather than colors. This makes processing faster and often works just as well for many tasks.
						</Text>
					</Expandable>
				</Surface>
			)}

			<ImagePixelExtractor
				ref={pixelExtractorRef}
				imageUri={imageUri}
				width={selectedResolution}
				height={selectedResolution}
				onPixelDataExtracted={handlePixelDataExtracted}
				onError={handleExtractionError}
			/>
		</View>
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
		color: Colors.revealedText,
		fontSize: 14,
	},
	inputGroup: {
		gap: 15,
		marginBottom: 20,
	},
	inputSection: {
		backgroundColor: Colors.revealedBackground,
		padding: 16,
		borderRadius: 4,
	},
	sectionTitle: {
		fontWeight: "bold",
		marginBottom: 10,
		color: Colors.blue,
	},
	inputRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		gap: 10,
	},
	textInput: {
		flex: 1,
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.revealed,
		borderRadius: 4,
		fontSize: 16,
		backgroundColor: "white",
		color: Colors.revealedText,
	},
	button: {
		borderRadius: 4,
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
		borderRadius: 4,
	},
	gridContainer: {
		display: 'flex',
		alignItems: 'center',
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
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 15,
	},
	reconstructedImage: {
		width: 300,
		height: 300,
		borderRadius: 4,
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
		borderRadius: 4,
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
	// Updated styles for sample images
	localImagesScroll: {
		maxHeight: 200,
	},
	localImagesContainer: {
		paddingVertical: 8,
		paddingHorizontal: 4,
	},
	localImageCard: {
		width: 130,
		marginRight: 16,
		alignItems: 'center',
		backgroundColor: Colors.revealedBackground,
		borderRadius: 4,
		padding: 16,
	},
	localImageThumbnail: {
		width: 60,
		height: 60,
		borderRadius: 4,
	},
	localImageTitle: {
		marginTop: 10,
		marginBottom: 8,
		fontWeight: '600',
		textAlign: 'center',
		fontSize: 14,
		color: Colors.blue,
	},
	selectButton: {
		justifyContent: 'center',
		height: 30,
		borderColor: Colors.blue,
	},
	selectButtonLabel: {
		fontSize: 12,
		marginVertical: 0,
		color: Colors.blue,
	},
	// Resolution selector styles
	resolutionSection: {
		backgroundColor: Colors.revealedBackground,
		padding: 16,
		borderRadius: 4,
	},
	resolutionChips: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	resolutionChip: {
		backgroundColor: Colors.revealedBackground,
		borderWidth: 1,
		borderColor: Colors.blue,
	},
	selectedResolutionChip: {
		backgroundColor: Colors.blue,
	},
	// Added styles for selected image
	selectedImageCard: {
		borderWidth: 2,
		borderColor: Colors.blue,
		backgroundColor: `${Colors.blue}10`,
	},
	selectedButton: {
		backgroundColor: Colors.blue,
		borderColor: Colors.blue,
	},
	selectedButtonLabel: {
		color: Colors.whiteText,
	},
}); 