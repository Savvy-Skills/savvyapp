import { data, Sequential, Tensor } from "@tensorflow/tfjs";
import { loadModules } from "./utilfunctions";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import { Column } from "@/hooks/useDataFetch";
import { DataPreparationConfig, DataPreparationMetadata, ModelConfig, PrepareDataResult, TrainConfig } from "@/types/neuralnetwork";




function getKernelRegularizer(tf: any, regularization: string | undefined, rate: number | undefined) {
	if (!regularization) {
		return null;
	}
	regularization = regularization.toLowerCase();
	if (regularization === "l1") {
		return tf.regularizers.l1({ l1: rate });
	} else if (regularization === "l2") {
		return tf.regularizers.l2({ l2: rate });
	} else if (regularization === "l1l2") {
		return tf.regularizers.l1l2({ l1: rate, l2: rate });
	}
	return null;
}



function getLayers(model: Sequential) {
	let layers = []
	// Iterate through each layer to get the weights and biases
	for (let i = 0; i < model.layers.length; i++) {
		const layer = model.layers[i]
		const weightsTensors = layer.getWeights()
		let weights = null
		let biases = null

		if (weightsTensors.length > 0) {
			weights = weightsTensors[0].arraySync() // Get the weights
		}
		if (weightsTensors.length > 1) {
			biases = weightsTensors[1].arraySync() // Get the biases
		}

		// Structure to store layer information
		let currentLayer = {
			layer: i + 1,
			config: layer.getConfig(),
			weights: weights,
			biases: biases,
		}
		layers.push(currentLayer)
	}
	return layers
}

export class TFInstance {
	private static instance: TFInstance;
	tf: any;
	currentModel: Sequential | null;
	currentModelMetrics: any[];
	currentTotalLoss: number;
	currentTotalAccuracy: number;
	transcurredEpochs: number;
	stopTraining: boolean;
	dataPreparationMetadata: DataPreparationMetadata;
	private stateUpdateCallbacks: ((state: any) => void)[] = [];




	private constructor() {
		this.tf = null;
		this.currentModel = null;
		this.currentModelMetrics = [];
		this.currentTotalLoss = 0;
		this.currentTotalAccuracy = 0;
		this.transcurredEpochs = 0;
		this.stopTraining = false;
		this.dataPreparationMetadata = {};
	}

	static getInstance(): TFInstance {
		if (!TFInstance.instance) {
			TFInstance.instance = new TFInstance();
		}
		return TFInstance.instance;
	}


	registerStateCallback(callback: (state: any) => void) {
		this.stateUpdateCallbacks.push(callback);
	}

	// Method to notify all registered callbacks
	private notifyStateUpdate(newState: any) {
		this.stateUpdateCallbacks.forEach(callback => callback(newState));
	}

	async debug(data: any[], columns: Column[], modelConfig: ModelConfig, trainConfig: TrainConfig) {
		// const mockConfig: ModelConfig = {
		// 	neuronsPerLayer: [4, 2, 1],
		// 	problemType: "classification",
		// 	activationFunction: "relu",

		// 	compileOptions: {
		// 		optimizer: "adam",
		// 		learningRate: 0.01,
		// 		lossFunction: "binaryCrossentropy",
		// 		metrics: "acc",
		// 	},
		// 	inputSize: 2
		// }
		const model = this.createModel(modelConfig);
		const layers = getLayers(model);
		const lastLayerShape = model.layers[model.layers.length - 1].outputShape[1];
		const preparedData = this.prepareData(data, columns, trainConfig.dataPreparationConfig, lastLayerShape);
		this.dataPreparationMetadata = preparedData.dataPreparationMetadata || {};
		await this.trainModel(model, preparedData, trainConfig, data, columns);
	}

