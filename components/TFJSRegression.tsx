import React, { useState, useEffect } from "react";
import { Tensor, Sequential } from "@tensorflow/tfjs";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { fetch } from "@tensorflow/tfjs-react-native";
import LoadingIndicator from "./LoadingIndicator";
import { TFInstance } from "@/utils/TFInstance";
import { useTFStore } from "@/store/tensorStore";
import { useDataFetch } from "@/hooks/useDataFetch";



type Info = {
	min: Tensor;
	max: Tensor;
};

const xValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const yValues = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];

export default function TfjsRegression() {
	const [model, setModel] = useState<Sequential | null>(null);
	const [trained, setTrained] = useState(false);
	const [prediction, setPrediction] = useState<number | null>(null);
	const [modelCreated, setModelCreated] = useState(false);
	const [finalLoss, setFinalLoss] = useState<number | null>(null);
	const infoRef = React.useRef<Info>({} as Info);
	const { tfInstance, tfReady, initializeTF } = useTFStore();
	const { data, columns, isLoading, error } = useDataFetch("https://2810845b43907691a6f6d3af548bea56.cdn.bubble.io/f1714014246056x716561261256521100/circular-dataset.json", false);

	useEffect(() => {
		if (!tfReady) {
			initializeTF();
		}
	}, [tfReady, initializeTF]);

	if (!tfReady) {
		return (
			<LoadingIndicator />
		);
	}

	const createModel = () => {
		if (!tfInstance) return;
		// const newModel = tfInstance.tf.sequential();
		// newModel.add(
		// 	tfInstance.tf.layers.dense({ units: 2, inputShape: [1], activation: "relu" })
		// );
		// newModel.add(tfInstance.tf.layers.dense({ units: 1 }));
		// const opt = tfInstance.tf.train["sgd"](0.01);
		// newModel.compile({
		// 	loss: "meanSquaredError",
		// 	optimizer: opt,
		// 	metrics: ["mse"],
		// });
		// newModel.summary();
		// setModel(newModel);
		// setModelCreated(true);
		tfInstance.debug(data, columns);
	};

	const trainModel = async () => {
		if (!model || !tfInstance) return;

		try {
			// Generate some synthetic data for training
			const xs = tfInstance.tf.tensor2d(xValues, [15, 1]);
			const ys = tfInstance.tf.tensor2d(yValues, [15, 1]);

			// MinMax scaling
			const min = xs.min();
			const max = xs.max();
			const scaledXs = xs.sub(min).div(max.sub(min));
			const scaledYs = ys.sub(min).div(max.sub(min));

			//Save the min and max to scale the input data later
			infoRef.current = { min, max };

			// Train the model
			await model.fit(scaledXs, scaledYs, {
				epochs: 50,
				batchSize: 2,
				shuffle: true,
				callbacks: {
					onEpochEnd: (epoch, logs) => {
						if (epoch % 10 === 0) {
							console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
						}
						if (epoch === 49 && logs) {
							setFinalLoss(logs?.loss);
						}
					},
					onTrainEnd: (logs) => {
					},
				},
			});
			setTrained(true);
		} catch (err) {
			console.log({ err });
		}
	};

	const makePrediction = async () => {
		if (!model || !trained || !tfInstance) return;

		// Make a prediction
		const inputValue = 16;
		const { min, max } = infoRef.current;
		// Scale the input value


		const scaledInput = tfInstance.tf.scalar(inputValue).sub(min).div(max.sub(min));

		// Make Tensor 2D
		const scaledInput2D = scaledInput.reshape([1, 1]);

		// Make a prediction
		const scaledPrediction = model.predict(scaledInput2D) as Tensor;
		const predictionValueArray = scaledPrediction.arraySync();

		const predictionValue = (predictionValueArray as number[][])[0][0];

		// Unscale the prediction
		const uscalePredictionTensor = tfInstance.tf
			.scalar(predictionValue)
			.mul(max.sub(min))
			.add(min);

		const uscaledPredictionValue = uscalePredictionTensor.arraySync();

		setPrediction(uscaledPredictionValue as number);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>TensorFlow.js Linear Regression</Text>
			<Text>Input: {xValues.toString()}</Text>
			<Text>Output: {yValues.toString()}</Text>
			<Button
				mode="contained"
				onPress={createModel}
				style={styles.button}
				disabled={modelCreated}
			>
				{modelCreated ? "Model Created" : "Create Model"}
			</Button>
			{/* Show stats from the model */}
			<View style={styles.modelStats}>
				<Text>Model Stats</Text>
				<View style={styles.layersContainer}>
					{model &&
						model.layers.map((layer, index) => (
							<View key={index} style={styles.layer}>
								<Text>{layer.name}</Text>
							</View>
						))}
				</View>
			</View>
			<Button
				mode="contained"
				onPress={trainModel}
				style={styles.button}
				disabled={!modelCreated || trained}
			>
				{trained ? "Model Trained" : "Train Model"}
			</Button>
			<Button
				mode="contained"
				onPress={makePrediction}
				style={styles.button}
				disabled={!trained}
			>
				Make Prediction
			</Button>
			{finalLoss && (
				<Text style={styles.result}>
					Final Loss: {finalLoss.toFixed(2)}
				</Text>
			)}
			{prediction !== null && (
				<Text style={styles.result}>
					Prediction for input 16: {prediction.toFixed(2)}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
	},
	button: {
		marginVertical: 10,
	},
	result: {
		marginTop: 20,
		fontSize: 18,
	},
	modelStats: {
		marginVertical: 20,
	},
	layersContainer: {
		display: "flex",
	},
	layer: {
		backgroundColor: "rgba(0,0,0,0.3)",
	},
});
