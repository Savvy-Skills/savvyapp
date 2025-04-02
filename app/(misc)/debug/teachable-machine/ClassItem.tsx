import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Modal, Platform } from "react-native";			
import { Text, Surface, TextInput, IconButton, Button, RadioButton } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ClassItemProps } from "./types";
import { SamplePreview } from "./SamplePreview";
import Slider from "@react-native-community/slider";
import styles from "@/styles/styles";

// Define capture mode types
type CaptureMode = "auto" | "press";

// Configuration interface
interface CaptureConfig {
	mode: CaptureMode;
	countdownSeconds: number;
	picturesPerSecond: number;
	totalPictures: number;
}

// Maximum samples constant
const MAX_SAMPLES = 120;

export function ClassItem({
	classItem,
	isActive,
	onRemove,
	onNameChange,
	onSelect,
	onClearSample,
	onClearAllSamples,
	showRemoveButton
}: ClassItemProps) {
	const [isCapturing, setIsCapturing] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const cameraRef = useRef<CameraView | null>(null);
	const [permission, requestPermission] = useCameraPermissions();
	const [samplesCollected, setSamplesCollected] = useState(0);
	const [showConfig, setShowConfig] = useState(false);
	// Add a ref to store the capture interval ID
	const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Capture configuration state
	const [captureConfig, setCaptureConfig] = useState<CaptureConfig>({
		mode: "press",
		countdownSeconds: 3,
		picturesPerSecond: 10,  // 5 per second = 200ms interval
		totalPictures: 10
	});

	// For press mode - revised approach
	const [isPressCapturing, setIsPressCapturing] = useState(false);
	
	// Check if we've reached the sample limit
	const sampleLimitReached = classItem.samples.length >= MAX_SAMPLES;

	// Request camera permission only when class becomes active
	useEffect(() => {
		if (isActive) {
			requestPermission();
		}
	}, [isActive]);

	// Reset camera when class becomes inactive
	useEffect(() => {
		if (!isActive) {
			// Explicitly clear any ongoing captures
			if (captureIntervalRef.current) {
				clearInterval(captureIntervalRef.current);
				captureIntervalRef.current = null;
			}
			
			// Reset all capturing states
			setIsCapturing(false);
			setIsPressCapturing(false);
			setCountdown(0);
			
			// Clear camera reference when component becomes inactive
			if (cameraRef.current) {
				// On web, we need to ensure any MediaStream is stopped
				if (Platform.OS === 'web') {
					// Access the underlying implementation if possible
					const cameraInstance = cameraRef.current as any;
					if (cameraInstance._nativeRef?.stopRecording) {
						cameraInstance._nativeRef.stopRecording();
					}
				}
				// Clear the reference
				cameraRef.current = null;
			}
		}
	}, [isActive]);

	// Handle press mode capture
	useEffect(() => {
		if (!isPressCapturing || !cameraRef.current || sampleLimitReached) {
			// Clean up if not capturing
			if (captureIntervalRef.current) {
				clearInterval(captureIntervalRef.current);
				captureIntervalRef.current = null;
			}
			return;
		}

		// Start capturing in press mode
		const captureInterval = setInterval(async () => {
			if (!cameraRef.current || !isPressCapturing || sampleLimitReached) {
				clearInterval(captureInterval);
				return;
			}

			try {
				const photo = await cameraRef.current.takePictureAsync({
					base64: true,
					quality: 0.3,
					imageType: 'jpg'
				});

				if (!photo || !photo.base64) {
					console.error("Failed to capture image");
					return;
				}

				// Add the captured image using a new array to ensure React detects the change
				const imageData = `${photo.base64}`;
				
				// Create a new copy of the samples array
				const newSamples = [...classItem.samples, imageData];
				classItem.samples = newSamples;

				// Update UI
				setSamplesCollected(newSamples.length);
			} catch (error) {
				console.error("Error capturing image:", error);
			}
		}, 1000 / captureConfig.picturesPerSecond);

		captureIntervalRef.current = captureInterval;

		// Cleanup
		return () => {
			clearInterval(captureInterval);
			captureIntervalRef.current = null;
		};
	}, [isPressCapturing, cameraRef.current, sampleLimitReached, captureConfig.picturesPerSecond]);

	// Start press mode capture
	const startPressCapture = () => {
		if (captureConfig.mode !== "press" || sampleLimitReached) return;
		
		console.log("Starting press capture");
		setIsCapturing(true);
		setIsPressCapturing(true);
	};

	// Stop press mode capture
	const stopPressCapture = () => {
		if (captureConfig.mode !== "press") return;
		
		console.log("Stopping press capture");
		setIsPressCapturing(false);
		setIsCapturing(false);
	};

	// Start capturing images in auto mode
	const handleStartCapturing = useCallback(() => {
		if (isCapturing || captureConfig.mode === "press" || sampleLimitReached) return;

		setIsCapturing(true);
		setCountdown(captureConfig.countdownSeconds);
		setSamplesCollected(0);

		// Countdown timer
		const countdownInterval = setInterval(() => {
			setCountdown(prev => {
				const newCount = prev - 1;
				if (newCount <= 0) {
					clearInterval(countdownInterval);
					captureImages();
					return 0;
				}
				return newCount;
			});
		}, 1000);
	}, [isCapturing, captureConfig, sampleLimitReached]);

	// Capture a series of images in auto mode
	const captureImages = useCallback(async () => {
		if (!cameraRef.current) {
			setIsCapturing(false);
			return;
		}

		// Add this check at the top
		if (classItem.samples.length >= MAX_SAMPLES) {
			setIsCapturing(false);
			return;
		}
		
		// Limit total pictures to not exceed MAX_SAMPLES
		const remainingCapacity = MAX_SAMPLES - classItem.samples.length;
		const picturesToCapture = Math.min(captureConfig.totalPictures, remainingCapacity);

		// We'll capture images based on config
		const captureOneImage = async () => {
			try {
				// Take picture using expo-camera
				const photo = await cameraRef.current?.takePictureAsync({
					base64: true,
					quality: 0.3,
					imageType: 'jpg'
				});

				if (!photo || !photo.base64) {
					console.error("Failed to capture image");
					return false;
				}

				// Add the captured image - use a proper state update pattern
				const imageData = `${photo.base64}`;
				const updatedSamples = [...classItem.samples, imageData];
				classItem.samples = updatedSamples; // This triggers a re-render in React

				// Increase the counter for UI feedback
				setSamplesCollected(prev => prev + 1);

				return true;
			} catch (error) {
				console.error("Error capturing image:", error);
				return false;
			}
		};

		// Capture images sequentially
		let captureCount = 0;
		const interval = 1000 / captureConfig.picturesPerSecond; // Convert to milliseconds

		const captureInterval = setInterval(async () => {
			const success = await captureOneImage();

			if (success) {
				captureCount++;
			}

			if (captureCount >= picturesToCapture || !success) {
				clearInterval(captureInterval);
				setIsCapturing(false);
			}
		}, interval);
	}, [cameraRef, classItem.samples, captureConfig]);

	// Toggle config modal
	const toggleConfigModal = () => setShowConfig(!showConfig);

	return (
		<Surface style={[localStyles.classContainer, isActive && localStyles.activeClass, { borderColor: classItem.color }]}>
			<View style={localStyles.classHeader}>
				<TextInput
					value={classItem.name}
					onChangeText={onNameChange}
					style={localStyles.classNameInput}
				/>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
					{showRemoveButton && (
						<IconButton
							icon="trash-can"
							size={20}
							onPress={onRemove}
						/>
					)}
					<Text style={localStyles.sampleCount}>
						{classItem.samples.length} samples
					</Text>
				</View>
			</View>

			{!isActive ? (
				<Button
					mode="outlined"
					icon="camera"
					onPress={onSelect}
					style={localStyles.selectButton}
				>
					Select to Capture
				</Button>
			) : (
				<View style={localStyles.inlineCamera}>
					<View style={localStyles.videoContainer}>
						<CameraView
							key={`camera-${classItem.id}-${isActive}`}
							ref={cameraRef}
							style={localStyles.video}
							facing="front"
							mirror={true}
						/>

						{/* Config button */}
						<IconButton
							icon="cog"
							size={24}
							style={localStyles.configButton}
							iconColor="white"
							onPress={toggleConfigModal}
							disabled={isCapturing}
						/>

						{isCapturing && countdown > 0 && (
							<View style={localStyles.countdown}>
								<Text style={localStyles.countdownText}>{countdown}</Text>
							</View>
						)}
						{isCapturing && countdown === 0 && (
							<View style={localStyles.captureOverlay}>
								<Text style={localStyles.captureText}>
									Capturing: {samplesCollected}/{MAX_SAMPLES}
								</Text>
							</View>
						)}
					</View>

					<View style={localStyles.cameraControls}>
						<View style={localStyles.captureButtonRow}>
							{captureConfig.mode === "auto" ? (
								<Button
									mode="contained"
									icon="camera"
									onPress={handleStartCapturing}
									style={localStyles.captureButton}
									disabled={isCapturing || sampleLimitReached}
								>
									Capture Images
								</Button>
							) : (
								<Button
									mode="contained"
									icon="camera-burst"
									onPressIn={startPressCapture}
									onPressOut={stopPressCapture}
									style={[localStyles.captureButton, styles.savvyButton, styles.primaryButton]}
									disabled={sampleLimitReached}
								>
									{isPressCapturing ? "Capturing..." : "Press & Hold to Capture"}
								</Button>
							)}

							<IconButton
								icon="close"
								mode="contained"
								style={localStyles.stopButton}
								onPress={onSelect}
								iconColor="white"
							/>
						</View>
					</View>
				</View>
			)}
			{classItem.samples.length > 0 && (
				<SamplePreview
					samples={classItem.samples}
					onClearSample={onClearSample}
					onClearAll={onClearAllSamples}
				/>
			)}

			{/* Configuration Modal */}
			<Modal
				visible={showConfig}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setShowConfig(false)}
			>
				<View style={localStyles.modalOverlay}>
					<View style={localStyles.modalContent}>
						<Text style={localStyles.modalTitle}>Camera Configuration</Text>

						<View style={localStyles.configSection}>
							<Text style={localStyles.configLabel}>Capture Mode:</Text>
							<View style={localStyles.radioGroup}>
								<View style={localStyles.radioOption}>
									<RadioButton
										value="auto"
										status={captureConfig.mode === "auto" ? "checked" : "unchecked"}
										onPress={() => setCaptureConfig({ ...captureConfig, mode: "auto" })}
									/>
									<Text>Auto Capture</Text>
								</View>
								<View style={localStyles.radioOption}>
									<RadioButton
										value="press"
										status={captureConfig.mode === "press" ? "checked" : "unchecked"}
										onPress={() => setCaptureConfig({ ...captureConfig, mode: "press" })}
									/>
									<Text>Press & Hold</Text>
								</View>
							</View>
						</View>

						{captureConfig.mode === "auto" && (
							<>
								<View style={localStyles.configSection}>
									<Text style={localStyles.configLabel}>
										Countdown (seconds): {captureConfig.countdownSeconds}
									</Text>
									<View style={localStyles.sliderContainer}>
										<Text>1</Text>
										<Slider
											value={captureConfig.countdownSeconds}
											onValueChange={(value: number) =>
												setCaptureConfig({ ...captureConfig, countdownSeconds: value })
											}
											minimumValue={1}
											maximumValue={5}
											step={1}
											style={localStyles.slider}
										/>
										<Text>5</Text>
									</View>
								</View>

								<View style={localStyles.configSection}>
									<Text style={localStyles.configLabel}>
										Total Pictures: {captureConfig.totalPictures}
									</Text>
									<View style={localStyles.sliderContainer}>
										<Text>5</Text>
										<Slider
											value={captureConfig.totalPictures}
											onValueChange={(value: number) =>
												setCaptureConfig({ ...captureConfig, totalPictures: value })
											}
											minimumValue={5}
											maximumValue={30}
											step={5}
											style={localStyles.slider}
										/>
										<Text>30</Text>
									</View>
								</View>
							</>
						)}

						<View style={localStyles.configSection}>
							<Text style={localStyles.configLabel}>
								Pictures Per Second: {captureConfig.picturesPerSecond}
							</Text>
							<View style={localStyles.sliderContainer}>
								<Text>1</Text>
								<Slider
									value={captureConfig.picturesPerSecond}
									onValueChange={(value: number) =>
										setCaptureConfig({ ...captureConfig, picturesPerSecond: value })
									}
									minimumValue={1}
									maximumValue={30}
									step={1}
									style={localStyles.slider}
								/>
								<Text>30</Text>
							</View>
						</View>

						<View style={localStyles.modalActions}>
							<Button
								mode="contained"
								onPress={() => setShowConfig(false)}
							>
								Close
							</Button>
						</View>
					</View>
				</View>
			</Modal>

			{/* Display sample limit warning */}
			{sampleLimitReached && (
				<View style={localStyles.limitWarning}>
					<Text style={localStyles.limitWarningText}>
						Sample limit reached ({MAX_SAMPLES})
					</Text>
				</View>
			)}

		</Surface>
	);
}

