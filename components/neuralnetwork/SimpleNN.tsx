import { useDataFetch } from "@/hooks/useDataFetch";
import { useTFStore } from "@/store/tensorStore";
import React, { lazy, useCallback, useEffect, useState } from "react";
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



const defaultModelConfig: ModelConfig = {
	neuronsPerLayer: [4, 2, 1],
	problemType: "classification",
	activationFunction: "relu",
	compileOptions: {
		optimizer: "adam",
		learningRate: 0.01,
		lossFunction: "binaryCrossentropy",
		metrics: "acc",
	},
	inputSize: 2
}

const defaultTrainingConfig: TrainConfig = {
	epochs: 50,
	shuffle: true,
	validationSplit: 0.2,
	batchSize: 16,
	dataPreparationConfig: {
		targetColumn: "label",
		disabledColumns: [],
		outputsNumber: 2,
		uniqueTargetValues: ["Blue", "Yellow"],
		testSize: 0.2,
		stratify: true,
	}
}

const defaultNNState: NNState = {
	modelConfig: defaultModelConfig,
	trainingConfig: defaultTrainingConfig,
}

const traces: TraceConfig[] = [
	{
		"x": "x",
		"y": "y",
		"name": "X vs Y",
		"type": "scatter",
		"groupBy": "label"
	}
]

export default function NeuralNetworkVisualizer({ initialNNState = defaultNNState, dataset_info, index }: NeuralNetworkVisualizerProps) {
	const [selectedLayer, setSelectedLayer] = useState<LayerType>("input");
	const { tfInstance, tfReady, initializeTF, currentState, setCurrentState } = useTFStore();
	const [currentNNState, setCurrentNNState] = useState<NNState>(initialNNState);
	const {currentSlideIndex} = useCourseStore();

	const { data, columns } = useDataFetch({ source: dataset_info?.url, isCSV: dataset_info?.extension === "csv" });

	useEffect(() => {
		if (!tfReady) {
			initializeTF();
		}
	}, [tfReady, initializeTF]);
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
			neuronsPerLayer.push(neuronCount);
		} else {
			neuronsPerLayer[index] = neuronCount;
		}
		console.log("Neuron count changed", { neuronsPerLayer, index, neuronCount });
		setCurrentNNState(prev => ({
			...prev,
			modelConfig: {
				...prev.modelConfig!,
				neuronsPerLayer
			}
		}));
	}, [currentNNState]);

	const handleStartTraining = useCallback(() => {
		// console.log("Starting training", { data, columns, currentNNState })
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
		tfInstance?.debug(data, columns, currentNNState.modelConfig!, currentNNState.trainingConfig!);
		setSelectedLayer("output");
	}, [data, columns, currentNNState, tfInstance]);

	const handleSetSelectedLayer = useCallback((layer: LayerType) => {
		setSelectedLayer(layer);
	}, [setSelectedLayer]);


	if (!tfReady || !data || !columns || columns.length === 0) {
		return (
			<LoadingIndicator />
		);
	}
	const inputColumns = columns.filter(column => column.accessor !== currentNNState.trainingConfig?.dataPreparationConfig?.targetColumn);

	if (currentSlideIndex !== index) {
		return <View />;
	}

	return (
		<View style={[styles.centeredMaxWidth, styles.slideWidth, { gap: 8, flex: 1 }]}>
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
				outputColumn={currentNNState.trainingConfig?.dataPreparationConfig?.targetColumn!} />

			<Button
				mode="contained"
				style={localStyles.trainingButton}
				buttonColor={Colors.orange}
				onPress={() => {
					if (currentState.model.training) {
						tfInstance?.triggerStopTraining();
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
						handleStartTraining();
					}
				}}
			>
				{currentState.model.training ? "Stop training" : currentState.model.completed ? "Train again" : "Start training"}
			</Button>
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
		marginBottom: 16,
	},
	trainingButton: {
		marginTop: 16,
		alignSelf: "flex-end",
		borderRadius: 4,
	},

});
