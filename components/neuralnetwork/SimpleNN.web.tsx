import { useDataFetch } from "@/hooks/useDataFetch";
import { useTFStore } from "@/store/tensorStore";
import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface, Button } from "react-native-paper";
import LoadingIndicator from "../LoadingIndicator";
import NNTabs from "./NNTabs";
import styles from "@/styles/styles";
import LayerDetails from "./LayerDetails";
import { useCourseStore } from "@/store/courseStore";
import { LayerType, ModelConfig, NeuralNetworkVisualizerProps, NNState } from "@/types/neuralnetwork";
import { Colors } from "@/constants/Colors";

export default function NeuralNetworkVisualizer({ initialNNState, dataset_info, index }: NeuralNetworkVisualizerProps) {
	const [selectedLayer, setSelectedLayer] = useState<LayerType>("input");
	const { currentState, setCurrentState, tfWorker, initializeWorker, workerReady, setCurrentModelId } = useTFStore();
	const [currentNNState, setCurrentNNState] = useState<NNState>(initialNNState ?? {} as NNState);
	const { currentSlideIndex } = useCourseStore();
	const { data, columns } = useDataFetch({ source: dataset_info?.url, isCSV: dataset_info?.extension === "csv" });

	const modelId = useMemo(() => {
		return `${dataset_info?.id}-${index}`;
	}, [dataset_info, index]);

	// Get only the columns that are in the featureConfig
	const inputColumns = columns.filter(column => currentNNState.trainingConfig?.dataPreparationConfig?.featureConfig?.some(feature => feature.field === column.accessor));

	useEffect(() => {
		initializeWorker();
	}, [initializeWorker]);


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
		setCurrentModelId(modelId);
		setCurrentState(modelId, {
			...currentState[modelId],
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

		tfWorker?.postMessage({
			from: "main",
			type: "create_train",
			modelId,
			data: {
				data,
				columns,
				modelConfig: currentNNState.modelConfig!,
				trainConfig: currentNNState.trainingConfig!,
			},
		});
		setSelectedLayer("output");
	}, [currentNNState, tfWorker]);

	const handleSetSelectedLayer = useCallback((layer: LayerType) => {
		setSelectedLayer(layer);
	}, [setSelectedLayer]);


	if (!workerReady || !data || !columns || columns.length === 0) {
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
					outputColumn={currentNNState.trainingConfig?.dataPreparationConfig?.targetConfig.field!}
					problemType={currentNNState.modelConfig?.problemType!}
					neuronsPerLayer={currentNNState.modelConfig?.neuronsPerLayer!}
				/>

				<Button
					mode="contained"
					style={localStyles.trainingButton}
					buttonColor={Colors.orange}
					onPress={() => {
						if (currentState[modelId]?.model.training) {
							tfWorker?.postMessage({
								from: "main",
								type: "stop_training",
							});
							setCurrentState(modelId, {
								...currentState[modelId],
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
					{currentState[modelId]?.model.training ? "Stop training" : currentState[modelId]?.model.completed ? "Train again" : "Start training"}
				</Button>
			</View>
			<LayerDetails
				selectedLayer={selectedLayer}
				inputColumns={inputColumns}
				outputColumn={currentNNState.trainingConfig?.dataPreparationConfig?.targetConfig.field!}
				handleActivationFunctionChange={handleActivationFunctionChange}
				handleNeuronCountChange={handleNeuronCountChange}
				handleEpochsChange={handleEpochsChange}
				currentNNState={currentNNState}
				data={data}
				columns={columns}
				dataset_info={dataset_info}
				initialTraces={currentNNState.initialTraces ?? []}
				predictionTraces={currentNNState.predictionTraces ?? []}
				index={index}
				modelId={modelId}
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