const localStyles = StyleSheet.create({
	classContainer: {
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#ddd",
		backgroundColor: "transparent",
	},
	activeClass: {
		borderWidth: 2,
	},
	classHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	classNameInput: {
		borderWidth: 2,
		borderRadius: 4,
		height: 40,
		backgroundColor: Colors.revealedBackground,
	},
	sampleCount: {
		fontSize: 12,
		color: "#666",
	},
	selectButton: {
		borderRadius: 4,
	},
	inlineCamera: {
		marginTop: 12,
		borderRadius: 8,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#ddd',
	},
	videoContainer: {
		position: "relative",
		height: 244,
		backgroundColor: Colors.revealedBackground,
		alignItems: "center",
		borderRadius: 4,
		overflow: "hidden",
	},
	video: {
		width: 244,
		height: 244,
	},
	cameraControls: {
		padding: 12,
	},
	captureButtonRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	captureButton: {
		borderRadius: 4,
		flex: 1,	
	},
	countdown: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	countdownText: {
		color: "white",
		fontSize: 72,
		fontWeight: "bold",
	},
	captureOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		padding: 10,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		alignItems: "center",
	},
	captureText: {
		color: "white",
		fontWeight: "bold",
	},
	// Configuration styles
	configButton: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "white",
		borderRadius: 8,
		padding: 20,
		width: "80%",
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 16,
		textAlign: "center",
	},
	configSection: {
		marginBottom: 16,
	},
	configLabel: {
		fontWeight: "600",
		marginBottom: 8,
	},
	radioGroup: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	radioOption: {
		flexDirection: "row",
		alignItems: "center",
	},
	sliderContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	slider: {
		flex: 1,
		marginHorizontal: 8,
	},
	modalActions: {
		marginTop: 16,
		alignItems: "center",
	},
	stopButton: {
		backgroundColor: Colors.error,
		borderRadius: 4,
	},
	limitWarning: {
		backgroundColor: `${Colors.error}20`,
		padding: 8,
		borderRadius: 4,
		marginBottom: 8,
		alignItems: 'center',
	},
	limitWarningText: {
		color: Colors.error,
		fontWeight: 'bold',
	},
	disabledButton: {
		opacity: 0.5,
	},
	captureButtonText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	}
}); 