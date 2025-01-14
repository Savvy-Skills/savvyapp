import { data, Sequential } from "@tensorflow/tfjs";
import { loadModules } from "./utilfunctions";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import { Column } from "@/hooks/useDataFetch";

interface ModelConfig {
	neuronsPerLayer: number[];
	problemType: "classification" | "regression";
	activationFunction: "relu" | "sigmoid" | "tanh" | "softmax" | "linear";
	regularization?: "l1" | "l2" | "l1l2";
	regularizationRate?: number;
	kernelInitializer?: "glorotUniform" | "glorotNormal" | "heUniform" | "heNormal" | "leCunUniform" | "leCunNormal" | "ones" | "zeros" | "randomUniform" | "randomNormal" | "varianceScaling" | "orthogonal" | "identity" | "zeros" | "ones" | "randomUniform" | "randomNormal" | "varianceScaling" | "orthogonal" | "identity";
	compileOptions: {
		optimizer: "sgd" | "adam" | "rmsprop" | "adagrad" | "adadelta" | "adamax";
		learningRate: number;
		lossFunction: "meanSquaredError" | "binaryCrossentropy" | "categoricalCrossentropy";
		metrics: string[];
	}
	inputSize: number;
}

interface TrainConfig {
	batchSize: number;
	epochs: number;
	shuffle: boolean;
	validationSplit: number;
}

interface Feature {
	column: string;
	target: boolean
}

interface PrepareDataConfig {
	features: Feature[];
}



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

export class TFInstance {
	private static instance: TFInstance;
	tf: any;
	wasm: any;
	currentModel: Sequential | null;

	private constructor() {
		this.tf = null;
		this.wasm = null;
		this.currentModel = null;
	}

	static getInstance(): TFInstance {
		if (!TFInstance.instance) {
			TFInstance.instance = new TFInstance();
		}
		return TFInstance.instance;
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
		}
	}

	async debug(data: any[], columns: Column[]) {
		const mockConfig: ModelConfig = {
			neuronsPerLayer: [2, 2, 1],
			problemType: "classification",
			activationFunction: "relu",
			// regularization: "l1",
			// regularizationRate: 0.01,
			// kernelInitializer: "glorotUniform",
			compileOptions: {
				optimizer: "adam",
				learningRate: 0.01,
				lossFunction: "binaryCrossentropy",
				metrics: ["accuracy"],
			},
			inputSize: 2
		}
		const model = this.createModel(mockConfig);
		console.log({ data, columns })
	}

	async trainModel(model: Sequential, prepareData: any, trainConfig: TrainConfig) {
		const { batchSize, epochs, shuffle, validationSplit } = trainConfig;
		const { features, target, outputsNumber, testData, preparationMetadata } = prepareData;

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
	}

	async prepareData(data: any[], columns: any[]) { }

	createModel(config: ModelConfig) {
		try {
			const model = this.tf.sequential();
			const lastLayerActivation = config.problemType === "classification" ? config.neuronsPerLayer[config.neuronsPerLayer.length - 1] === 2 ? "sigmoid" : "softmax" : null;
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
			model.summary();
			if (config.compileOptions) {
				const opt = this.tf.train[config.compileOptions.optimizer](config.compileOptions.learningRate);
				model.compile({
					optimizer: opt,
					loss: config.compileOptions.lossFunction,
					metrics: config.compileOptions.metrics,
				});
			}

			return model;
		} catch (error) {
			console.error("Error creating model:", error);
			throw error;
		}
	}


}
