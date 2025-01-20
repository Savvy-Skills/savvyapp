import { Button, IconButton, Menu, Surface, TextInput } from "react-native-paper";
import { Text } from "react-native-paper";
import { View } from "react-native";
import ThemedTitle from "../themed/ThemedTitle";
import { Column } from "@/hooks/useDataFetch";
import { LayerType, NNState } from "@/types/neuralnetwork";
import styles from "@/styles/styles";
import { lazy, useCallback, useEffect, useState } from "react";
import { DatasetInfo } from "@/types";
import { TraceConfig } from "../DataVisualizerPlotly";
import DataTableContainer from "../DataTableContainer";
import { useTFStore } from "@/store/tensorStore";
import { Data } from "plotly.js";

import { Colors } from "@/constants/Colors";
import { generateColors } from "@/utils/utilfunctions";

const DataPlotter = lazy(() => import("../DataPlotter"));

interface LayerDetailsProps {
	selectedLayer: LayerType;
	inputColumns: Column[];
	outputColumn: string;
	currentNNState: NNState;
	data: any[];
	columns: Column[];
	dataset_info: DatasetInfo;
	traces: TraceConfig[];
	handleActivationFunctionChange: (activationFunction: string) => void;
	handleNeuronCountChange: (neuronCount: number, index: number) => void;
	handleEpochsChange: (epochs: number) => void;
	index: number;
}

const activationFunctionsMap = {
	"relu": "ReLU",
	"sigmoid": "Sigmoid",
	"tanh": "Tanh",
	"softmax": "Softmax",
}

