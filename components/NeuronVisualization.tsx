import React, { lazy, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import VerticalSlider from 'rn-vertical-slider';
import { Colors } from '@/constants/Colors';
import { Config, Layout } from 'plotly.js';

let DataPlotter = lazy(() => import("@/components/data/DataPlotter"));

const baseLayout: Partial<Layout> = {
	showlegend: false,
	hovermode: "closest",
	autosize: true,
	plot_bgcolor: "transparent",
	paper_bgcolor: "transparent",
	xaxis: { fixedrange: true, range: [-2.5, 2.5] },
	yaxis: { fixedrange: true, range: [0, 1] },
	margin: { t: 10, b: 40, l: 40, r: 40 },
	height: 400,
};

const baseConfig: Partial<Config> = {
	responsive: true,
	displayModeBar: false,
};

const generateRandomDataPoints = (count: number) => {
	const points = [];
	for (let i = 0; i < count; i++) {
		points.push({
			x: (Math.random() * 5) - 2.5, // Random x between -2.5 and 2.5
			y: Math.random(), // Random y between 0 and 1
			class: Math.random() > 0.5 ? 1 : 0 // Random class (0 or 1)
		});
	}
	return points;
};

const generateGradientTraces = (input1: number, input2: number) => {
	const xValues = Array.from({ length: 100 }, (_, i) => i / 20 - 2.5);
	const pivotY = 0.5;
	const pivotX = 0;

	// Calculate y values based on weights
	const yValues = xValues.map(x => {
		if (input1 === 0 && input2 === 0) {
			return pivotY;
		} else if (input1 === input2) {
			return (x + 2.5) / 5;
		} else {
			return pivotY + ((input1 / (input2 + 0.0001)) * (x - pivotX));
		}
	});

	// Generate random data points

	return [
		// Gradient trace
		{
			x: xValues,
			y: yValues,
			type: 'scatter',
			mode: 'lines',
			fill: 'tozeroy',
			line: { color: Colors.primary },
			name: 'Gradient',
		},
		// Auxiliary trace
		{
			x: xValues,
			y: yValues.map(y => 1),
			type: 'scatter',
			mode: 'none',
			fill: 'tonexty',
			fillcolor: 'rgba(0, 0, 255, 0.1)',
			name: 'Auxiliary',
			hoverinfo: 'none',
		},

	];
};



const NeuronVisualization = () => {
	const [input1, setInput1] = useState(0);
	const [input2, setInput2] = useState(0);
	const threshold = 1.0; // You can adjust this threshold value

	// Calculate the sum of inputs
	const sum = input1 + input2;

	// Calculate the fill percentage (clamped between 0 and 1)
	const fillPercentage = Math.min(Math.max(sum / threshold, 0) / 2, 1);

	const handleInputChange = useCallback((value: number, index: number) => {
		if (index === 0) {
			setInput1(value);
		} else {
			setInput2(value);
		}
	}, [setInput1, setInput2]);

	const getBorderTopRadius = useCallback((value: number) => {
		return value >= 0.8 ? 5 : 0;
	}, []);

	const dataPointsTraces = useMemo(() => {
		const dataPoints = generateRandomDataPoints(10);
		return [{
			x: dataPoints.map(point => point.x),
			y: dataPoints.map(point => point.y),
			type: 'scatter',
			mode: 'markers',
			marker: {
				color: dataPoints.map(point => point.class === 1 ? Colors.success : Colors.error),
				size: 8
			},
		}];
	}, []);
	
	const traces = useMemo(() => {
		return [...generateGradientTraces(input1, input2), ...dataPointsTraces];
	}, [input1, input2, dataPointsTraces]);

	return (
		<View style={styles.container}>
			<View style={styles.topContainer}>
				{/* Inputs Column */}
				<View style={styles.inputsColumn}>
					{/* Input 1 */}
					<View style={styles.inputRow}>
						<Icon source="weather-sunny" size={40} color="#6200ee" />
						<View style={{ flex: 1, justifyContent: 'center' }}>
							<VerticalSlider
								value={input1}
								onChange={(value) => handleInputChange(value, 0)}
								height={100}
								width={30}
								step={0.1}
								min={-1}
								max={1}
								borderRadius={5}
								showIndicator
								renderIndicator={() => (
									<View style={{ height: 20, width: 30, backgroundColor: Colors.primaryLighter, borderTopLeftRadius: getBorderTopRadius(input1), borderTopRightRadius: getBorderTopRadius(input1), justifyContent: 'center', alignItems: 'center' }}>
										<Text style={{ color: Colors.whiteText }}>{input1.toFixed(1)}</Text>
									</View>
								)}
								renderIndicatorHeight={20}
								sliderStyle={{ backgroundColor: Colors.primary }}
								minimumTrackTintColor={Colors.primaryDarker}
								maximumTrackTintColor={Colors.primaryDarker}

							/>
						</View>
					</View>

					{/* Input 2 */}
					<View style={styles.inputRow}>
						<Icon source="file-document-multiple-outline" size={40} color="#6200ee" />
						<View style={{ flex: 1, justifyContent: 'center' }}>
							<VerticalSlider
								value={input2}
								onChange={(value) => handleInputChange(value, 1)}
								height={100}
								width={30}
								step={0.1}
								min={-1}
								max={1}
								borderRadius={5}
								showIndicator
								renderIndicator={() => (
									<View style={{ height: 20, width: 30, backgroundColor: Colors.primaryLighter, borderTopLeftRadius: getBorderTopRadius(input2), borderTopRightRadius: getBorderTopRadius(input2), justifyContent: 'center', alignItems: 'center' }}>
										<Text style={{ color: Colors.whiteText }}>{input2.toFixed(1)}</Text>
									</View>
								)}
								renderIndicatorHeight={20}
								sliderStyle={{ backgroundColor: Colors.primary }}
								minimumTrackTintColor={Colors.primaryDarker}
								maximumTrackTintColor={Colors.primaryDarker}
							/>
						</View>
					</View>
				</View>

				{/* Neuron Visualization */}
				<View style={styles.neuronContainer}>
					<View style={styles.neuronCircle}>
						{/* Filled circle representing the sum */}
						<View style={[
							styles.neuronFill,
							{
								height: `${fillPercentage * 100}%`,
								backgroundColor: fillPercentage >= 0.5 ? Colors.success : Colors.primaryDarker
							}
						]} />
						{/* Threshold indicator line */}
						<Text style={styles.neuronText}>Neuron</Text>
						<View style={styles.thresholdLine} />
					</View>
					<View style={styles.weightsContainer}>
						<Text>Weight 1: {input1.toFixed(2)}</Text>
						<Text>Weight 2: {input2.toFixed(2)}</Text>
						<Text>Sum: {sum.toFixed(2)}</Text>
					</View>
				</View>

				{/* Plot */}
			</View>
			<View style={{ flex: 1, height: 400 }}>
				<DataPlotter
					data={traces as any}
					layout={baseLayout}
					config={baseConfig}
					style={{}}
					onHover={() => { }}
					onPointClick={() => { }}
					dom={{ scrollEnabled: false }}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({

	container: {
		maxWidth: 600,
		alignSelf: 'center',
		flexDirection: 'column',
		gap: 16,
		width: '100%',
		paddingHorizontal: 8,

	},
	topContainer: {
		flexDirection: 'row',
		padding: 16,
		gap: 16,

	},
	inputsColumn: {
		flex: 1,
		gap: 16,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	neuronContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	neuronCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: Colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		position: 'relative',
	},
	neuronFill: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
	},
	thresholdLine: {
		position: 'absolute',
		width: '100%',
		height: 2,
		backgroundColor: Colors.text,
		top: '50%',
	},
	neuronText: {
		color: Colors.whiteText,
		fontWeight: 'bold',
	},
	weightsContainer: {
		marginTop: 8,
		alignItems: 'center',
	},
});

export default NeuronVisualization;
