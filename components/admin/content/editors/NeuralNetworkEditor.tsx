import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { ContentInfo } from '@/types/index';
import ModelConfigEditor from './neuralnetwork/ModelConfigEditor';
import TrainingConfigEditor from './neuralnetwork/TrainingConfigEditor';
import DataPreparationEditor from './neuralnetwork/DataPreparationEditor';
import VisualizationConfigEditor from './neuralnetwork/VisualizationConfigEditor';
import { DataPreparationConfig, ModelConfig, NNConfig, NNState, Trace, TrainConfig } from '@/types/neuralnetwork';
import { TraceConfig } from '@/components/data/DataVisualizerPlotly';

// Default configuration for a new neural network
const DEFAULT_NN_CONFIG: NNConfig = {
	modelConfig: {
		inputSize: 2,
		problemType: 'classification',
		lastLayerSize: 1,
		compileOptions: {
			metrics: 'acc',
			optimizer: 'adam',
			learningRate: 0.01,
			lossFunction: 'binaryCrossentropy'
		},
		neuronsPerLayer: [4, 2, 2],
		activationFunction: 'relu'
	},
	initialTraces: [{
		x: 'x',
		y: 'y',
		name: 'X vs Y',
		type: 'scatter',
		groupBy: 'label'
	}],
	trainingConfig: {
		epochs: 50,
		shuffle: true,
		batchSize: 32,
		validationSplit: 0.2,
		dataPreparationConfig: {
			stratify: true,
			testSize: 0.2,
			targetConfig: {
				field: 'label',
				encoding: 'label'
			},
			featureConfig: [
				{
					field: 'x',
					encoding: 'none',
					normalization: 'none'
				},
				{
					field: 'y',
					encoding: 'none',
					normalization: 'none'
				}
			]
		}
	},
	predictionTraces: [{
		x: 'x',
		y: 'y',
		name: 'X vs Y',
		type: 'scatter',
		groupBy: 'prediction'
	}]
};

interface NeuralNetworkEditorProps {
	content?: ContentInfo;
	onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function NeuralNetworkEditor({ content, onContentChange }: NeuralNetworkEditorProps) {
	// Initialize state with content or default values
	const [config, setConfig] = useState<NNState>(
		(content?.state?.nnState as NNState) || DEFAULT_NN_CONFIG
	);
	const [activeTab, setActiveTab] = useState<'model' | 'training' | 'data' | 'visualization'>('model');

	// Helper function to update specific parts of the config
	const updateConfig = (newConfig: NNState) => {
		setConfig(newConfig);
		onContentChange({
			type: 'Tool',
			subtype: 'Neural Network',
			state: { nnState: newConfig }
		});
	};

	return (
		<View style={styles.container}>
			<Card style={styles.headerCard}>
				<Card.Title title="Neural Network Configuration" />
				<Card.Content>
					<Text variant="bodyMedium">
						Configure your neural network model, training parameters, and visualization options.
					</Text>
				</Card.Content>
			</Card>

			<SegmentedButtons
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as 'model' | 'training' | 'data' | 'visualization')}
				buttons={[
					{ value: 'model', label: 'Architecture', icon: 'brain' },
					{ value: 'training', label: 'Training', icon: 'cog-outline' },
					{ value: 'data', label: 'Data Prep', icon: 'database' },
					{ value: 'visualization', label: 'Visualization', icon: 'chart-scatter-plot' }
				]}
				style={styles.tabButtons}
			/>

			<ScrollView style={styles.contentContainer}>
				{activeTab === 'model' && (
					<ModelConfigEditor
						modelConfig={config.modelConfig as ModelConfig}
						onChange={(modelConfig) => updateConfig({ ...config, modelConfig })}
					/>
				)}

				{activeTab === 'training' && (
					<TrainingConfigEditor
						trainingConfig={config.trainingConfig as TrainConfig}
						onChange={(trainingConfig) => updateConfig({ ...config, trainingConfig })}
					/>
				)}

				{activeTab === 'data' && (
					<DataPreparationEditor
						dataPreparationConfig={config.trainingConfig?.dataPreparationConfig as DataPreparationConfig}
						onChange={(dataPreparationConfig) => {
							const newConfig = { ...config };
							if (newConfig.trainingConfig) {
								newConfig.trainingConfig.dataPreparationConfig = dataPreparationConfig;
							}
							updateConfig(newConfig);
						}}
					/>
				)}

