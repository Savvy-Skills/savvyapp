import { Button, IconButton, Menu, Surface, TextInput } from "react-native-paper";
import { Text } from "react-native-paper";
import { View } from "react-native";
import ThemedTitle from "../themed/ThemedTitle";
import { Column } from "@/hooks/useDataFetch";
import { LayerType, NNState } from "@/types/neuralnetwork";
import styles from "@/styles/styles";
import { lazy, useCallback, useEffect, useMemo, useState } from "react";
import { DatasetInfo } from "@/types";
import { TraceConfig } from "../data/DataVisualizerPlotly";
import DataTableContainer from "../data/DataTableContainer";
import { useTFStore } from "@/store/tensorStore";
import { Data } from "plotly.js";

import { Colors } from "@/constants/Colors";
import { generateColors } from "@/utils/utilfunctions";
import React from "react";
import { MESSAGE_TYPE_PREDICT, MESSAGE_TYPE_PREDICTION_RESULT } from "@/constants/Utils";

const DataPlotter = lazy(() => import("../data/DataPlotter"));

interface LayerDetailsProps {
	selectedLayer: LayerType;
	inputColumns: Column[];
	outputColumn: string;
	currentNNState: NNState;
	data: any[];
	columns: Column[];
	dataset_info: DatasetInfo;
	initialTraces: TraceConfig[];
	predictionTraces: TraceConfig[];
	handleActivationFunctionChange: (activationFunction: string) => void;
	handleNeuronCountChange: (neuronCount: number, index: number) => void;
	handleEpochsChange: (epochs: number) => void;
	index: number;
	modelId: string;
}

const activationFunctionsMap = {
	"relu": "ReLU",
	"sigmoid": "Sigmoid",
	"tanh": "Tanh",
	"softmax": "Softmax",
}

interface PredictionInputs {
	[key: string]: string | undefined;
}

