import { Tensor } from "@tensorflow/tfjs";
import { DatasetInfo } from ".";

export type LayerType = "input" | "hidden" | "output" | null;

export const dtypeMap = {
	"number": "numeric",
	"string": "text",
	"boolean": "toggle",
	"object": "toggle",
};

export interface NeuralNetworkVisualizerProps {
	initialNNState?: NNState;
	dataset_info: DatasetInfo;
	index: number;
}

export interface NNState {
	modelConfig?: ModelConfig;
	trainingConfig?: TrainConfig;
}


export interface PrepareDataResult {
	features: Tensor;
	target: Tensor;
	outputsNumber: number;
	testIndices?: number[];
	trainIndices?: number[];
	dataPreparationMetadata?: DataPreparationMetadata;
}

export interface DataPreparationMetadata {
	mappedOutputs?: Record<number, string>;
}
export interface ModelConfig {
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
		metrics: string;
	}
	inputSize: number;
}

export interface TrainConfig {
	batchSize: number;
	epochs: number;
	shuffle: boolean;
	validationSplit: number;
	dataPreparationConfig: DataPreparationConfig;
}

export interface DataPreparationConfig {
	targetColumn: string;
	disabledColumns: string[];
	outputsNumber: number;
	uniqueTargetValues: string[];
	testSize: number;
	stratify?: boolean;
}