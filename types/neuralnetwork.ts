import { Tensor } from "@tensorflow/tfjs";
import { DatasetInfo } from ".";
import { TraceConfig } from "@/components/data/DataVisualizerPlotly";
import { Column } from "./table";

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
	initialTraces?: TraceConfig[];
	predictionTraces?: TraceConfig[];
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
	lastLayerSize: number;
}

export interface TrainConfig {
	batchSize: number;
	epochs: number;
	shuffle: boolean;
	validationSplit: number;
	dataPreparationConfig: DataPreparationConfig;
}

export interface DataPreparationConfig {
	testSize: number;
	stratify?: boolean;
	featureConfig: FeatureConfig[];
	targetConfig: FeatureConfig;
}

export interface ModelState {
	training: boolean;
	completed: boolean;
	paused: boolean;
	prediction: string | null;
}

export interface TrainingState {
	transcurredEpochs: number;
	loss: number;
	accuracy: number;
	modelHistory: any[];
}

export interface DataState {
	testData: any[];
	columns: Column[];
}

export interface TFState {
	model: ModelState;
	training: TrainingState;
	data: DataState;
}

export interface FeatureConfig {
	field: string;
	encoding: "oneHot" | "label" | "none";
	normalization?: "minmax" | "zscore" | "none";
	ordinalConfig?: string[];
}