export default function LayerDetails({
	selectedLayer,
	inputColumns,
	outputColumn,
	currentNNState,
	data,
	columns,
	dataset_info,
	initialTraces,
	predictionTraces,
	handleActivationFunctionChange,
	handleNeuronCountChange,
	handleEpochsChange,
	index,
	modelId,
}: LayerDetailsProps) {
	const { modelConfig: currentModelConfig, trainingConfig: currentTrainingConfig } = currentNNState;
	const { currentState, tfWorker, currentModelId } = useTFStore();
	const [showActivationMenu, setShowActivationMenu] = useState(false);
	const [showEpochsMenu, setShowEpochsMenu] = useState(false);
	const [predictionInputs, setPredictionInputs] = useState<PredictionInputs>({} as PredictionInputs);
	const [predictionResult, setPredictionResult] = useState<string | null>(null);

	const problemType = currentNNState.modelConfig?.problemType;

	const plotlyAccData: Data[] = problemType === "classification" ? [{
		x: currentState[modelId]?.training.modelHistory?.map(history => history.epoch),
		y: currentState[modelId]?.training.modelHistory?.map(history => history.accuracy),
		type: "scatter",
		name: "Accuracy",
	}] : [];

	// const plotlyValAccData: Data[] =problemType === "classification" ? [{
	// 	x: currentState.training.modelHistory?.map(history => history.epoch),
	// 	y: currentState.training.modelHistory?.map(history => history.val_acc),
	// 	type: "scatter",
	// 	name: "Validation Accuracy",
	// }] : [];


	const plotlyLossData: Data[] = [{
		x: currentState[modelId]?.training.modelHistory?.map(history => history.epoch),
		y: currentState[modelId]?.training.modelHistory?.map(history => history.loss),
		type: "scatter",
		name: "Loss",
	}];

	// const plotlyValLossData: Data[] = [{
	// 	x: currentState.training.modelHistory?.map(history => history.epoch),
	// 	y: currentState.training.modelHistory?.map(history => history.val_loss),
	// 	type: "scatter",
	// 	name: "Validation Loss",
	// }];

	const layout = {
		title: problemType === "classification" ? "Accuracy and Loss" : "Loss",
		xaxis: { title: "Epoch", hovermode: false, autosize: true, bargap: 0.1 },
		yaxis: { title: problemType === "classification" ? "Accuracy" : "Loss", hovermode: false, autosize: true, bargap: 0.1 },
	};

	const config = {
		displayModeBar: false,
		responsive: true,
		staticPlot: true,
	};

	const style = {
		width: "100%",
		height: 300,
	};
	const handlePredict = useCallback(() => {
		tfWorker?.postMessage({
			from: "main",
			type: MESSAGE_TYPE_PREDICT,
			data: {
				inputs: predictionInputs,
			},
		});
	}, [predictionInputs, tfWorker]);


	const handleChangePredictionInput = useCallback((text: string, key: string) => {
		// if ((inputColumns[index].dtype === "number" && (isNaN(Number(text)) || text === ""))) {
		// 	return;
		// }
		if (inputColumns.find(column => column.accessor === key)?.dtype === "number" && (isNaN(Number(text)) || text === "")) {
			return;
		}
		text = text.trim();
		setPredictionInputs(prev => {
			const newInputs = { ...prev };
			newInputs[key] = text;
			return newInputs;
		});
	}, []);

	const handleGetRandomInputs = useCallback(() => {
		const randomRow = { ...data[Math.floor(Math.random() * data.length)] };
		delete randomRow[outputColumn];
		setPredictionInputs(randomRow);
	}, [data, outputColumn]);

	const handleAddLayer = useCallback(() => {
		handleNeuronCountChange(currentModelConfig?.neuronsPerLayer.length ?? 0, 1);
	}, [handleNeuronCountChange, currentModelConfig]);

	const handleRemoveLayer = useCallback(() => {
		handleNeuronCountChange(currentModelConfig?.neuronsPerLayer.length ?? 0, -1);
	}, [handleNeuronCountChange, currentModelConfig]);

	const handleAddNeuron = useCallback((index: number) => {
		handleNeuronCountChange(index, (currentModelConfig?.neuronsPerLayer[index] ?? 0) + 1);
	}, [handleNeuronCountChange, currentModelConfig]);

	const handleRemoveNeuron = useCallback((index: number) => {
		handleNeuronCountChange(index, (currentModelConfig?.neuronsPerLayer[index] ?? 0) - 1);
	}, [handleNeuronCountChange, currentModelConfig]);

	useEffect(() => {
		if (Object.keys(predictionInputs).length === 0) {
			handleGetRandomInputs();
		}
	}, [handleGetRandomInputs]);

	if (!selectedLayer) return null;

	const accuracy = (currentState[modelId]?.training.modelHistory?.[currentState[modelId]?.training.modelHistory.length - 1]?.accuracy * 100).toFixed(2);
	const loss = (currentState[modelId]?.training.modelHistory?.[currentState[modelId]?.training.modelHistory.length - 1]?.loss * 100).toFixed(2);
	const accuracyColor = Number(accuracy) > 90 ? Colors.success : Number(accuracy) > 50 ? Colors.orange : Colors.error;
	const lossColor = Number(loss) < 10 ? Colors.success : Number(loss) > 10 && Number(loss) < 20 ? Colors.orange : Colors.error;

	const title = useMemo(() => {
		if (selectedLayer === "input") {
			return "Features";
		} else if (selectedLayer === "hidden") {
			return "Model Configuration";
		} else if (selectedLayer === "output") {
			return "Predictions";
		}
	}, [selectedLayer]);

	const renderLayerContent = () => {
		switch (selectedLayer) {
			case "input":
				return (
					<DataTableContainer 
						data={data} 
						columns={columns} 
						datasetInfo={dataset_info} 
						hideFilter={true} 
						traces={initialTraces} 
						index={index} 
					/>
				);
			case "hidden":
				return (
					<View style={{ flexDirection: "column", gap: 4 }}>
						<View style={{ flexDirection: "row", gap: 16 }}>
							<View style={{ flexDirection: "column", gap: 4 }}>
								<Text style={styles.subtitle}>Activation Function:</Text>
								<Menu
									visible={showActivationMenu}
									onDismiss={() => setShowActivationMenu(false)}
									anchor={
										<Button mode="outlined"
											style={styles.dropdownMenuButton}
											icon="chevron-down"
											contentStyle={styles.dropdownMenuContainer}
											onPress={() => setShowActivationMenu(true)}>{activationFunctionsMap[currentModelConfig?.activationFunction as keyof typeof activationFunctionsMap]}
										</Button>
									}
								>
									{Object.keys(activationFunctionsMap).map((activationFunction) => (
										<Menu.Item key={activationFunction}
											title={activationFunctionsMap[activationFunction as keyof typeof activationFunctionsMap]}
											onPress={() => {
												handleActivationFunctionChange(activationFunction);
												setShowActivationMenu(false);
											}} />
									))}
								</Menu>
							</View>

							<View style={{ flexDirection: "column", gap: 4 }}>
								<Text style={styles.subtitle}>Learning Cycles:</Text>
								<Menu visible={showEpochsMenu}
									onDismiss={() => setShowEpochsMenu(false)}
									anchor={
										<Button mode="outlined"
											style={styles.dropdownMenuButton}
											icon="chevron-down"
											contentStyle={styles.dropdownMenuContainer}
											onPress={() => setShowEpochsMenu(true)}>{currentTrainingConfig?.epochs}
										</Button>
									}
								>
									{[1, 5, 10, 25, 50, 100, 500].map((epochs) => (
										<Menu.Item key={epochs} title={epochs.toString()} onPress={() => {
											handleEpochsChange(epochs);
											setShowEpochsMenu(false);
										}} />
									))}
								</Menu>
							</View>
						</View>
						<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
							<Text style={styles.subtitle}>Hidden Layers:</Text>
							<IconButton disabled={currentModelConfig?.neuronsPerLayer.length === 1} icon="minus" size={24} onPress={() => {
								handleRemoveLayer();
							}} />
							<IconButton disabled={currentModelConfig?.neuronsPerLayer.length === 10} icon="plus" size={24} onPress={() => {
								handleAddLayer();
							}} />

						</View>
						{currentModelConfig?.neuronsPerLayer.map((neuronCount, index) => (
							<View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
								<Text>Layer {index + 1}:</Text>
								<Text>{neuronCount} neurons</Text>
								<IconButton disabled={neuronCount === 1} icon="minus" size={18} onPress={() => {
									handleRemoveNeuron(index);
								}} />
								<IconButton icon="plus" size={18} onPress={() => {
									handleAddNeuron(index);
								}} />
							</View>
						))}
					</View>
				);
			case "output":
				return (
					<View style={{ flexDirection: "column", gap: 16 }}>
						{(currentState[modelId]?.model.training || currentState[modelId]?.model.completed) ? (
							<>
								<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
									{currentNNState.modelConfig?.problemType === "classification" && (
										<View style={[styles.metricContainer, { borderColor: accuracyColor, backgroundColor: generateColors(accuracyColor, 0.1).muted }]}>
											<Text style={[{ color: accuracyColor }]}>Accuracy:</Text>
											<Text style={[{ color: accuracyColor }]}>{accuracy}%</Text>
										</View>
									)}
									<View style={[styles.metricContainer, { borderColor: lossColor, backgroundColor: generateColors(lossColor, 0.1).muted }]}>
										<Text style={[{ color: lossColor }]}>Loss:</Text>
										<Text style={[{ color: lossColor }]}>{loss}%</Text>
									</View>
								</View>
								
								{currentState[modelId]?.training.modelHistory?.length > 0 && (
									<DataPlotter data={[...plotlyLossData, ...plotlyAccData]} layout={layout} config={config} style={style} dom={{scrollEnabled: false}} onHover={() => {}} onPointClick={() => {}} />
								)}
								
								{currentState[modelId]?.data?.testData && currentState[modelId]?.data.testData.length > 0 && (
									<DataTableContainer 
										originalData={currentModelConfig?.problemType === "regression" ? data : undefined} 
										originalTraces={currentModelConfig?.problemType === "regression" ? initialTraces : undefined} 
										invert 
										padding={0} 
										data={currentState[modelId]?.data.testData} 
										columns={currentState[modelId]?.data.columns} 
										traces={predictionTraces} 
										datasetInfo={dataset_info} 
										hideVisualizer={false} 
										hideFilter={true} 
										index={index} 
									/>
								)}
								
								{currentState[modelId]?.model.completed && (
									<>
										<View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
											{inputColumns.map((column, index) => (
												<View key={column.accessor} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
													<Text style={styles.subtitle}>{column.accessor}:</Text>
													<TextInput style={{ maxWidth: 100 }} mode="outlined" value={predictionInputs[column.accessor]} onChangeText={(text) => handleChangePredictionInput(text, column.accessor)} />
												</View>
											))}
											<IconButton iconColor={Colors.orange} icon="dice-6-outline" size={34} onPress={handleGetRandomInputs} />
										</View>
										
										{currentModelId === modelId && (
											<Button mode="contained" style={{ borderRadius: 4 }} buttonColor={Colors.primary} onPress={handlePredict}>
												Predict
											</Button>
										)}
										
										{currentState[modelId]?.model.prediction && currentState[modelId]?.model.prediction.predictedClass !== null && (
											<>
												<Text style={styles.subtitle}>Predicted Value:</Text>
												<Text>{currentState[modelId]?.model.prediction.predictedClass}</Text>
											</>
										)}
									</>
								)}
							</>
						) : (
							<View style={{ justifyContent: "center", alignItems: "center" }}>
								<Text style={{ fontSize: 54, fontWeight: "bold" }}>🤔</Text>
								<Text style={{ textAlign: "center" }}>Nothing to see here... yet! </Text>
							</View>
						)}
					</View>
				);
			default:
				return null;
		}
	};

	return (
		<Surface style={styles.detailsContainer}>
			<ThemedTitle>
				{title}
			</ThemedTitle>
			
			{renderLayerContent()}
		</Surface>
	);
};