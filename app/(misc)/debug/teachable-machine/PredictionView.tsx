import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Text, Surface, Button, IconButton } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { CameraView, useCameraPermissions } from "expo-camera";
import styles from "@/styles/styles";
import { useTFStore } from "@/store/tensorStore";
import { PredictionViewProps, MESSAGE_TYPE_CLASSIFIER_PREDICT, ImageClass } from "./types";
import { generateColors } from "@/utils/utilfunctions";

export function PredictionView({
	currentState,
	modelId,
	classes,
	onGoToTraining,
	isCameraActive,
	setIsCameraActive,
	isPredictionActive,
	setIsPredictionActive
}: PredictionViewProps) {
	const { tfWorker } = useTFStore();
	const cameraRef = useRef<CameraView | null>(null);
	const [permission, requestPermission] = useCameraPermissions();
	const predictionIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const prediction = currentState[modelId]?.model?.prediction;
	const modelCompleted = currentState[modelId]?.model?.completed;
	
	// Keep track of whether user manually paused prediction
	const userPausedRef = useRef(false);
	
	// Automatically start prediction when model is completed and component is active
	useEffect(() => {
		// Only auto-start if the user hasn't manually paused AND we have a completed model
		if (modelCompleted && isCameraActive && !isPredictionActive && !userPausedRef.current) {
			setIsPredictionActive(true);
		}
	}, [modelCompleted, isCameraActive, isPredictionActive, setIsPredictionActive]);
	
	// Reset user paused state when switching back to this tab
	useEffect(() => {
		// When the component mounts or becomes active again, reset the user paused flag
		userPausedRef.current = false;
		
		// Cleanup function to run when component unmounts
		return () => {
			// Stop any active prediction intervals
			if (predictionIntervalRef.current) {
				clearInterval(predictionIntervalRef.current);
				predictionIntervalRef.current = null;
			}
		};
	}, []);
	
	// Get the saved training configuration (classes at training time)
	const trainedClasses = currentState[modelId]?.model?.trainedClasses || classes;

	// Animation values for each class probability - use trained classes to ensure stability
	const animatedValuesRef = useRef<Animated.Value[]>([]);
	
	// Initialize or update animated values when trained classes change
	useEffect(() => {
		// Create new animated values if they don't exist or the length doesn't match
		if (animatedValuesRef.current.length !== trainedClasses.length) {
			animatedValuesRef.current = trainedClasses.map(() => new Animated.Value(0));
		}
	}, [trainedClasses]);

	// Request camera permission
	useEffect(() => {
		if (isCameraActive && currentState[modelId]?.model?.completed) {
			requestPermission();
		}
	}, [isCameraActive]);

	// Start/stop prediction based on state
	useEffect(() => {
		if (predictionIntervalRef.current) {
			clearInterval(predictionIntervalRef.current);
			predictionIntervalRef.current = null;
		}

		if (isCameraActive && isPredictionActive && currentState[modelId]?.model?.completed && cameraRef.current) {
			// Start continuous prediction
			predictionIntervalRef.current = setInterval(async () => {
				try {
					// Take picture using expo-camera
					const photo = await cameraRef.current?.takePictureAsync({
						base64: true,
						quality: 0.5,
						imageType: 'jpg',
						exif: false // Prevent EXIF rotation issues
					});

					if (!photo || !photo.base64) {
						console.error("Failed to capture image for prediction");
						return;
					}

					const imageData = `${photo.base64}`;

					tfWorker?.postMessage({
						from: "main",
						type: MESSAGE_TYPE_CLASSIFIER_PREDICT,
						modelId,
						data: {
							image: imageData,
							predictionType: "classifier"
						},
					});
				} catch (error) {
					console.error("Error during prediction:", error);
				}
			}, 500); // Predict every 500ms
		}

		return () => {
			if (predictionIntervalRef.current) {
				clearInterval(predictionIntervalRef.current);
				predictionIntervalRef.current = null;
			}
		};
	}, [currentState, modelId, tfWorker, isCameraActive, isPredictionActive]);

	// Update animations when prediction changes
	useEffect(() => {
		if (prediction && prediction.probabilities && animatedValuesRef.current.length === prediction.probabilities.length) {
			// Animate each probability bar
			prediction.probabilities.forEach((probability: number, index: number) => {
				Animated.spring(animatedValuesRef.current[index], {
					toValue: probability,
					friction: 8,
					tension: 40,
					useNativeDriver: false
				}).start();
			});
		}
	}, [prediction]);

	// Toggle camera state
	const toggleCamera = () => {
		setIsCameraActive(!isCameraActive);
		if (isCameraActive) {
			// Also stop predictions when turning off camera
			setIsPredictionActive(false);
			// Don't consider this a manual pause since it's camera-related
			userPausedRef.current = false;
		}
	};

	// Toggle prediction state
	const togglePrediction = () => {
		// Update the prediction active state
		const newPredictionState = !isPredictionActive;
		setIsPredictionActive(newPredictionState);
		
		// Track if user manually paused
		if (!newPredictionState) {
			userPausedRef.current = true;
		} else {
			// If user manually resumed, clear the pause flag
			userPausedRef.current = false;
		}
	};

	if (!currentState[modelId]?.model?.completed && !currentState[modelId]?.model?.training) {
		return (
			<Surface style={styles.detailsContainer}>
				<View style={{ justifyContent: "center", alignItems: "center" }}>
					<Text style={{ fontSize: 54, fontWeight: "bold" }}>🤔</Text>
					<Text style={{ textAlign: "center" }}>Nothing to see here... yet! </Text>
				</View>
			</Surface>
		);
	}

	// Calculate metrics with colors similar to the Neural Network implementation
	const accuracy = (currentState[modelId]?.training.modelHistory?.[currentState[modelId]?.training.modelHistory.length - 1]?.accuracy * 100).toFixed(2);
	const loss = (currentState[modelId]?.training.modelHistory?.[currentState[modelId]?.training.modelHistory.length - 1]?.loss * 100).toFixed(2);
	const accuracyColor = Number(accuracy) > 90 ? Colors.success : Number(accuracy) > 50 ? Colors.orange : Colors.error;
	const lossColor = Number(loss) < 10 ? Colors.success : Number(loss) > 10 && Number(loss) < 20 ? Colors.orange : Colors.error;

	// Find the highest probability and its index
	const highestProbIndex = prediction ? 
		prediction.probabilities.indexOf(Math.max(...prediction.probabilities)) : -1;

	return (
		<Surface style={styles.detailsContainer}>
			<Text style={styles.title}>Test Your Model</Text>

			{/* Training metrics with color coding */}
			<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
				<View style={[styles.metricContainer, { borderColor: accuracyColor, backgroundColor: generateColors(accuracyColor, 0.1).muted }]}>
					<Text style={[{ color: accuracyColor }]}>Accuracy:</Text>
					<Text style={[{ color: accuracyColor }]}>{accuracy}%</Text>
				</View>
				<View style={[styles.metricContainer, { borderColor: lossColor, backgroundColor: generateColors(lossColor, 0.1).muted }]}>
					<Text style={[{ color: lossColor }]}>Loss:</Text>
					<Text style={[{ color: lossColor }]}>{loss}%</Text>
				</View>
			</View>

			{/* Camera and Prediction Controls */}
			<View style={localStyles.predictCameraContainer}>
				{isCameraActive ? (
					<CameraView
						ref={cameraRef}
						style={localStyles.predictVideo}
						facing="front"
						mirror={true}
					/>
				) : (
					<View style={localStyles.cameraOffContainer}>
						<Text style={localStyles.cameraOffText}>Camera is turned off</Text>
					</View>
				)}
			</View>

			{/* Camera and Prediction Controls */}
			<View style={localStyles.controlsContainer}>
				<Button
					mode="contained"
					icon={isCameraActive ? "camera-off" : "camera"}
					onPress={toggleCamera}
					style={[localStyles.controlButton, isCameraActive ? localStyles.activeButton : localStyles.inactiveButton]}
				>
					{isCameraActive ? "Stop Camera" : "Start Camera"}
				</Button>

				<Button
					mode="contained"
					icon={isPredictionActive ? "pause" : "play"}
					onPress={togglePrediction}
					disabled={!isCameraActive || !currentState[modelId]?.model?.completed}
					style={[
						localStyles.controlButton,
						isPredictionActive ? localStyles.activeButton : localStyles.inactiveButton,
						!isCameraActive && localStyles.disabledButton
					]}
				>
					{!currentState[modelId]?.model?.completed ? "Model is still training" : isPredictionActive ? "Pause Prediction" : "Resume Prediction"}
				</Button>
			</View>

			{/* Prediction Status */}
			{isCameraActive && (
				<View style={localStyles.statusContainer}>
					<Text style={localStyles.statusText}>
						Status: {isPredictionActive ? "Predicting" : "Paused"}
					</Text>
				</View>
			)}

			{prediction && (
				<View style={localStyles.predictionResults}>
					<Text style={styles.title}>Prediction: {trainedClasses[highestProbIndex]?.name}</Text>
					
					{/* Add probability bars for all classes */}
					<View style={localStyles.allProbabilitiesContainer}>
						{trainedClasses.map((classItem: ImageClass, index: number) => {
							// Get probability for this class from TF worker result
							const probability = prediction.probabilities[index];
							const isHighestProb = index === highestProbIndex;
							
							return (
								<View key={classItem.id} style={[
									localStyles.probabilityItem,
									isHighestProb && localStyles.highlightedItem
								]}>
									<Text style={[
										localStyles.classLabel, 
										isHighestProb && localStyles.highlightedText
									]}>
										{classItem.name}
									</Text>
									<View style={localStyles.confidenceBar}>
										<Animated.View
											style={[
												localStyles.confidenceFill,
												{
													width: animatedValuesRef.current[index]?.interpolate({
														inputRange: [0, 1],
														outputRange: ['0%', '100%']
													}) || '0%',
													backgroundColor: classItem.color,
													opacity: 0.8
												}
											]}
										/>
										{/* Shine effect on the bar */}
										<View style={localStyles.shine} />
									</View>
									<Text style={[
										localStyles.confidenceText,
										isHighestProb && localStyles.highlightedText
									]}>
										{(probability * 100).toFixed(1)}%
									</Text>
								</View>
							);
						})}
					</View>
				</View>
			)}
		</Surface>
	);
}

