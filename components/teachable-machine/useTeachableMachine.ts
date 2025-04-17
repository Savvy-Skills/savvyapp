import { useCallback, useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { useTFStore } from "@/store/tensorStore";
import {
	ImageClass,
	MESSAGE_TYPE_CREATE_TRAIN_CLASSIFIER,
} from "./types";

export function useTeachableMachine(modelId: string) {
	const { currentState, setCurrentState, tfWorker, initializeWorker, workerReady, setCurrentModelId } = useTFStore();
	const [classes, setClasses] = useState<ImageClass[]>([
		{ id: "class1", name: "Class 1", samples: [], color: Colors.primary },
		{ id: "class2", name: "Class 2", samples: [], color: Colors.orange },
	]);
	const [nextClassId, setNextClassId] = useState(3); // Track the next available class ID
	const [epochs, setEpochs] = useState(50);
	const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
	const [activeClassId, setActiveClassId] = useState<string | null>(null);
	const [isMobilenetLoaded, setIsMobilenetLoaded] = useState(false);
	const [isLoadingMobilenet, setIsLoadingMobilenet] = useState(false);

	// Initialize worker if not ready
	useEffect(() => {
		if (!workerReady) {
			initializeWorker();
		}
	}, [initializeWorker, workerReady]);

	// Load MobileNet model when worker is ready
	useEffect(() => {
		if (workerReady && tfWorker && !isMobilenetLoaded && !isLoadingMobilenet) {
			setIsLoadingMobilenet(true);

			// Message handler for MobileNet loading response
			const handleMobilenetLoaded = (event: any) => {
				const { type, modelId: responseModelId } = event.data;

				if (responseModelId !== modelId) return;

				if (type === "mobilenet_loaded") {
					setIsMobilenetLoaded(true);
					setIsLoadingMobilenet(false);
					tfWorker.removeEventListener('message', handleMobilenetLoaded);
				}
			};

			tfWorker.addEventListener('message', handleMobilenetLoaded);

			// Send request to load MobileNet
			tfWorker.postMessage({
				from: "main",
				type: "load_mobilenet_model",
				modelId: modelId
			});
		}
	}, [workerReady, tfWorker, isMobilenetLoaded, isLoadingMobilenet, modelId]);

	// Handle worker messages
	useEffect(() => {
		if (workerReady) {
			const handleWorkerMessage = (event: any) => {
				const { type, data, modelId: responseModelId } = event.data;

				if (responseModelId !== modelId) return;

				if (type === "image_prediction_result") {
					const { predictionResult, confidence } = data;

					// Find the class name based on the prediction index
					const predictedClass = classes[predictionResult];
					if (predictedClass) {
						setPrediction({
							label: predictedClass.name,
							confidence: confidence || 0.9, // Default if not provided
						});
					}
				} else if (type === "mobilenet_loaded") {
					setIsMobilenetLoaded(true);
					setIsLoadingMobilenet(false);
				}
			};

			// Add event listener for worker messages
			if (tfWorker) {
				tfWorker.addEventListener('message', handleWorkerMessage);
			}

			return () => {
				if (tfWorker) {
					tfWorker.removeEventListener('message', handleWorkerMessage);
				}
			};
		}
	}, [workerReady, tfWorker, modelId, classes, currentState, setCurrentState]);

	// Add a new class with a unique ID
	const handleAddClass = useCallback(() => {
		const colors = [Colors.primary, Colors.orange, Colors.success, Colors.error, Colors.blue];
		const newClassId = `class${nextClassId}`;
		setNextClassId(prev => prev + 1); // Increment for next use

		setClasses(prev => [
			...prev,
			{
				id: newClassId,
				name: `Class ${nextClassId}`,
				samples: [],
				color: colors[prev.length % colors.length]
			}
		]);
	}, [nextClassId]);

	// Remove a class - only allow removal of classes beyond the first two
	const handleRemoveClass = useCallback((classId: string) => {
		setClasses(prev => {
			// Find the index of the class we want to remove
			const index = prev.findIndex(c => c.id === classId);

			// Only remove if it's not one of the first two classes
			if (index >= 2) {
				return prev.filter(c => c.id !== classId);
			}
			return prev;
		});

		if (activeClassId === classId) {
			setActiveClassId(null);
		}
	}, [activeClassId]);

	// Remove a specific sample
	const handleClearSample = useCallback((classId: string, sampleIndex: number) => {
		setClasses(prev =>
			prev.map(c => {
				if (c.id === classId) {
					const updatedSamples = [...c.samples];
					updatedSamples.splice(sampleIndex, 1);
					return { ...c, samples: updatedSamples };
				}
				return c;
			})
		);
	}, []);

	// Clear all samples for a class
	const handleClearAllSamples = useCallback((classId: string) => {
		setClasses(prev =>
			prev.map(c => c.id === classId ? { ...c, samples: [] } : c)
		);
	}, []);

	// Handle class name change
	const handleClassNameChange = useCallback((id: string, newName: string) => {
		setClasses(prev =>
			prev.map(c => c.id === id ? { ...c, name: newName } : c)
		);
	}, []);

	// Select a class to capture images for
	const handleSelectClass = useCallback((classId: string | null) => {
		// Allow passing null to explicitly deselect all classes
		if (classId === null) {
			setActiveClassId(null);
			return;
		}
		
		// If we're currently selecting a class, first unselect it to clean up
		if (activeClassId) {
			setActiveClassId(null);
			// Add a small delay before selecting the new class to ensure cleanup completes
			if (activeClassId !== classId) {
				setTimeout(() => setActiveClassId(classId), 100);
				return;
			}
		} else {
			setActiveClassId(classId);
		}
	}, [activeClassId]);

	// Handle training the model - ensure MobileNet is loaded first
	const handleStartTraining = useCallback(() => {
		if (!isMobilenetLoaded) {
			console.warn("MobileNet model is not loaded yet!");
			return;
		}

		setCurrentModelId(modelId);
		setCurrentState(modelId, {
			...currentState[modelId],
			model: {
				training: true,
				completed: false,
				paused: false,
				prediction: {
					predictedClass: -1,
					confidence: 0,
					probabilities: [],
				},
			},
			training: {
				transcurredEpochs: 0,
				loss: 0,
				accuracy: 0,
				modelHistory: [],
			}
		});

		// Format data for the worker
		const inputs = classes.map(cls => {
			return { [cls.name]: cls.samples };
		});

		// Send training request to worker
		tfWorker?.postMessage({
			from: "main",
			type: MESSAGE_TYPE_CREATE_TRAIN_CLASSIFIER,
			modelId,
			data: {
				inputs,
				modelConfig: { epochs }
			},
		});
	}, [isMobilenetLoaded, classes, epochs, modelId, setCurrentState, currentState, tfWorker, setCurrentModelId]);

	// Add image capture to samples
	const handleAddSample = useCallback((classId: string, imageData: string) => {
		setClasses(prevClasses =>
			prevClasses.map(c =>
				c.id === classId
					? { ...c, samples: [...c.samples, imageData] }
					: c
			)
		);
	}, []);

	// Check if a class can be removed (only classes beyond the first two)
	const canRemoveClass = useCallback((classId: string) => {
		const index = classes.findIndex(c => c.id === classId);
		return index >= 2; // Only classes with index 2 or higher can be removed
	}, [classes]);

	// Add this function to check if enough classes have samples for training
	const canStartTraining = useCallback(() => {
		// Count how many classes have at least one sample
		const classesWithSamples = classes.filter(c => c.samples.length > 0).length;
		return classesWithSamples >= 2; // Need at least 2 classes with samples
	}, [classes]);

	return {
		classes,
		prediction,
		epochs,
		setEpochs,
		activeClassId,
		workerReady,
		currentState,
		handleAddClass,
		handleRemoveClass,
		handleClassNameChange,
		handleSelectClass,
		handleStartTraining,
		handleAddSample,
		handleClearSample,
		handleClearAllSamples,
		canRemoveClass,
		canStartTraining,
		isMobilenetLoaded,
		isLoadingMobilenet
	};
} 