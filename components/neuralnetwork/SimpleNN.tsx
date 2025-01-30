import { useDataFetch } from "@/hooks/useDataFetch";
import { useTFStore } from "@/store/tensorStore";
import React, { lazy, useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface, Button } from "react-native-paper";
import LoadingIndicator from "../LoadingIndicator";
import { TraceConfig } from "../DataVisualizerPlotly";
import NNTabs from "./NNTabs";
import styles from "@/styles/styles";
import LayerDetails from "./LayerDetails";
import { useCourseStore } from "@/store/courseStore";
import { LayerType, ModelConfig, NeuralNetworkVisualizerProps, NNState, TrainConfig } from "@/types/neuralnetwork";
import { Colors } from "@/constants/Colors";
import { workerScript } from "@/utils/worker";
import { CopilotProvider, CopilotStep, useCopilot } from "react-native-copilot";
import useBroadcastChannel from "@/hooks/useBroadcastChannel";


// const defaultModelConfig: ModelConfig = {
// 	neuronsPerLayer: [4, 2, 1],
// 	problemType: "classification",
// 	activationFunction: "relu",
// 	compileOptions: {
// 		optimizer: "adam",
// 		learningRate: 0.01,
// 		lossFunction: "binaryCrossentropy",
// 		metrics: "acc",
// 	},
// 	inputSize: 2,
// 	lastLayerSize: 1,
// }
const defaultModelConfig: ModelConfig = {
	neuronsPerLayer: [4, 2, 1],
	problemType: "regression",
	activationFunction: "relu",
	compileOptions: {
		optimizer: "adam",
		learningRate: 0.01,
		lossFunction: "meanSquaredError",
		metrics: "mse",
	},
	inputSize: 1,
	lastLayerSize: 1,
}

// const defaultTrainingConfig: TrainConfig = {
// 	epochs: 50,
// 	shuffle: true,
// 	validationSplit: 0.2,
// 	batchSize: 32,
// 	dataPreparationConfig: {
// 		targetColumn: "label",
// 		outputsNumber: 2,
// 		testSize: 0.2,
// 		stratify: true,
// 		featureConfig: [
// 			{
// 				field: "x",
// 				encoding: "none",
// 			},
// 			{
// 				field: "y",
// 				encoding: "none",
// 			},
// 		],
// 		targetConfig: {
// 			field: "label",
// 			encoding: "label",
// 		},
// 	}
// }

const defaultTrainingConfig: TrainConfig = {
	epochs: 50,
	shuffle: true,
	validationSplit: 0.2,
	batchSize: 16,
	dataPreparationConfig: {
		targetColumn: "mpg",
		outputsNumber: 1,
		testSize: 0.2,
		stratify: false,
		featureConfig: [
			{
				field: "horsepower",
				encoding: "none",
				normalization: "min_max"
			}
		],
		targetConfig: {
			field: "mpg",
			encoding: "none",
			normalization: "min_max"
		},
	}
}

const defaultNNState: NNState = {
	modelConfig: defaultModelConfig,
	trainingConfig: defaultTrainingConfig,
}

const traces: TraceConfig[] = [
	{
		"x": "horsepower",
		"y": "mpg",
		"name": "Horsepower vs MPG",
		"type": "scatter",
		"groupBy": "label"
	}
]

// const traces: TraceConfig[] = [
// 	{
// 		"x": "x",
// 		"y": "y",
// 		"name": "X vs Y",
// 		"type": "scatter",
// 		"groupBy": "label"
// 	}
// ]
// const workerBroadcastChannel = new BroadcastChannel("tensorflow-worker");

