import React, { lazy, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, DataTable, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';
import { Config, Layout } from 'plotly.js';
import { generateColors } from '@/utils/utilfunctions';
import GradientSlider from '@/components/GradientSlider';
import VerticalSlider from 'rn-vertical-slider';
import { NeuronVisualizationProps } from '@/types';
import { ActivationFunction, calculateNeuronOutput, generateExpectedClassTrace, generateHeatmapData, generateScatterTrace, getIndicatorContainerWidth, getWeightIndicatorStyle } from '@/utils/neuron';
import { useDataFetch } from '@/hooks/useDataFetch';
import styles from '@/styles/styles';

let DataPlotter = lazy(() => import("@/components/data/DataPlotter"));

const baseLayout: Partial<Layout> = {
	showlegend: false,
	hovermode: "closest",
	autosize: true,
	plot_bgcolor: "transparent",
	paper_bgcolor: "transparent",
	xaxis: {
		fixedrange: true,
		titlefont: {
			size: 14,
			weight: 600,
			family: "Poppins"
		},
		tickfont: {
			size: 12,
			family: "Poppins"
		}
	},
	yaxis: {
		fixedrange: true,
		titlefont: {
			size: 14,
			weight: 600,
			family: "Poppins"
		},
		tickfont: {
			size: 12,
			family: "Poppins"
		}
	},
	margin: { t: 20, b: 70, l: 70, r: 40 },
	height: 400,
};

const baseConfig: Partial<Config> = {
	responsive: true,
	displayModeBar: false,
};

const MAX_WEIGHT_WIDTH = 30;

const NeuronVisualization = ({ config, dataset_info }: NeuronVisualizationProps) => {
	// Merge the provided config with the default config
	const mergedConfig = useMemo(() => ({
		...config,
		axes: {
			...(config.axes),
		},
		classes: {
			...(config.classes),
		},
		initialValues: {
			...(config.initialValues),
		},
		locked: {
			...(config.locked),
		}
	}), [config]);

	const { data, columns, isLoading, error } = useDataFetch({
		source: dataset_info?.url,
		isCSV: dataset_info?.extension?.toLowerCase() === "csv"
	});

	// Data is already in correct format with correct columns
	const dataPoints = data.map((row: any) => ({
		x: row["x"],
		y: row["y"],
		result: row["result"]
	}));

	// Extract values for easier use
	const X_AXIS_NAME = mergedConfig.axes.x.name;
	const Y_AXIS_NAME = mergedConfig.axes.y.name;
	const CLASS2 = mergedConfig.classes.negative.value;
	const CLASS0 = mergedConfig.classes.neutral.value;
	const CLASS1 = mergedConfig.classes.positive.value;

	// Set state from configuration
	const [weight1, setWeight1] = useState(mergedConfig.initialValues.weight1);
	const [weight2, setWeight2] = useState(mergedConfig.initialValues.weight2);
	const [bias, setBias] = useState(mergedConfig.initialValues.bias);
	const [activationFn, setActivationFn] = useState<ActivationFunction>('tanh');
	const [useXTickText, setUseXTickText] = useState(mergedConfig.axes.x.useTickText);
	const [useYTickText, setUseYTickText] = useState(mergedConfig.axes.y.useTickText);

	// Create conditional setters that respect lock settings
	const setWeight1IfUnlocked = useCallback((value: number) => {
		if (!mergedConfig.locked.weight1) {
			setWeight1(value);
		}
	}, [mergedConfig.locked.weight1]);

	const setWeight2IfUnlocked = useCallback((value: number) => {
		if (!mergedConfig.locked.weight2) {
			setWeight2(value);
		}
	}, [mergedConfig.locked.weight2]);

	const setBiasIfUnlocked = useCallback((value: number) => {
		if (!mergedConfig.locked.bias) {
			setBias(value);
		}
	}, [mergedConfig.locked.bias]);

	// Toggle tick text, may be one of the axes or both

	const toggleTickText = useCallback((axis: "x" | "y" | "both") => {
		if (axis === "x") {
			setUseXTickText(!useXTickText);
		} else if (axis === "y") {
			setUseYTickText(!useYTickText);
		} else {
			setUseXTickText(!useXTickText);
			setUseYTickText(!useYTickText);
		}
	}, [useXTickText, useYTickText]);

	// Generate heatmap data
	const heatmapTrace = useMemo(() => {
		// Use the color scale values from the config
		const colorScaleValues = [
			[0, mergedConfig.classes.negative.color],
			[0.5, mergedConfig.classes.neutral.color],
			[1, mergedConfig.classes.positive.color]
		];
		return generateHeatmapData(weight1, weight2, bias, activationFn, colorScaleValues, mergedConfig);
	}, [weight1, weight2, bias, activationFn, mergedConfig]);

	// Generate scatter trace
	const scatterTrace = useMemo(() => {
		return generateScatterTrace(dataPoints, weight1, weight2, bias, activationFn, X_AXIS_NAME, Y_AXIS_NAME, mergedConfig);
	}, [dataPoints, weight1, weight2, bias, activationFn, X_AXIS_NAME, Y_AXIS_NAME, mergedConfig]);

	// Generate expected class trace
	const expectedClassTrace = useMemo(() => {
		return generateExpectedClassTrace(dataPoints, mergedConfig);
	}, [dataPoints, mergedConfig]);

	// Create array of traces
	// First heatmap, then expected classes (larger circles), then predictions (smaller circles)
	const traces = useMemo(() =>
		[heatmapTrace, expectedClassTrace, scatterTrace],
		[heatmapTrace, expectedClassTrace, scatterTrace]
	);

	// Calculate current predictions for all data points
	const predictions = useMemo(() => {
		return dataPoints.map(point => {
			// Convert percentages to the model's scale
			const scaledX = (point.x / 50) - 1; // Scale 0-100 to -1 to 1
			const scaledY = (point.y / 50) - 1; // Scale 0-100 to -1 to 1

			const output = calculateNeuronOutput(scaledX, scaledY, weight1, weight2, bias, activationFn);
			const predictedClass = output < 0 ? mergedConfig.classes.negative.value : output > 0 ? mergedConfig.classes.positive.value : mergedConfig.classes.neutral.value;
			const probability = output < 0
				? (Math.min(Math.abs(output), 1) * 100).toFixed(0) + '%'
				: output > 0
					? (Math.min(output, 1) * 100).toFixed(0) + '%'
					: '0%';

			// Check if prediction matches expected result
			const isCorrect = predictedClass === point.result;

			return {
				coordinates: `(${point.x}%, ${point.y}%)`,
				expected: point.result,
				predicted: predictedClass,
				probability,
				isCorrect
			};
		});
	}, [weight1, weight2, bias, activationFn, dataPoints]);

	// Calculate accuracy
	const accuracy = useMemo(() => {
		const correctCount = predictions.filter(p => p.isCorrect).length;
		return ((correctCount / predictions.length) * 100).toFixed(0) + '%';
	}, [predictions]);

	// Create the layout with axis names from config
	const layout = useMemo(() => ({
		...baseLayout,
		xaxis: {
			...baseLayout.xaxis,
			title: X_AXIS_NAME,
			tickvals: useXTickText ? mergedConfig.axes.x.tickValues : undefined,
			ticktext: useXTickText ? mergedConfig.axes.x.tickText : undefined,
			range: [mergedConfig.axes.x.min, mergedConfig.axes.x.max],
			ticksuffix: mergedConfig.axes.x.suffix,
			tickprefix: mergedConfig.axes.x.prefix
		},
		yaxis: {
			...baseLayout.yaxis,
			title: Y_AXIS_NAME,
			tickvals: useYTickText ? mergedConfig.axes.y.tickValues : undefined,
			ticktext: useYTickText ? mergedConfig.axes.y.tickText : undefined,
			range: [mergedConfig.axes.y.min, mergedConfig.axes.y.max],
			ticksuffix: mergedConfig.axes.y.suffix,
			tickprefix: mergedConfig.axes.y.prefix
		}
	}), [X_AXIS_NAME, Y_AXIS_NAME, useXTickText, useYTickText, mergedConfig]);

	return (
		<View style={localStyles.container}>
			{/* Weight sliders with disabled state from config */}
			<View style={localStyles.weightsRow}>
				<View style={localStyles.weightControlContainer}>
					<Surface style={[localStyles.weightControl, mergedConfig.locked.weight1 && localStyles.disabledControl]}>
						{mergedConfig.axes.x.emoji && <Text style={localStyles.weightIcon}>{mergedConfig.axes.x.emoji}</Text>}
						<Text style={localStyles.weightLabel}>
							{X_AXIS_NAME} Weight (w₁): {weight1.toFixed(1)}
						</Text>
						<Slider
							value={weight1}
							onValueChange={setWeight1IfUnlocked}
							minimumValue={-1}
							maximumValue={1}
							step={0.1}
							style={localStyles.weightSlider}
							minimumTrackTintColor={Colors.primary}
							maximumTrackTintColor={Colors.primaryLighter}
							disabled={mergedConfig.locked.weight1}
						/>
					</Surface>
					<View style={[localStyles.weightIndicatorContainer, getIndicatorContainerWidth(weight1, MAX_WEIGHT_WIDTH)]}>
						<View style={getWeightIndicatorStyle(weight1)} />
					</View>
				</View>

				{/* Weight 2 Control with Indicator */}
				<View style={localStyles.weightControlContainer}>
					<Surface style={[localStyles.weightControl, mergedConfig.locked.weight2 && localStyles.disabledControl]}>
						{mergedConfig.axes.y.emoji && <Text style={localStyles.weightIcon}>{mergedConfig.axes.y.emoji}</Text>}
						<Text style={localStyles.weightLabel}>{Y_AXIS_NAME} Weight (w₂): {weight2.toFixed(1)}</Text>
						<Slider
							value={weight2}
							onValueChange={setWeight2IfUnlocked}
							minimumValue={-1}
							maximumValue={1}
							step={0.1}
							style={localStyles.weightSlider}
							minimumTrackTintColor={Colors.primary}
							maximumTrackTintColor={Colors.primaryLighter}
							disabled={mergedConfig.locked.weight2}
						/>
					</Surface>
					<View style={[localStyles.weightIndicatorContainer, getIndicatorContainerWidth(weight2, MAX_WEIGHT_WIDTH)]}>
						<View style={getWeightIndicatorStyle(weight2)} />
					</View>
				</View>
			</View>

			{/* Plot (moved up to remove gap) */}
			<Surface style={localStyles.plotContainer}>
				<DataPlotter
					data={traces as any}
					layout={layout}
					config={baseConfig}
					style={{ flex: 1 }}
					onHover={() => { }}
					onPointClick={() => { }}
					dom={{ scrollEnabled: false }}
				/>

				{/* Conditional vertical bias slider based on config */}
				{mergedConfig.useVerticalSlider && (
					<View style={{ flexDirection: 'column', alignItems: 'center', gap: 10, marginRight: 32 }}>
						<Text style={{ color: Colors.text, fontWeight: 'bold' }}>
							{CLASS1} {mergedConfig.classes.positive.emoji && mergedConfig.classes.positive.emoji}
						</Text>
						<VerticalSlider
							value={-bias}
							onChange={value => setBiasIfUnlocked(-value)}
							height={260}
							width={40}
							step={0.1}
							min={-5}
							max={5}
							borderRadius={5}
							minimumTrackTintColor={mergedConfig.classes.negative.color}
							disabled={mergedConfig.locked.bias}
							sliderStyle={{ backgroundColor: mergedConfig.classes.positive.color, borderRadius: 5 }}
							containerStyle={{}}
							showIndicator
							renderIndicator={() => (
								<View style={{ backgroundColor: mergedConfig.classes.neutral.color, width: 80, height: 30, alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 5, borderBottomRightRadius: 5 }}>
									<Text style={{ color: Colors.text, fontWeight: 'bold' }}>
										{CLASS0} {mergedConfig.classes.neutral.emoji && mergedConfig.classes.neutral.emoji}
									</Text>
								</View>
							)}
							renderIndicatorHeight={30}
						/>
						<Text style={{ color: Colors.text, fontWeight: 'bold' }}>
							{CLASS2} {mergedConfig.classes.negative.emoji && mergedConfig.classes.negative.emoji}
						</Text>
					</View>
				)}
			</Surface>

			{/* Horizontal bias slider only if vertical is disabled */}

			<Surface style={localStyles.controlsContainer}>
				<Text style={{ color: Colors.text, fontWeight: 'bold', textAlign: 'center' }}>
					Bias{mergedConfig.locked.bias ? '(Locked):' : ':'} {bias.toFixed(1)}
				</Text>
				{
					((mergedConfig.axes.x.tickText && mergedConfig.axes.x.tickText?.length > 0) || (mergedConfig.axes.y.tickText && mergedConfig.axes.y.tickText?.length > 0)) && (
						<Button mode="outlined" style={[styles.savvyButton]} onPress={() => toggleTickText("both")}>
							Toggle Tick Text
						</Button>
					)
				}
				{!mergedConfig.useVerticalSlider && (
					<GradientSlider
						value={-bias}
						onValueChange={value => setBiasIfUnlocked(-value)}
						minimumValue={-5}
						maximumValue={5}
						step={0.1}
						disabled={mergedConfig.locked.bias}
						classes={mergedConfig.classes}
					/>
				)}
			</Surface>

			{/* Results Comparison Table */}
			<Surface style={localStyles.tableContainer}>
				<Text style={localStyles.tableTitle}>Model Predictions (Accuracy: {accuracy})</Text>

				<DataTable>
					<DataTable.Header>
						<DataTable.Title>Coordinates</DataTable.Title>
						<DataTable.Title>Expected</DataTable.Title>
						<DataTable.Title>Predicted</DataTable.Title>
						<DataTable.Title numeric>Probability</DataTable.Title>
					</DataTable.Header>

					<ScrollView style={localStyles.tableScrollView}>
						{predictions.map((item, index) => (
							<DataTable.Row key={index} style={item.isCorrect ? localStyles.correctRow : localStyles.incorrectRow}>
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

const localStyles = StyleSheet.create({
	container: {
		alignSelf: 'center',
		flexDirection: 'column',
		width: '100%',
	},
	weightIcon: {
		fontSize: 30,
	},
	weightsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	weightControlContainer: {
		maxWidth: 150,
	},
	weightControl: {
		width: '100%',
		alignItems: 'center',
		backgroundColor: 'white',
		padding: 8,
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
		flexDirection: 'row',
		padding: 8,
		height: 400,
		backgroundColor: 'white',
		borderRadius: 12,
		overflow: 'hidden',
		elevation: 3,
		alignItems: 'center',
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
	gradientSlider: {
		width: '100%',
		height: 40,
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
	disabledControl: {
		backgroundColor: '#f0f0f0',
	},
});

export default NeuronVisualization;
