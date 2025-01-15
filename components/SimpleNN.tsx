import { Column, useDataFetch } from "@/hooks/useDataFetch";
import { useTFStore } from "@/store/tensorStore";
import React, { lazy, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { Text, Surface, IconButton, Button, Menu, TextInput } from "react-native-paper";
import LoadingIndicator from "./LoadingIndicator";
import { ModelConfig, TrainConfig } from "@/utils/TFInstance";
import ThemedTitle from "./themed/ThemedTitle";
import { Data } from "plotly.js";

const DataPlotter = lazy(() => import("@/components/DataPlotter"));

type LayerType = "input" | "hidden" | "output" | null;

const dtypeMap = {
	"number": "numeric",
	"string": "text",
	"boolean": "toggle",
	"object": "toggle",
};

interface NeuralNetworkVisualizerProps {
	data: any;
	columns: Column[];
	initialModelConfig?: ModelConfig;
	initialTrainingConfig?: TrainConfig;
}

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
	}
}



const activationFunctions = ["relu", "sigmoid", "tanh", "softmax"];
export default function NeuralNetworkVisualizer({ data, columns = [], initialModelConfig = defaultModelConfig, initialTrainingConfig = defaultTrainingConfig }: NeuralNetworkVisualizerProps) {
	const [selectedLayer, setSelectedLayer] = useState<LayerType>(null);
	const { tfInstance, tfReady, initializeTF, currentState, setCurrentState } = useTFStore();
	const [showActivationMenu, setShowActivationMenu] = useState(false);
	const [currentModelConfig, setCurrentModelConfig] = useState<ModelConfig>(initialModelConfig);
	const [currentTrainingConfig, setCurrentTrainingConfig] = useState<TrainConfig>(initialTrainingConfig);
	const [outputColumn, setOutputColumn] = useState<string>(initialTrainingConfig.dataPreparationConfig.targetColumn);
	useEffect(() => {
		if (!tfReady) {
			initializeTF();
		}
	}, [tfReady, initializeTF]);

	const handleActivationFunctionChange = useCallback((activationFunction: string) => {
		setCurrentModelConfig({ ...currentModelConfig, activationFunction: activationFunction as ModelConfig["activationFunction"] });
		setShowActivationMenu(false);
	}, [currentModelConfig]);

	const handleEpochsChange = useCallback((text: string) => {
		const epochs = parseInt(text);
		if (isNaN(epochs) || epochs < 1) {
			setCurrentTrainingConfig({ ...currentTrainingConfig, epochs: 0 });
		} else {
			setCurrentTrainingConfig({ ...currentTrainingConfig, epochs });
		}
	}, [currentTrainingConfig]);

	const handleNeuronCountChange = useCallback((index: number, neuronCount: number) => {
		const neuronsPerLayer = [...currentModelConfig.neuronsPerLayer];
		neuronsPerLayer[index] = neuronCount;
		setCurrentModelConfig({ ...currentModelConfig, neuronsPerLayer });
	}, [currentModelConfig]);

	const handleStartTraining = useCallback(() => {
		console.log("Starting training", { data, columns, currentTrainingConfig })
		setCurrentState({
			...currentState,
			model: {
				training: true,
				completed: false,
				paused: false,
			},
			training: {
				transcurredEpochs: 0,
				loss: 0,
				accuracy: 0,
				modelHistory: [],
			}
		})
		tfInstance?.debug(data, columns, currentModelConfig, currentTrainingConfig);
		setSelectedLayer("output");
	}, [data, columns, currentModelConfig, currentTrainingConfig, tfInstance]);


	if (!tfReady || !data || !columns || columns.length === 0) {
		return (
			<LoadingIndicator />
		);
	}
	const inputColumns = columns.filter(column => column.accessor !== outputColumn);

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


	const renderLayerDetails = () => {
		if (!selectedLayer) return null;

		return (
			<Surface style={styles.detailsContainer}>
				<ThemedTitle>
					{selectedLayer.charAt(0).toUpperCase() + selectedLayer.slice(1)} Layer
					Details
				</ThemedTitle>
				{selectedLayer === "input" && (
					inputColumns.map((column) => (
						<View key={column.accessor} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
							<Text style={styles.subtitle}>{column.accessor}:</Text>
							<Text>{column.dtype}</Text>
						</View>
					))
				)}
				{selectedLayer === "hidden" && (
					<View style={{ flexDirection: "column", gap: 4 }}>
						{/* TODO: Add a dropdown for the activation function, and a number input for the number of epochs(rename to Learning Cycles) */}
						<Text style={styles.subtitle}>Activation Function:</Text>
						<Menu visible={showActivationMenu} onDismiss={() => setShowActivationMenu(false)} anchor={<Button mode="outlined" onPress={() => setShowActivationMenu(true)}>{currentModelConfig.activationFunction}</Button>}>
							{activationFunctions.map((activationFunction) => (
								<Menu.Item key={activationFunction} title={activationFunction} onPress={() => handleActivationFunctionChange(activationFunction)} />
							))}
						</Menu>

						<Text style={styles.subtitle}>Learning Cycles:</Text>
						<TextInput
							mode="outlined"
							label="Epochs"
							value={currentTrainingConfig.epochs === 0 ? "" : currentTrainingConfig.epochs.toString()}
							onChangeText={(text) => handleEpochsChange(text)}
						/>

						<Text style={styles.subtitle}>Hidden Layers:</Text>
						{currentModelConfig.neuronsPerLayer.map((neuronCount, index) => (
							<View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
								<Text>Layer {index + 1}:</Text>
								<Text>{neuronCount} neurons</Text>
							</View>
						))}
					</View>
				)}
				{selectedLayer === "output" && (
					<>
					{/* // Output should show accura\cy and loss with percentages */}
						<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
							<Text>Accuracy: {(currentState.training.modelHistory?.[currentState.training.modelHistory.length - 1]?.accuracy * 100).toFixed(2)}%</Text>
							<Text>Loss: {(currentState.training.modelHistory?.[currentState.training.modelHistory.length - 1]?.loss * 100).toFixed(2)}%</Text>
						</View>
					{/* // If there is history show a chart with the accuracy and loss using dataPlotter: dataplotter accepts data as an array of objects of type Data[] from plotly.js
					layout, config and style, we should create a layout with two charts, one for accuracy and one for loss, and pass the data to the dataplotter
					*/}
						{currentState.training.modelHistory.length > 0 && (

							<DataPlotter data={[...plotlyLossData,...plotlyAccData]} layout={layout} config={config} style={style} />
						)}
					</>
				)}
			</Surface>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Neural Network Architecture</Text>
				<Surface style={styles.badge}>
					<Text style={styles.badgeText}>{currentModelConfig.problemType}</Text>
				</Surface>
			</View>

			<View style={styles.networkContainer}>
				<Pressable onPress={() => setSelectedLayer("input")}>
					<Surface
						style={[
							styles.layerContainer,
							styles.inputLayer,
							selectedLayer === "input"
								? [styles.selectedLayer, styles.inputLayerSelected]
								: styles.unselectedLayer,
						]}
					>
						<Text style={styles.layerTitle}>Input layer</Text>
						<View style={styles.inputNodesContainer}>
							{inputColumns.map((column, index) => (
								<View key={index} style={{ gap: 4 }}>
									<Text style={styles.inputLabel}>[{column.accessor}]</Text>
									<View style={styles.inputNode}>
										<IconButton icon={dtypeMap[column.dtype as keyof typeof dtypeMap]} size={24} iconColor="#fff" />
									</View>
								</View>
							))}
						</View>
					</Surface>
				</Pressable>

				<Pressable
					style={styles.hiddenLayerWrapper}
					onPress={() => setSelectedLayer("hidden")}
				>
					<Surface
						style={[
							styles.layerContainer,
							styles.hiddenLayer,
							selectedLayer === "hidden"
								? [styles.selectedLayer, styles.hiddenLayerSelected]
								: styles.unselectedLayer,
						]}
					>
						<Text style={styles.layerTitle}>Hidden layers</Text>
						<View style={styles.hiddenLayerCircle}>
							<Image
								source={require("@/assets/images/pngs/nn.png")}
								style={{ width: 100, height: 100 }}
							/>
						</View>
						<Text style={styles.layerInfo}>[3] hidden layers</Text>
					</Surface>
				</Pressable>

				<Pressable onPress={() => setSelectedLayer("output")}>
					<Surface
						style={[
							styles.layerContainer,
							styles.outputLayer,
							selectedLayer === "output"
								? [styles.selectedLayer, styles.outputLayerSelected]
								: styles.unselectedLayer,
						]}
					>
						<Text style={styles.layerTitle}>Output layer</Text>
						<View style={styles.outputBox}>
							<Image
								source={require("@/assets/images/pngs/nn-output.png")}
								style={{ width: 60, height: 60 }}
							/>
						</View>
						<Text style={styles.outputLabel}>[{outputColumn}]</Text>
					</Surface>
				</Pressable>
			</View>

			<Button
				mode="contained"
				style={styles.trainingButton}
				buttonColor="#ffa726"
				onPress={()=>{
					if (currentState.model.training) {
						tfInstance?.triggerStopTraining();
						setCurrentState({
							...currentState,
							model: {
								training: false,
								completed: true,
								paused: false,
							},
						})
					} else {
						handleStartTraining();
					}
				}}
			>
				{currentState.model.training ? "Stop training" : "Start training"}
			</Button>
			{renderLayerDetails()}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		gap: 16,
		maxWidth: 700,
		width: "100%",
		alignSelf: "center",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	subtitle: {
		fontSize: 16,
		fontWeight: "bold",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	badge: {
		backgroundColor: "#e3f2fd",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 4,
	},
	badgeText: {
		color: "#1976d2",
		fontSize: 12,
		textTransform: "capitalize",
	},
	networkContainer: {
		flexDirection: "row",
		minHeight: 200,
	},
	layerContainer: {
		padding: 8,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: "#ccc",
		height: "100%",
	},
	hiddenLayerWrapper: {
		flex: 1,
		marginHorizontal: 8,
	},
	selectedLayer: {
		borderStyle: "solid",
		borderWidth: 2,
		elevation: 2,
	},
	unselectedLayer: {
		backgroundColor: "transparent",
	},
	layerTitle: {
		fontWeight: "bold",
		marginBottom: 8,
	},
	inputLayer: {
		width: "auto",
	},
	inputLayerSelected: {
		borderColor: "#2196f3",
	},
	hiddenLayer: {
		flexDirection: "column",
	},
	hiddenLayerSelected: {
		borderColor: "#4caf50",
	},
	outputLayer: {
		width: "auto",
	},
	outputLayerSelected: {
		borderColor: "#ffa726",
	},
	inputNodesContainer: {
		gap: 16,
	},
	inputNode: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#2196f3",
		justifyContent: "center",
		alignSelf: "center",
		alignItems: "center",
	},
	inputLabel: {
		fontSize: 12,
		textAlign: "center",
		margin: 0,
	},
	hiddenLayerCircle: {
		width: 100,
		height: 100,
		justifyContent: "center",
		alignItems: "center",
	},
	neuronsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 4,
	},
	neuron: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#7c4dff",
	},
	layerInfo: {
		fontSize: 12,
		marginTop: 4,
	},
	outputBox: {
		width: 80,
		height: 80,
		borderRadius: 8,
		backgroundColor: "rgba(255, 204, 128, 0.2)",
		borderColor: "#ffcc80",
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	outputLabel: {
		fontSize: 12,
		marginTop: 4,
	},
	detailsContainer: {
		padding: 16,
		marginTop: 16,
		borderRadius: 8,
		elevation: 2,
		gap: 16,
	},
	// detailsTitle: {
	// 	fontSize: 16,
	// 	fontWeight: "bold",
	// 	marginBottom: 8,
	// },
	trainingButton: {
		marginTop: 16,
		alignSelf: "flex-end",
		borderRadius: 4,
	},
});
