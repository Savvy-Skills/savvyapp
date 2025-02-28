import { Colors } from "@/constants/Colors";
import { NeuronConfig } from "@/types";
import { ViewStyle } from "react-native";
// Activation functions
const activationFunctions = {
	sigmoid: (z: number) => 1 / (1 + Math.exp(-z)),
	tanh: (z: number) => Math.tanh(z),
	relu: (z: number) => Math.max(0, z),
	leakyRelu: (z: number) => z > 0 ? z : 0.01 * z
};
export type ActivationFunction = keyof typeof activationFunctions;

// Function to calculate z-value (neuron output) for a given point
const calculateNeuronOutput = (x: number, y: number, w1: number, w2: number, bias: number, activationFn: ActivationFunction) => {
	const z = w1 * x + w2 * y + bias;
	return activationFunctions[activationFn](z);
};

// Function to generate heatmap data based on weights and bias
const generateHeatmapData = (w1: number, w2: number, bias: number, activationFn: ActivationFunction, colorScaleValues: any, config: NeuronConfig) => {
	const resolution = 50; // Number of points along each axis
	const x1Min = 0;
	const x1Max = 100;
	const x2Min = 0;
	const x2Max = 100;

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

			// Convert percentages to the model's scale (-1 to 1)
			const scaledX1 = (x1 / 50) - 1; // Scale 0-100 to -1 to 1
			const scaledX2 = (x2 / 50) - 1; // Scale 0-100 to -1 to 1

			// Compute the weighted sum z using scaled values
			const z = w1 * scaledX1 + w2 * scaledX2 + bias;

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
		showscale: false,
		colorbar: {
			titleside: 'right',
			titlefont: {
				size: 14,
				color: Colors.text
			},
			tickmode: 'array',
			tickvals: [zmin, 0, zmax],
			ticktext: [config.classes.negative.value, config.classes.neutral.value, config.classes.positive.value],
			tickfont: {
				size: 10,
				color: Colors.text,
				family: "Poppins"
			},
			thickness: 15
		}
	};
};

// Function to generate scatter trace with neuron outputs
const generateScatterTrace = (points: Array<{ x: number, y: number, result: string }>, w1: number, w2: number, bias: number, activationFn: ActivationFunction, X_AXIS_NAME: string, Y_AXIS_NAME: string, config: NeuronConfig) => {
	// Calculate output for each point
	const outputs = points.map(point => {
		// Convert percentages to the model's scale
		const scaledX = (point.x / 50) - 1; // Scale 0-100 to -1 to 1
		const scaledY = (point.y / 50) - 1; // Scale 0-100 to -1 to 1

		return calculateNeuronOutput(scaledX, scaledY, w1, w2, bias, activationFn);
	});

	// Create colors based on output values
	const outputColors = outputs.map(output => {
		// Map the output value to a position on our color scale
		if (output < 0) {
			return config.classes.negative.color;
		} else if (output > 0) {
			return config.classes.positive.color;
		} else {
			// Linear interpolation between white and orange
			return Colors.whiteText;
		}
	});

	// Create class and probability text
	const classNames = outputs.map(output => {
		return output < 0 ? config.classes.negative.value : output > 0 ? config.classes.positive.value : config.classes.neutral.value;
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

	// Create combined custom data with both probability and expected class
	const customData = points.map((point, index) => {
		const probability = probabilities[index];
		const confidenceLabel = getConfidenceLabel(probability);
		
		return [probability, point.result, confidenceLabel];
	});

	return {
		x: points.map(p => p.x), // Use original 0-100% values
		y: points.map(p => p.y), // Use original 0-100% values
		mode: 'markers',
		type: 'scatter',
		marker: {
			size: 10,
			color: outputColors,
			line: {
				color: "rgba(0, 0, 0, 0.3)",
				width: 1
			}
		},
		text: classNames,
		customdata: customData,
		hovertemplate: `<b>${X_AXIS_NAME}</b>: %{x:.0f}%,  <b>${Y_AXIS_NAME}</b>: %{y:.0f}%<br>` +
			'<b>Expected Class</b>: %{customdata[1]}<br>' +
			'<b>Predicted Class</b>: %{text}<br>' +
			'<b>Probability</b>: %{customdata[0]} (%{customdata[2]})<extra></extra>'
	};
};

// Helper function to interpret probability percentages
const getConfidenceLabel = (probabilityString: string): string => {
	// Extract numeric value from percentage string (e.g., "75%" -> 75)
	const probability = parseInt(probabilityString.replace('%', ''));
	
	if (probability >= 90) return "Certain";
	if (probability >= 75) return "Very Likely";
	if (probability >= 50) return "Likely";
	if (probability >= 25) return "Somewhat Likely";
	if (probability > 0) return "Unlikely";
	return "Undecided";
};

// Function to generate the expected class trace (larger circles behind the data points)
const generateExpectedClassTrace = (points: Array<{ x: number, y: number, result: string }>, config: NeuronConfig) => {
	// Map results to colors
	const resultColors = points.map(point => {
		if (point.result === config.classes.positive.value) {
			return config.classes.positive.color;
		} else if (point.result === config.classes.negative.value) {
			return config.classes.negative.color;
		} else {
			return Colors.whiteText;
		}
	});

	return {
		x: points.map(p => p.x),
		y: points.map(p => p.y),
		mode: 'markers',
		type: 'scatter',
		marker: {
			size: 18, // Larger than the prediction markers
			color: resultColors,
			opacity: 0.7, // Slightly transparent
			line: {
				color: 'rgba(0, 0, 0, 0.3)',
				width: 1
			}
		},
		hoverinfo: 'none', // Don't show hover for these points
		showlegend: false
	};
};

// Helper function to get weight indicator style
const getWeightIndicatorStyle: (weight: number) => ViewStyle = (weight: number) => {
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
};

// New function to calculate the container width based on weight
const getIndicatorContainerWidth = (weight: number, maxWeightWidth: number) => {
	// Calculate the width based on absolute weight value (4 when 0, MAX_WEIGHT_WIDTH when 1)
	const minWidth = 4;
	const calculatedWidth = minWidth + (Math.abs(weight) * (maxWeightWidth - minWidth));
	return {
		maxWidth: calculatedWidth,
	};
};

export { generateHeatmapData, generateScatterTrace, generateExpectedClassTrace, calculateNeuronOutput, getWeightIndicatorStyle, getIndicatorContainerWidth };