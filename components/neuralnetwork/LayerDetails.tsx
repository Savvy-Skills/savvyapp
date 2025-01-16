import { Button, Menu, Surface, TextInput } from "react-native-paper";
import { Text } from "react-native-paper";
import { View } from "react-native";
import ThemedTitle from "../themed/ThemedTitle";
import { Column } from "@/hooks/useDataFetch";
import { LayerType, NNState } from "./SimpleNN";
import styles from "@/styles/styles";
import { lazy, useCallback, useState } from "react";
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
}

const activationFunctionsMap = {
	"relu": "ReLU",
	"sigmoid": "Sigmoid",
	"tanh": "Tanh",
	"softmax": "Softmax",
}

export default function LayerDetails({ selectedLayer, inputColumns, outputColumn, currentNNState, data, columns, dataset_info, traces, handleActivationFunctionChange, handleNeuronCountChange, handleEpochsChange }: LayerDetailsProps) {
	const { modelConfig: currentModelConfig, trainingConfig: currentTrainingConfig } = currentNNState;
	const { tfInstance, currentState } = useTFStore();
	const [showActivationMenu, setShowActivationMenu] = useState(false);
	const [showEpochsMenu, setShowEpochsMenu] = useState(false);

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
		const randomRow = data[Math.floor(Math.random() * data.length)];
		// Remove the output column from the row
		delete randomRow[outputColumn];
		const inputs = Object.values(randomRow);
		tfInstance?.predict([inputs]);
		
	}, [tfInstance, data]);

	if (!selectedLayer) return null;

	const accuracy = (currentState.training.modelHistory?.[currentState.training.modelHistory.length - 1]?.accuracy * 100).toFixed(2);
	const loss = (currentState.training.modelHistory?.[currentState.training.modelHistory.length - 1]?.loss * 100).toFixed(2);
	const accuracyColor = Number(accuracy) > 90 ? Colors.success : Number(accuracy) > 50 ? Colors.orange : Colors.error;
	const lossColor = Number(loss) < 10 ? Colors.success : Number(loss) > 10 && Number(loss) < 20 ? Colors.orange : Colors.error;

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
				<DataTableContainer data={data} columns={columns} datasetInfo={dataset_info} hideFilter={true} traces={traces} />
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
					<Text style={styles.subtitle}>Hidden Layers:</Text>
					{currentModelConfig?.neuronsPerLayer.map((neuronCount, index) => (
						<View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
							<Text>Layer {index + 1}:</Text>
							<Text>{neuronCount} neurons</Text>
						</View>
					))}
				</View>
			</View>

			<View style={{ opacity: selectedLayer === "output" ? 1 : 0, height: selectedLayer === "output" ? "auto" : 0, overflow: "hidden" }}>
				<View style={{ flexDirection: "column", gap: 16 }}>
					{currentState.model.completed && (
						<Button mode="contained" onPress={handlePredict}>
							Predict
						</Button>
					)}
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
				</View>
			</View>
		</Surface>
	);
};