const localStyles = StyleSheet.create({
	notTrainedMessage: {
		alignItems: "center",
		justifyContent: "center",
		padding: 24,
		gap: 16,
	},
	metricContainer: {
		padding: 10,
		borderRadius: 8,
		borderWidth: 1,
		minWidth: 120,
		alignItems: 'center',
	},
	predictCameraContainer: {
		height: 244,
		backgroundColor: Colors.revealedBackground,
		alignItems: "center",
		borderRadius: 4,
		overflow: "hidden",
	},
	predictVideo: {
		width: 244,
		height: 244,
	},
	cameraOffContainer: {
		width:244,
		height: 244,
		backgroundColor: "#222",
		justifyContent: "center",
		alignItems: "center",
	},
	cameraOffText: {
		color: "white",
		fontSize: 18,
	},
	controlsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 8,
	},
	controlButton: {
		flex: 1,
		borderRadius: 4,
	},
	activeButton: {
		backgroundColor: Colors.orange,
	},
	inactiveButton: {
		backgroundColor: Colors.primary,
	},
	disabledButton: {
		opacity: 0.5,
	},
	statusContainer: {
		alignItems: "center",
	},
	statusText: {
		fontSize: 14,
		color: "#666",
	},
	predictionResults: {
		backgroundColor: '#fafafa',
		padding: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#eaeaea',
	},
	confidenceBar: {
		height: 24,
		backgroundColor: "#f0f0f0",
		borderRadius: 12,
		overflow: "hidden",
		marginVertical: 4,
		flex: 1,
		position: 'relative', // For shine effect
	},
	confidenceFill: {
		height: "100%",
		borderRadius: 12,
	},
	shine: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '50%',
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
	},
	confidenceText: {
		textAlign: "center",
		fontWeight: "bold",
		width: 60,
	},
	allProbabilitiesContainer: {
		marginTop: 16,
		gap: 8,
	},
	probabilityItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		padding: 4,
		borderRadius: 4,
	},
	highlightedItem: {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		borderRadius: 8,
		padding: 8,
	},
	classLabel: {
		width: 80,
		fontWeight: "500",
	},
	highlightedText: {
		fontWeight: "bold",
		color: Colors.primary,
	},
}); 