				{activeTab === 'visualization' && (
					<VisualizationConfigEditor
						initialTraces={config.initialTraces as Trace[]}
						predictionTraces={config.predictionTraces as Trace[]}
						onChange={(traces) => {
							updateConfig({
								...config,
								initialTraces: traces.initialTraces as TraceConfig[],
								predictionTraces: traces.predictionTraces as TraceConfig[]
							});
						}}
					/>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	headerCard: {
		marginBottom: 16,
	},
	tabButtons: {
		marginBottom: 16,
	},
	contentContainer: {
		maxHeight: 600,
	}
});

//EXAMPLES:
// {
// 	"modelConfig": {
// 	  "inputSize": 2,
// 	  "problemType": "classification",
// 	  "lastLayerSize": 1,
// 	  "compileOptions": {
// 		"metrics": "acc",
// 		"optimizer": "adam",
// 		"learningRate": 0.01,
// 		"lossFunction": "binaryCrossentropy"
// 	  },
// 	  "neuronsPerLayer": [
// 		4,
// 		2,
// 		2
// 	  ],
// 	  "activationFunction": "relu"
// 	},
// 	"initialTraces": [
// 	  {
// 		"x": "x",
// 		"y": "y",
// 		"name": "X vs Y",
// 		"type": "scatter",
// 		"groupBy": "label"
// 	  }
// 	],
// 	"trainingConfig": {
// 	  "epochs": 50,
// 	  "shuffle": true,
// 	  "batchSize": 32,
// 	  "validationSplit": 0.2,
// 	  "dataPreparationConfig": {
// 		"stratify": true,
// 		"testSize": 0.2,
// 		"targetConfig": {
// 		  "field": "label",
// 		  "encoding": "label"
// 		},
// 		"featureConfig": [
// 		  {
// 			"field": "x",
// 			"encoding": "none",
// 			"normalization": "none"
// 		  },
// 		  {
// 			"field": "y",
// 			"encoding": "none",
// 			"normalization": "none"
// 		  }
// 		]
// 	  }
// 	},
// 	"predictionTraces": [
// 	  {
// 		"x": "x",
// 		"y": "y",
// 		"name": "X vs Y",
// 		"type": "scatter",
// 		"groupBy": "prediction"
// 	  }
// 	]
//   }

//   {
// 	"modelConfig": {
// 	  "inputSize": 2,
// 	  "problemType": "classification",
// 	  "lastLayerSize": 1,
// 	  "compileOptions": {
// 		"metrics": "acc",
// 		"optimizer": "adam",
// 		"learningRate": 0.01,
// 		"lossFunction": "binaryCrossentropy"
// 	  },
// 	  "neuronsPerLayer": [
// 		4,
// 		2,
// 		2
// 	  ],
// 	  "activationFunction": "relu"
// 	},
// 	"initialTraces": [
// 	  {
// 		"x": "X",
// 		"y": "Y",
// 		"name": "X vs Y",
// 		"type": "scatter",
// 		"groupBy": "Label"
// 	  }
// 	],
// 	"trainingConfig": {
// 	  "epochs": 50,
// 	  "shuffle": true,
// 	  "batchSize": 32,
// 	  "validationSplit": 0.2,
// 	  "dataPreparationConfig": {
// 		"stratify": true,
// 		"testSize": 0.2,
// 		"targetConfig": {
// 		  "field": "Label",
// 		  "encoding": "label"
// 		},
// 		"featureConfig": [
// 		  {
// 			"field": "X",
// 			"encoding": "none",
// 			"normalization": "none"
// 		  },
// 		  {
// 			"field": "Y",
// 			"encoding": "none",
// 			"normalization": "none"
// 		  }
// 		]
// 	  }
// 	},
// 	"predictionTraces": [
// 	  {
// 		"x": "X",
// 		"y": "Y",
// 		"name": "X vs Y",
// 		"type": "scatter",
// 		"groupBy": "prediction"
// 	  }
// 	]
//   }

//   {
// 	"modelConfig": {
// 	  "inputSize": 1,
// 	  "problemType": "regression",
// 	  "lastLayerSize": 1,
// 	  "compileOptions": {
// 		"metrics": "mse",
// 		"optimizer": "adam",
// 		"learningRate": 0.01,
// 		"lossFunction": "meanSquaredError"
// 	  },
// 	  "neuronsPerLayer": [
// 		4,
// 		2,
// 		1
// 	  ],
// 	  "activationFunction": "relu"
// 	},
// 	"initialTraces": [
// 	  {
// 		"x": "horsepower",
// 		"y": "mpg",
// 		"name": "Horsepower vs MPG",
// 		"type": "scatter"
// 	  }
// 	],
// 	"trainingConfig": {
// 	  "epochs": 50,
// 	  "shuffle": true,
// 	  "batchSize": 16,
// 	  "validationSplit": 0.2,
// 	  "dataPreparationConfig": {
// 		"stratify": false,
// 		"testSize": 0.2,
// 		"targetConfig": {
// 		  "field": "mpg",
// 		  "encoding": "none",
// 		  "normalization": "minmax"
// 		},
// 		"featureConfig": [
// 		  {
// 			"field": "horsepower",
// 			"encoding": "none",
// 			"normalization": "minmax"
// 		  }
// 		]
// 	  }
// 	},
// 	"predictionTraces": [
// 	  {
// 		"x": "horsepower",
// 		"y": "prediction",
// 		"name": "Horsepower vs Prediction",
// 		"type": "scatter"
// 	  }
// 	]
//   }