export default function LayerDetails({
	selectedLayer,
	inputColumns,
	outputColumn,
	currentNNState,
	data,
	columns,
	dataset_info,
	traces,
	handleActivationFunctionChange,
	handleNeuronCountChange,
	handleEpochsChange,
	index
}: LayerDetailsProps) {
	const { modelConfig: currentModelConfig, trainingConfig: currentTrainingConfig } = currentNNState;
	const { tfInstance, currentState } = useTFStore();
	const [showActivationMenu, setShowActivationMenu] = useState(false);
	const [showEpochsMenu, setShowEpochsMenu] = useState(false);
	const [predictionInputs, setPredictionInputs] = useState<string[]>([]);
	const [predictionResult, setPredictionResult] = useState<string | null>(null);


	const plotlyAccData: Data[] = [{
		x: currentState.training.modelHistory.map(history => history.epoch),
		y: currentState.training.modelHistory.map(history => history.accuracy),
		type: "scatter",
		name: "Accuracy",
	}];
	const plotlyLossData: Data[] = [{
		x: currentState.training.modelHistory.map(history => history.epoch),
		y: currentState.training.modelHistory.map(history => history.loss),
		type: "scatter",
		name: "Loss",
	}];

	const layout = {
		title: "Accuracy and Loss",
		xaxis: { title: "Epoch", hovermode: false, autosize: true, bargap: 0.1 },
		yaxis: { title: "Accuracy/Loss", hovermode: false, autosize: true, bargap: 0.1 },
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
		// Take one random row from data
		// const randomRow = data[Math.floor(Math.random() * data.length)];
		// Remove the output column from the row
		// delete randomRow[outputColumn];
		// TODO: Convert predictionInputs to number[]
		const inputs = predictionInputs.map(Number);
		const { predictionsArray, mappedOutputs } = tfInstance?.predict([inputs]) || {};
		const label = mappedOutputs?.[predictionsArray?.[0] as number];
		setPredictionResult(label || null);
	}, [tfInstance, data, predictionInputs]);

	const handleChangePredictionInput = useCallback((text: string, index: number) => {
		if ((inputColumns[index].dtype === "number" && (isNaN(Number(text)) || text === ""))) {
			return;
		}
		text = text.trim();
		setPredictionInputs(prev => {
			const newInputs = [...prev];
			newInputs[index] = text;
			return newInputs;
		});
	}, []);

	const handleGetRandomInputs = useCallback(() => {
		const randomRow = data[Math.floor(Math.random() * data.length)];
		delete randomRow[outputColumn];
		const inputs = Object.values(randomRow);
		setPredictionInputs(inputs as string[]);
	}, [data]);

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
		if (predictionInputs.length === 0) {
			handleGetRandomInputs();
		}
	}, [handleGetRandomInputs]);

	if (!selectedLayer) return null;

	const accuracy = (currentState.training.modelHistory?.[currentState.training.modelHistory.length - 1]?.accuracy * 100).toFixed(2);
	const loss = (currentState.training.modelHistory?.[currentState.training.modelHistory.length - 1]?.loss * 100).toFixed(2);
	const accuracyColor = Number(accuracy) > 90 ? Colors.success : Number(accuracy) > 50 ? Colors.orange : Colors.error;
	const lossColor = Number(loss) < 10 ? Colors.success : Number(loss) > 10 && Number(loss) < 20 ? Colors.orange : Colors.error;

	const predTrace: TraceConfig = {
		x: "x",
		y: "y",
		type: "scatter",
		name: "Predicted",
		groupBy: "prediction",
	}
	

	return (
		<Surface style={styles.detailsContainer}>
			<ThemedTitle>
				{selectedLayer.charAt(0).toUpperCase() + selectedLayer.slice(1)} Layer
				Details:
			</ThemedTitle>

			<View style={{ opacity: selectedLayer === "input" ? 1 : 0, height: selectedLayer === "input" ? "auto" : 0, overflow: "hidden" }}>
				{inputColumns.map((column) => (
					<View key={column.accessor} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
						<Text style={styles.subtitle}>{column.accessor}:</Text>
						<Text>{column.dtype}</Text>
					</View>
				))}
				<DataTableContainer data={data} columns={columns} datasetInfo={dataset_info} hideFilter={true} traces={traces} index={index} />
			</View>

			<View style={{ opacity: selectedLayer === "hidden" ? 1 : 0, height: selectedLayer === "hidden" ? "auto" : 0, overflow: "hidden" }}>
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
						<IconButton icon="minus" size={24} onPress={() => {
							handleRemoveLayer();
						}} />
						<IconButton icon="plus" size={24} onPress={() => {
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
			</View>

			<View style={{ opacity: selectedLayer === "output" ? 1 : 0, height: selectedLayer === "output" ? "auto" : 0, overflow: "hidden" }}>
				<View style={{ flexDirection: "column", gap: 16 }}>
					{(currentState.model.training || currentState.model.completed) && (
						// TODO: ADD INPUTS TO PREDICT, USE COLUMNS 
						<View style={{ flexDirection: "column", gap: 8 }}>
							<DataTableContainer padding={0} data={currentState.data.testData} columns={currentState.data.columns} traces={[predTrace]} datasetInfo={dataset_info} hideVisualizer={false} hideFilter={true} index={index} />
							{currentState.model.completed && (
								<>
									<View style={{ flexDirection: "row", gap: 8 }}>
										{inputColumns.map((column, index) => (
											<View key={column.accessor} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
												<Text style={styles.subtitle}>{column.accessor}:</Text>
												<TextInput style={{ maxWidth: 100 }} mode="outlined" value={predictionInputs[index]} onChangeText={(text) => handleChangePredictionInput(text, index)} />
											</View>
										))}
										<IconButton iconColor={Colors.orange} icon="dice-6-outline" size={34} onPress={handleGetRandomInputs} />
									</View>
									<Button mode="contained" style={{ borderRadius: 4 }} buttonColor={Colors.primary} onPress={handlePredict}>
										Predict
									</Button>
									{predictionResult && (
										<>
											<Text style={styles.subtitle}>Predicted Value:</Text>
											<Text>{predictionResult}</Text>
										</>
									)}
								</>
							)}
						</View>
					)}
					{currentState.model.completed || currentState.model.training ? (
						<>
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
									{currentState.training.modelHistory.length > 0 && (
										<DataPlotter data={[...plotlyLossData, ...plotlyAccData]} layout={layout} config={config} style={style} />
									)}
								</>
							) : (
								<Text>No model yet!</Text>
							)}


						</View>
			</View>
		</Surface>
	);
};