	trainTestSplit(data: any[], columns: Column[], dataPreparationConfig: DataPreparationConfig): { testIndices: number[], trainIndices: number[] } {
		// Split data into train and test
		const { testSize, stratify } = dataPreparationConfig;
		const totalSamples = data.length;
		const numTestSamples = Math.floor(totalSamples * testSize); // Calculate number of test samples
		console.log({ testSize, stratify, numTestSamples });

		let testIndices: number[] = [];
		let trainIndices: number[] = [];

		if (stratify) {
			const targetColumn = columns.find(column => column.accessor === dataPreparationConfig.targetColumn);
			const targetValues = data.map(row => row[targetColumn?.accessor!]);
			const uniqueTargetValues = [...new Set(targetValues)];
			uniqueTargetValues.forEach(value => {
				const indices = data.map((_, index) => targetValues[index] === value ? index : null).filter(Boolean);
				// Shuffle indices
				this.tf.util.shuffle(indices);
				const localTestIndices: any[] = indices.slice(0, Math.floor(indices.length * testSize));
				const localTrainIndices: any[] = indices.slice(Math.floor(indices.length * testSize));
				localTestIndices.forEach(index => testIndices.push(index));
				localTrainIndices.forEach(index => trainIndices.push(index));
			});
		} else {
			// Split data into train and test directly but shuffle randomly first
			const indices = data.map((_, index) => index);
			this.tf.util.shuffle(indices);
			const localTestIndices: number[] = indices.slice(0, numTestSamples);
			const localTrainIndices: number[] = indices.slice(numTestSamples);
			localTestIndices.forEach(index => testIndices.push(index));
			localTrainIndices.forEach(index => trainIndices.push(index));
		}
		return { testIndices, trainIndices };
	}
	async triggerStopTraining() {
		this.stopTraining = true;
	}

	async trainModel(model: Sequential, preparedData: PrepareDataResult, trainConfig: TrainConfig, data: any[], columns: Column[]) {
		const { batchSize, epochs, shuffle, validationSplit } = trainConfig;
		const { features, target, outputsNumber } = preparedData;
		this.notifyStateUpdate({
			model: {
				completed: false,
				training: true,
			},
		});

		const lastLayerShape = model.layers[model.layers.length - 1].outputShape[1];
		if (outputsNumber !== lastLayerShape) {
			console.log("Output shape doesn't match!");
			if (outputsNumber === 2 && lastLayerShape === 1) {
				console.log("Binary classification case, outputs are 0 or 1");
			} else {
				let message =
					"Output shape missmatch! Expected Neurons: " +
					outputsNumber +
					" Provided: " +
					lastLayerShape;
				throw new Error(message);
			}
		}
		model.fit(features, target, {
			batchSize,
			epochs,
			shuffle,
			validationSplit,
			callbacks: {
				onEpochEnd: (epoch, logs) => {
					if (this.stopTraining) {
						console.log("Stopping training");
						model.stopTraining = true;
						this.stopTraining = false;
						return;
					}
					this.transcurredEpochs = epoch;
					this.currentTotalLoss += logs?.loss || 0;
					this.currentTotalAccuracy += logs?.acc || 0;
					this.currentModelMetrics.push({
						epoch,
						loss: logs?.loss,
						accuracy: logs?.acc,
					});
					const {testData, newColumns} = this.getTestData(data, preparedData.testIndices ?? [], columns, trainConfig);
					this.notifyStateUpdate({
						training: {
							transcurredEpochs: epoch,
							loss: this.currentTotalLoss,
							accuracy: this.currentTotalAccuracy,
							modelHistory: this.currentModelMetrics,
						},
						data: {
							testData,
							columns: newColumns,
						}
					});
				},
				onTrainEnd: () => {
					const layers = getLayers(model);
					// Dispose Tensors
					features.dispose();
					target.dispose();

					const { testData, newColumns } = this.getTestData(data, preparedData.testIndices ?? [], columns, trainConfig);

					this.notifyStateUpdate({
						training: {
							transcurredEpochs: this.transcurredEpochs,
							loss: this.currentTotalLoss,
							accuracy: this.currentTotalAccuracy,
							modelHistory: this.currentModelMetrics,
						},
						model: {
							completed: true,
							trainig: false,
						},
						data: {
							testData,
							columns: newColumns,
						}
					});
				}
			}
		});
	}

