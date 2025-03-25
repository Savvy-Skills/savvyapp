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
	inputSize: number;
	problemType: 'classification' | 'regression';
	lastLayerSize: number;
	compileOptions: {
		metrics: string;
		optimizer: string;
		learningRate: number;
		lossFunction: string;
	};
	neuronsPerLayer: number[];
	activationFunction: 'relu' | 'sigmoid' | 'tanh';
}

export interface TrainConfig {
	batchSize: number;
	epochs: number;
	shuffle: boolean;
	validationSplit: number;
	dataPreparationConfig: DataPreparationConfig;
}

export interface DataPreparationConfig {
	stratify: boolean;
	testSize: number;
	targetConfig: {
		field: string;
		encoding: 'none' | 'label' | 'onehot';
	};
	featureConfig: FeatureConfig[];
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
	encoding: 'none' | 'label' | 'onehot';
	normalization: 'none' | 'minmax' | 'standard';
}

export interface Trace {
	x: string;
	y: string;
	name: string;
	type: 'scatter' | 'line' | 'bar';
	groupBy?: string;
}

export interface NNConfig {
	modelConfig: ModelConfig;
	trainingConfig: TrainingConfig;
	initialTraces: Trace[];
	predictionTraces: Trace[];
}