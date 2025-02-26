import React, { lazy, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { Text, Icon, Surface, DataTable } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';
import { Config, Layout } from 'plotly.js';
import { generateColors } from '@/utils/utilfunctions';

let DataPlotter = lazy(() => import("@/components/data/DataPlotter"));

// Constants for axis names
const X_AXIS_NAME = "Pending Work";
const Y_AXIS_NAME = "Sunny Weather";

const CLASS0 = "Undecided"
const CLASS1 = "Going Out!"
const CLASS2 = "Not Going!"
// Activation functions
const activationFunctions = {
	sigmoid: (z: number) => 1 / (1 + Math.exp(-z)),
	tanh: (z: number) => Math.tanh(z),
	relu: (z: number) => Math.max(0, z),
	leakyRelu: (z: number) => z > 0 ? z : 0.01 * z
};

type ActivationFunction = keyof typeof activationFunctions;

const baseLayout: Partial<Layout> = {
	showlegend: false,
	hovermode: "closest",
	autosize: true,
	plot_bgcolor: "transparent",
	paper_bgcolor: "transparent",
	xaxis: {
		fixedrange: true,
		range: [-2.5, 2.5],
		title: X_AXIS_NAME
	},
	yaxis: {
		fixedrange: true,
		range: [-2.5, 2.5],
		title: Y_AXIS_NAME
	},
	margin: { t: 10, b: 60, l: 60, r: 40 },
	height: 400,
};

const baseConfig: Partial<Config> = {
	responsive: true,
	displayModeBar: false,
};

const colorScaleValues = [
	[0, Colors.primaryLighter],
	[0.5, "#eeeeee"],
	[1, Colors.lightOrange]
];

// Function to generate random data points
const generateRandomDataPoints = (count: number, range: number = 2.5) => {
	const points = [];
	for (let i = 0; i < count; i++) {
		points.push({
			x: (Math.random() * 2 * range) - range,
			y: (Math.random() * 2 * range) - range
		});
	}
	return points;
};

// Function to calculate z-value (neuron output) for a given point
const calculateNeuronOutput = (x: number, y: number, w1: number, w2: number, bias: number, activationFn: ActivationFunction) => {
	const z = w1 * x + w2 * y + bias;
	return activationFunctions[activationFn](z);
};

// Function to generate heatmap data based on weights and bias
const generateHeatmapData = (w1: number, w2: number, bias: number, activationFn: ActivationFunction) => {
	const resolution = 50; // Number of points along each axis
	const x1Min = -2.5;
	const x1Max = 2.5;
	const x2Min = -2.5;
	const x2Max = 2.5;

	// Generate arrays of x1 and x2 values
	const x1Values = [];
	const x2Values = [];
	const step1 = (x1Max - x1Min) / (resolution - 1);
	const step2 = (x2Max - x2Min) / (resolution - 1);

	for (let i = 0; i < resolution; i++) {
		x1Values.push(x1Min + step1 * i);
		x2Values.push(x2Min + step2 * i);
	}

	// Initialize a 2D array to store outputs
	const outputMatrix = [];

	// Calculate activation function
	const activation = activationFunctions[activationFn];

	// Loop through each x2 (rows)
	for (let i = 0; i < x2Values.length; i++) {
		const row = [];
		const x2 = x2Values[i];

		// Loop through each x1 (columns)
		for (let j = 0; j < x1Values.length; j++) {
			const x1 = x1Values[j];

			// Compute the weighted sum z
			const z = w1 * x1 + w2 * x2 + bias;

			// Apply the activation function
			const a = activation(z);

			row.push(a);
		}
		outputMatrix.push(row);
	}

	// Get appropriate z range based on activation function
	let zmin, zmax;
	switch (activationFn) {
		case 'sigmoid':
			zmin = 0;
			zmax = 1;
			break;
		case 'tanh':
			zmin = -1;
			zmax = 1;
			break;
		case 'relu':
		case 'leakyRelu':
			// For ReLU and Leaky ReLU, we'll use a fixed range that works well visually
			zmin = -0.5;
			zmax = 2;
			break;
		default:
			zmin = 0;
			zmax = 1;
	}

	return {
		x: x1Values,
		y: x2Values,
		z: outputMatrix,
		type: 'heatmap',
		colorscale: colorScaleValues,
		autocolorscale: false,
		zmin: zmin,
		zmax: zmax,
		hoverinfo: 'none',
		showscale: true,
		colorbar: {
			titleside: 'right',
			titlefont: {
				size: 14,
				color: Colors.text
			},
			tickmode: 'array',
			tickvals: [zmin, 0, zmax],
			ticktext: [CLASS2, CLASS0, CLASS1],
			tickfont: {
				size: 10,
				color: Colors.text
			},
			thickness: 15
		}
	};
};

// Function to generate scatter trace with neuron outputs
const generateScatterTrace = (points: Array<{ x: number, y: number }>, w1: number, w2: number, bias: number, activationFn: ActivationFunction) => {
	// Calculate output for each point
	const outputs = points.map(point =>
		calculateNeuronOutput(point.x, point.y, w1, w2, bias, activationFn)
	);

	// Create colors based on output values
	const outputColors = outputs.map(output => {
		// Map the output value to a position on our color scale
		if (output < 0) {
			return Colors.primaryLighter;
		} else if (output > 0) {
			return Colors.lightOrange;
		} else {
			// Linear interpolation between white and orange
			return Colors.whiteText;
		}
	});

	// Create class and probability text
	const classNames = outputs.map(output => {
		return output < 0 ? CLASS2 : output > 0 ? CLASS1 : CLASS0;
	});

	const probabilities = outputs.map(output => {
		if (output < 0) {
			// Class2, cap probability at 1
			return (Math.min(Math.abs(output), 1) * 100).toFixed(0) + '%';
		} else if (output > 0) {
			// Class1, cap probability at 1
			return (Math.min(output, 1) * 100).toFixed(0) + '%';
		} else {
			// Zero value
			return '0%';
		}
	});

	return {
		x: points.map(p => p.x),
		y: points.map(p => p.y),
		mode: 'markers',
		type: 'scatter',
		marker: {
			size: 10,
			color: outputColors,
			line: {
				color: Colors.primary,
				width: 1
			}
		},
		text: classNames,
		customdata: probabilities,
		hovertemplate: `<b>X</b>: %{x:.2f},  <b>Y</b>: %{y:.2f}<br>` +
			'<b>Class</b>: %{text}<br>' +
			'<b>Probability</b>: %{customdata}<extra></extra>'
	};
};
// Custom dataset with meaningful points
const customDataPoints = [
	{ x: -2.0, y: 2.0, result: CLASS1 },    // Ahead on work, great weather → Going Out!
	{ x: 0.0, y: 1.5, result: CLASS1 },     // No work, good weather → Going Out!
	{ x: 1.0, y: 0, result: CLASS2 },     // Some work, weather is not enough
	{ x: 0.0, y: -1.5, result: CLASS2 },     // No work, bad weather → Not Going!
	{ x: -1.0, y: 0.5, result: CLASS1 },     // Ahead on work, weather is ENOUGH!
	{ x: 1.0, y: 1, result: CLASS2 },     // Some work, weather is not enough
];

const MAX_WEIGHT_WIDTH = 30;

const NeuronVisualization = () => {
	// State for weights and bias
	const [weight1, setWeight1] = useState(0);
	const [weight2, setWeight2] = useState(0);
	const [bias, setBias] = useState(0);
	const [activationFn, setActivationFn] = useState<ActivationFunction>('tanh');

	// Create random data points (memoized to prevent regeneration on every render)
	const dataPoints = useMemo(() => customDataPoints, []);

	// Generate heatmap data
	const heatmapTrace = useMemo(() => {
		return generateHeatmapData(weight1, weight2, bias, activationFn);
	}, [weight1, weight2, bias, activationFn]);

	// Generate scatter trace
	const scatterTrace = useMemo(() => {
		return generateScatterTrace(dataPoints, weight1, weight2, bias, activationFn);
	}, [dataPoints, weight1, weight2, bias, activationFn]);

	// Create array of traces (heatmap first, then scatter so it appears on top)
	const traces = useMemo(() => [heatmapTrace, scatterTrace], [heatmapTrace, scatterTrace]);

	// Button to switch between activation functions
	const toggleActivationFunction = useCallback(() => {
		const activationTypes: ActivationFunction[] = ['sigmoid', 'tanh', 'relu', 'leakyRelu'];
		const currentIndex = activationTypes.indexOf(activationFn);
		const nextIndex = (currentIndex + 1) % activationTypes.length;
		setActivationFn(activationTypes[nextIndex]);
	}, [activationFn, setActivationFn]);

	// Get display name for current activation function
	const getActivationDisplayName = () => {
		switch (activationFn) {
			case 'sigmoid': return 'Sigmoid';
			case 'tanh': return 'Tanh';
			case 'relu': return 'ReLU';
			case 'leakyRelu': return 'Leaky ReLU';
			default: return 'Unknown';
		}
	};

	// Helper function to get weight indicator style
	const getWeightIndicatorStyle: (weight: number) => ViewStyle = useCallback((weight: number) => {
		// Determine background color based on sign
		const backgroundColor = weight === 0 ? Colors.revealed : weight > 0 ? Colors.primary : Colors.error;

		// Determine direction (for negative weights, align right)
		const alignSelf = weight >= 0 ? 'flex-start' : 'flex-end';

		return {
			flex: 1,
			width: "100%",
			backgroundColor,
			alignSelf,
		};
	}, []);

	// New function to calculate the container width based on weight
	const getIndicatorContainerWidth = useCallback((weight: number) => {
		// Calculate the width based on absolute weight value (4 when 0, MAX_WEIGHT_WIDTH when 1)
		const minWidth = 4;
		const calculatedWidth = minWidth + (Math.abs(weight) * (MAX_WEIGHT_WIDTH - minWidth));
		return {
			maxWidth: calculatedWidth,
		};
	}, []);

	// Calculate current predictions for all data points
	const predictions = useMemo(() => {
		return customDataPoints.map(point => {
			const output = calculateNeuronOutput(point.x, point.y, weight1, weight2, bias, activationFn);
			const predictedClass = output < 0 ? CLASS2 : output > 0 ? CLASS1 : CLASS0;
			const probability = output < 0 
				? (Math.min(Math.abs(output), 1) * 100).toFixed(0) + '%'
				: output > 0 
					? (Math.min(output, 1) * 100).toFixed(0) + '%'
					: '0%';
			
			// Check if prediction matches expected result
			const isCorrect = predictedClass === point.result;
			
			return {
				coordinates: `(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`,
				expected: point.result,
				predicted: predictedClass,
				probability,
				isCorrect
			};
		});
	}, [weight1, weight2, bias, activationFn]);
	
	// Calculate accuracy
	const accuracy = useMemo(() => {
		const correctCount = predictions.filter(p => p.isCorrect).length;
		return ((correctCount / predictions.length) * 100).toFixed(0) + '%';
	}, [predictions]);

	return (
		<View style={styles.container}>
			{/* Weights Controls Row */}
			<View style={styles.weightsRow}>
				{/* Weight 1 Control with Indicator */}
				<View style={styles.weightControlContainer}>
					<Surface style={styles.weightControl}>
						<Text style={styles.weightIcon}>🗃️</Text>
						<Text style={styles.weightLabel}>{X_AXIS_NAME} Weight (w₁): {weight1.toFixed(1)}</Text>
						<Slider
							value={weight1}
							onValueChange={setWeight1}
							minimumValue={-1}
							maximumValue={1}
							step={0.1}
							style={styles.weightSlider}
							minimumTrackTintColor={Colors.primary}
							maximumTrackTintColor={Colors.primaryLighter}
						/>
					</Surface>
					<View style={[styles.weightIndicatorContainer, getIndicatorContainerWidth(weight1)]}>
						<View style={getWeightIndicatorStyle(weight1)} />
					</View>
				</View>

				{/* Weight 2 Control with Indicator */}
				<View style={styles.weightControlContainer}>
					<Surface style={styles.weightControl}>
						<Text style={styles.weightIcon}>🌞</Text>
						<Text style={styles.weightLabel}>{Y_AXIS_NAME} Weight (w₂): {weight2.toFixed(1)}</Text>
						<Slider
							value={weight2}
							onValueChange={setWeight2}
							minimumValue={-1}
							maximumValue={1}
							step={0.1}
							style={styles.weightSlider}
							minimumTrackTintColor={Colors.primary}
							maximumTrackTintColor={Colors.primaryLighter}
						/>
					</Surface>
					<View style={[styles.weightIndicatorContainer, getIndicatorContainerWidth(weight2)]}>
						<View style={getWeightIndicatorStyle(weight2)} />
					</View>
				</View>
			</View>

			{/* Plot (moved up to remove gap) */}
			<Surface style={styles.plotContainer}>
				<DataPlotter
					data={traces as any}
					layout={baseLayout}
					config={baseConfig}
					style={{}}
					onHover={() => { }}
					onPointClick={() => { }}
					dom={{ scrollEnabled: false }}
				/>
			</Surface>

			{/* Controls Card - now only has bias and activation function */}
			<Surface style={styles.controlsContainer}>
				{/* Bias */}
				<View style={styles.controlRow}>
					<Text style={styles.label}>Bias (b): {bias.toFixed(1)}</Text>
					<Slider
						value={bias}
						onValueChange={setBias}
						minimumValue={-5}
						maximumValue={5}
						step={0.1}
						style={styles.slider}
						minimumTrackTintColor={Colors.primary}
						maximumTrackTintColor={Colors.primaryLighter}
					/>
				</View>
			</Surface>

			{/* Results Comparison Table */}
			<Surface style={styles.tableContainer}>
				<Text style={styles.tableTitle}>Model Predictions (Accuracy: {accuracy})</Text>
				
				<DataTable>
					<DataTable.Header>
						<DataTable.Title>Coordinates</DataTable.Title>
						<DataTable.Title>Expected</DataTable.Title>
						<DataTable.Title>Predicted</DataTable.Title>
						<DataTable.Title numeric>Probability</DataTable.Title>
					</DataTable.Header>
					
					<ScrollView style={styles.tableScrollView}>
						{predictions.map((item, index) => (
							<DataTable.Row key={index} style={item.isCorrect ? styles.correctRow : styles.incorrectRow}>
								<DataTable.Cell>{item.coordinates}</DataTable.Cell>
								<DataTable.Cell>{item.expected}</DataTable.Cell>
								<DataTable.Cell>{item.predicted}</DataTable.Cell>
								<DataTable.Cell numeric>{item.probability}</DataTable.Cell>
							</DataTable.Row>
						))}
					</ScrollView>
				</DataTable>
			</Surface>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		maxWidth: 600,
		alignSelf: 'center',
		flexDirection: 'column',
		gap: 0, // Remove gap to tighten layout
		width: '100%',
		paddingHorizontal: 8,
	},
	weightIcon: {
		fontSize: 30,
	},
	weightsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
		marginBottom: 0, // Remove bottom margin
	},
	weightControlContainer: {
		maxWidth: 150,
		marginBottom: 0, // Remove bottom margin
	},
	weightControl: {
		width: '100%',
		alignItems: 'center',
		backgroundColor: 'white',
		padding: 12,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		borderBottomLeftRadius: 0, // Flat bottom for indicator
		borderBottomRightRadius: 0, // Flat bottom for indicator
		elevation: 2,
	},
	weightLabel: {
		fontWeight: 'bold',
		marginVertical: 4,
		textAlign: 'center',
		fontSize: 12,
	},
	weightSlider: {
		width: '100%',
		height: 30,
	},
	weightIndicatorContainer: {
		width: '100%',
		height: 40,
		backgroundColor: '#f0f0f0',
		overflow: 'hidden',
		alignSelf: 'center',
	},
	plotContainer: {
		height: 400,
		backgroundColor: 'white',
		borderRadius: 12,
		overflow: 'hidden',
		elevation: 3,
	},
	controlsContainer: {
		padding: 16,
		backgroundColor: 'white',
		borderRadius: 12,
		elevation: 3,
		marginVertical: 8,
	},
	controlRow: {
		marginBottom: 16,
	},
	label: {
		marginBottom: 8,
		fontWeight: 'bold',
	},
	slider: {
		width: '100%',
		height: 40,
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: Colors.primaryLighter,
		borderRadius: 8,
		overflow: 'hidden',
	},
	picker: {
		height: 50,
		width: '100%',
	},
	buttonContainer: {
		alignItems: 'center',
	},
	button: {
		backgroundColor: Colors.primary,
		color: 'white',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	tableContainer: {
		padding: 16,
		backgroundColor: 'white',
		borderRadius: 12,
		elevation: 3,
		marginVertical: 8,
	},
	tableTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 12,
		color: Colors.text,
		textAlign: 'center',
	},
	tableScrollView: {
		maxHeight: 200,
	},
	correctRow: {
		backgroundColor: generateColors(Colors.success, 0.2).muted
	},
	incorrectRow: {
		backgroundColor: generateColors(Colors.error, 0.2).muted
	},
});

export default NeuronVisualization;