	getTestData(data: any[], testIndices: number[], columns: Column[], trainConfig: TrainConfig) {
		// Create deep copy of data to avoid mutations
		const copyData: any[] = JSON.parse(JSON.stringify(data));
		
		// Get test data subset based on indices
		const testData = copyData.filter((_, index) => testIndices?.includes(index));
		const targetColumn = trainConfig.dataPreparationConfig.targetColumn;

		// Extract test outputs and remove target column from test data
		const testInputs = testData.map(row => {
			const rowCopy = {...row};
			delete rowCopy[targetColumn];
			return Object.values(rowCopy);
		});

		// Get predictions
		const { predictionsArray, mappedOutputs } = this.predict(testInputs);
		const predictionsToLabels = predictionsArray.map(prediction => mappedOutputs?.[prediction]);

		// Add predictions column to data
		const newTestData = testData.map((row, index) => ({
			...row,
			prediction: predictionsToLabels[index]
		}));

		// Add prediction column definition
		const newColumns = [
			...columns,
			{
				accessor: "prediction",
				Header: "prediction",
				dtype: "string",
				width: 100
			}
		];

		return { testData: newTestData, newColumns };
	}

	transformToTensor(inputs: any[], outputs: any[], outputsNumber: number, lastLayerShape: number) {
		return this.tf.tidy(() => {
			let result = {}
			// Step 1. Shuffle the data
			this.tf.util.shuffleCombo(inputs, outputs)
			// Step 2. Convert data to Tensor
			const inputsTensor = this.tf.tensor2d(inputs)

			if (outputsNumber === 1) {
				const outputTensor = this.tf.tensor2d(outputs, [outputs.length, 1])
				result = {
					inputsTensor: inputsTensor,
					outputsTensor: outputTensor,
				}
			} else if (outputsNumber === 2 && lastLayerShape === 1) {
				// Binary classification case, outputs are 0 or 1
				const outputsTensor = this.tf.tensor1d(outputs, 'int32')
				result = { inputsTensor, outputsTensor }
			} else {
				const outputsTensor = this.tf.tensor2d(outputs)
				result = { inputsTensor, outputsTensor }
			}
			return result
		})
	}

	prepareData(data: any[], columns: Column[], dataPreparationConfig: DataPreparationConfig, lastLayerShape: number): PrepareDataResult {
		const targetColumn = columns.find(column => column.accessor === dataPreparationConfig.targetColumn);
		// Features are all columns except the target column and disabled columns
		const dataPreparationMetadata = {} as DataPreparationMetadata;
		const featuresColumns = columns.filter(column => column.accessor !== dataPreparationConfig.targetColumn && !dataPreparationConfig.disabledColumns.includes(column.accessor));
		const { testIndices, trainIndices } = this.trainTestSplit(data, columns, dataPreparationConfig);
		const trainData = data.filter((_, index) => trainIndices.includes(index));
		// Separate data into inputs and outputs, inputs are all columns except the target column
		const inputs: any[][] = [];
		trainData.forEach(row => {
			const input = featuresColumns.map(column => row[column.accessor]);
			inputs.push(input);
		});
		let outputs: any[] = [];
		trainData.forEach(row => {
			const output = targetColumn?.accessor ? row[targetColumn.accessor] : null;
			outputs.push(output);
		});
		const mappedOutputs: Record<number, string> = {};
		// Encode target if target is a string
		if (dataPreparationConfig.uniqueTargetValues.length > 0) {
			// Map target values to indices
			dataPreparationConfig.uniqueTargetValues.forEach((value, index) => {
				mappedOutputs[index] = value;
			});
			outputs = outputs.map(output => Object.keys(mappedOutputs).find(key => mappedOutputs[+key] === output));
			dataPreparationMetadata.mappedOutputs = mappedOutputs;
		}
		const { inputsTensor, outputsTensor } = this.transformToTensor(inputs, outputs, dataPreparationConfig.outputsNumber, lastLayerShape);

		// Normalize inputs with min max scaler
		// const normalizedInputs = this.tf.tidy(() => {
		// 	const min = this.tf.min(inputsTensor);
		// 	const max = this.tf.max(inputsTensor);
		// 	return this.tf.tidy(() => this.tf.div(this.tf.sub(inputsTensor, min), this.tf.sub(max, min)));
		// });
		// Normalize inputs with z-score
		// const normalizedInputs = this.tf.tidy(() => {
		// 	const mean = this.tf.mean(inputsTensor);
		// 	// Calculate standard deviation, tf.std does not exist
		// 	const std = this.tf.tidy(() => this.tf.sqrt(this.tf.mean(this.tf.square(this.tf.sub(inputsTensor, mean)))));
		// 	return this.tf.tidy(() => this.tf.div(this.tf.sub(inputsTensor, mean), std));
		// });

		// Show first 10 rows of normalized inputs and first 10 rows of inputs as numbers not tensors
		// console.log({ normalizedInputs: normalizedInputs.slice(0, 10).arraySync(), inputs: inputsTensor.slice(0, 10).arraySync() })

		return { features: inputsTensor, target: outputsTensor, outputsNumber: dataPreparationConfig.outputsNumber, testIndices, trainIndices, dataPreparationMetadata };
	}