export default function NeuralNetworkVisualizer({ initialNNState = defaultNNState, dataset_info, index }: NeuralNetworkVisualizerProps) {
	const [selectedLayer, setSelectedLayer] = useState<LayerType>("input");
	const { currentState, setCurrentState, setModelState, setTrainingState, setDataState } = useTFStore();
	const [currentNNState, setCurrentNNState] = useState<NNState>(initialNNState);
	const { currentSlideIndex } = useCourseStore();
	const [tfReady, setTfReady] = useState(false);
	const workerRef = useRef<Worker | null>(null);
	const { message, sendMessage } = useBroadcastChannel("tensorflow-worker");
	const { data, columns } = useDataFetch({ source: dataset_info?.url, isCSV: dataset_info?.extension === "csv" });

	// Get only the columns that are in the featureConfig
	const inputColumns = columns.filter(column => currentNNState.trainingConfig?.dataPreparationConfig?.featureConfig?.some(feature => feature.field === column.accessor));

	useEffect(() => {
		if (!workerRef.current) {
			workerRef.current = new Worker(workerScript);
		}
	}, []);


	useEffect(() => {
		if (message) {
			console.log("Received message from worker", message);
			switch (message.type) {
				case "init":
					setTfReady(true);
					break;
				case "train_end":
					setModelState({
						training: false,
						completed: true,
						paused: false,
						prediction: null,
					})
					break;
				case "train_update":
					const { transcurredEpochs, loss, accuracy, modelHistory, testData } = message.data;
					setTrainingState({
						transcurredEpochs,
						loss,
						accuracy,
						modelHistory,
					})
					setDataState({
						testData: testData.data,
						columns: testData.columns,
					})
					break;
				case "prediction_result":
					const { predictionsArray, mappedOutputs } = message.data;
					setModelState({
						training: false,
						completed: true,
						paused: false,
						prediction: mappedOutputs[predictionsArray[0] as number],
					})
					break;
			}
		}
	}, [message]);


	const handleActivationFunctionChange = useCallback((activationFunction: string) => {
		setCurrentNNState(prev => ({
			...prev,
			modelConfig: {
				...prev.modelConfig!,
				activationFunction: activationFunction as ModelConfig["activationFunction"]
			}
		}));
	}, []);

	const handleEpochsChange = useCallback((epochs: number) => {
		setCurrentNNState(prev => ({
			...prev,
			trainingConfig: {
				...prev.trainingConfig!,
				epochs: epochs
			}
		}));
	}, [currentNNState]);

	const handleNeuronCountChange = useCallback((index: number, neuronCount: number) => {
		const neuronsPerLayer = [...currentNNState.modelConfig!.neuronsPerLayer];
		if (index === neuronsPerLayer.length) {
			if (neuronCount > 0) {
				neuronsPerLayer.push(neuronCount);
			} else {
				neuronsPerLayer.pop();
			}
		} else {
			neuronsPerLayer[index] = neuronCount;
		}
		setCurrentNNState(prev => ({
			...prev,
			modelConfig: {
				...prev.modelConfig!,
				neuronsPerLayer
			}
		}));
	}, [currentNNState]);

	const handleStartTraining = useCallback((data: any[], columns: any[]) => {
		setCurrentState({
			...currentState,
			model: {
				training: true,
				completed: false,
				paused: false,
				prediction: null,
			},
			training: {
				transcurredEpochs: 0,
				loss: 0,
				accuracy: 0,
				modelHistory: [],
			}
		})
		// tfInstance?.debug(data, columns, currentNNState.modelConfig!, currentNNState.trainingConfig!);

		workerRef.current?.postMessage({
			type: "create_train",
			data: {
				data,
				columns,
				modelConfig: currentNNState.modelConfig!,
				trainConfig: currentNNState.trainingConfig!,
			},
		});
		setSelectedLayer("output");
	}, [currentNNState]);

	const handleSetSelectedLayer = useCallback((layer: LayerType) => {
		setSelectedLayer(layer);
	}, [setSelectedLayer]);


	if (!tfReady || !data || !columns || columns.length === 0) {
		return (
			<LoadingIndicator />
		);
	}

	if (currentSlideIndex !== index) {
		return <View />;
	}

	return (
		<View style={[styles.centeredMaxWidth, styles.slideWidth, { gap: 8, flex: 1 }]}>
			<View style={[styles.container, { gap: 16 }]}>
				<View style={localStyles.header}>
					<Text style={styles.title}>Neural Network</Text>
					<Surface style={styles.problemBadge}>
						<Text style={styles.badgeText}>{currentNNState.modelConfig?.problemType}</Text>
					</Surface>
				</View>
				<NNTabs
					selectedLayer={selectedLayer}
					setSelectedLayer={handleSetSelectedLayer}
					inputColumns={inputColumns}
					outputColumn={currentNNState.trainingConfig?.dataPreparationConfig?.targetColumn!}
					problemType={currentNNState.modelConfig?.problemType!}
					neuronsPerLayer={currentNNState.modelConfig?.neuronsPerLayer!}
				/>

				<Button
					mode="contained"
					style={localStyles.trainingButton}
					buttonColor={Colors.orange}
					onPress={() => {
						if (currentState.model.training) {
							workerRef.current?.postMessage({
								type: "stop_training",
							});
							setCurrentState({
								...currentState,
								model: {
									training: false,
									completed: true,
									paused: false,
									prediction: null,
								},
							})
						} else {
							handleStartTraining(data, columns);
						}
					}}
				>
					{currentState.model.training ? "Stop training" : currentState.model.completed ? "Train again" : "Start training"}
				</Button>
			</View>
			<LayerDetails
				selectedLayer={selectedLayer}
				inputColumns={inputColumns}
				outputColumn={currentNNState.trainingConfig?.dataPreparationConfig?.targetColumn!}
				handleActivationFunctionChange={handleActivationFunctionChange}
				handleNeuronCountChange={handleNeuronCountChange}
				handleEpochsChange={handleEpochsChange}
				currentNNState={currentNNState}
				data={data}
				columns={columns}
				dataset_info={dataset_info}
				traces={traces}
				index={index}
			/>
		</View>
	);
}

const localStyles = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	trainingButton: {
		alignSelf: "flex-end",
		borderRadius: 4,
	},

});