	predict(inputs: any[]) {
		if (!this.currentModel) {
			throw new Error("Model not trained");
		}
		let predictionsArray: number[] = [];
		const inputsTensor = this.tf.tensor2d(inputs);
		const predictions = this.currentModel.predict(inputsTensor) as Tensor;
		const lastLayerShape = this.currentModel.layers[this.currentModel.layers.length - 1].outputShape[1];
		const isBinaryClassification = lastLayerShape === 1;
		if (!isBinaryClassification) {
			predictionsArray = predictions.argMax(1).arraySync() as number[];
		} else {
			const predArray = predictions.arraySync() as number[][];
			predictionsArray = predArray.map((prediction) => prediction[0] > 0.5 ? 1 : 0);
		}
		inputsTensor.dispose();
		predictions.dispose();

		return { predictionsArray, mappedOutputs: this.dataPreparationMetadata.mappedOutputs };
	}

	createModel(config: ModelConfig) {
		try {
			if (this.currentModel) {
				this.currentModel.dispose();
			}
			this.currentModelMetrics = [];
			this.currentTotalLoss = 0;
			this.currentTotalAccuracy = 0;
			this.transcurredEpochs = 0;


			const model = this.tf.sequential();
			const lastLayerActivation = config.problemType === "classification" ? config.neuronsPerLayer[config.neuronsPerLayer.length - 1] === 1 ? "sigmoid" : "softmax" : null;
			config.neuronsPerLayer.forEach((neurons, index) => {
				const isLastLayer = index === config.neuronsPerLayer.length - 1;
				const isFirstLayer = index === 0;
				const layerConfig = {
					units: neurons,
					activation: isLastLayer ? config.problemType === "classification" ? lastLayerActivation : null : config.activationFunction,
					inputShape: isFirstLayer ? [config.inputSize] : null,
					kernelInitializer: config.kernelInitializer,
					name: `layer_${index}`,
					kernelRegularizer: !isLastLayer ? getKernelRegularizer(this.tf, config.regularization, config.regularizationRate) : null,
				}
				model.add(this.tf.layers.dense(layerConfig));
			});
			console.log("Model structure created.");
			if (config.compileOptions) {
				const opt = this.tf.train[config.compileOptions.optimizer](config.compileOptions.learningRate);
				model.compile({
					optimizer: opt,
					loss: config.compileOptions.lossFunction,
					metrics: config.compileOptions.metrics,
				});
			}
			model.summary();
			this.currentModel = model;
			return model;
		} catch (error) {
			console.error("Error creating model:", error);
			throw error;
		}
	}

	async initialize() {
		if (!this.tf) {
			await loadModules({
				tf: import("@tensorflow/tfjs"),
				wasm: import("@tensorflow/tfjs-backend-wasm"),
			}, this);
			setWasmPaths(
				"https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/wasm-out/"
			);
			await this.tf.ready();
			await this.tf.setBackend("wasm")
			console.log(this.tf.getBackend())
		}
	}

}
