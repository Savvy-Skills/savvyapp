import React, { useState, useMemo, lazy, Suspense, useEffect, useCallback } from "react";
import {
	View,
	StyleSheet,
	useWindowDimensions,
	ScrollView,
} from "react-native";
import {
	ActivityIndicator,
	Button,
	IconButton,
	SegmentedButtons,
	Text,
} from "react-native-paper";
import { Data, Layout, Config, PlotType } from "plotly.js";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { groupByColumn } from "@/utils/utilfunctions";
import styles from "@/styles/styles";
import { Colors } from "@/constants/Colors";

let DataPlotter = lazy(() => import("@/components/data/DataPlotter"));

export type TraceConfig = {
	x: string;
	y: string;
	z?: string;
	name: string;
	type: "scatter" | "bar" | "histogram";
	groupBy?: string;
	stack?: boolean;
	locationmode?: "ISO-3" | "USA-states" | "country names" | "geojson-id";
	mode?: "number" | "text" | "delta" | "gauge" | "none" | "lines" | "markers" | "lines+markers" | "text+markers" | "text+lines" | "text+lines+markers" | "number+delta" | "gauge+number" | "gauge+number+delta" | "gauge+delta" | undefined;
};

export interface HoverData {
	pointIndex: number;
	pointNumber: number;
	x: number[];
	y: number[];
	name: string;
}

export type DataVisualizerProps = {
	dataset: Record<string, any>[];
	traces?: TraceConfig[];
	title?: string;
	xAxisLabel?: string;
	yAxisLabel?: string;
};

const CHART_COLORS = [
	"#7B1FA2",
	"#FF9800",
	"#2196F3",
	"#FFC107",
	"#4CAF50",
	"#E91E63",
	"#9C27B0",
	"#00BCD4",
	"#FFEB3B",
	"#FF5722",
];

const PIE_MODE_OPTIONS = [
	{ label: "Frequency", value: "frequency" },
	{ label: "Sum", value: "sum" },
];

const getInitialHiddenTraces = (): Record<string, boolean> => ({});

const calculateRanges = (dataset: Record<string, any>[], traces: TraceConfig[], chartType: PlotType) => {
	if (["pie", "bar", "histogram"].includes(chartType)) return null;

	const xValues = dataset.flatMap((d) => traces.map((t) => d[t.x]));
	const yValues = dataset.flatMap((d) => traces.map((t) => d[t.y]));

	const xMin = Math.min(...xValues);
	const xMax = Math.max(...xValues);
	const yMin = Math.min(...yValues);
	const yMax = Math.max(...yValues);

	const xPadding = (xMax - xMin) * 0.2;
	const yPadding = (yMax - yMin) * 0.2;

	return {
		x: [xMin - xPadding, xMax + xPadding],
		y: [yMin - yPadding, yMax + yPadding]
	};
};

const generatePieData = (dataset: Record<string, any>[], mode: "frequency" | "sum", selectedColumn: string | null) => {
	const values = mode === "frequency"
		? calculateFrequencyData(dataset, selectedColumn)
		: calculateSumData(dataset);

	return [{
		type: "pie",
		labels: Object.keys(values),
		values: Object.values(values),
		textinfo: "label+percent",
		hoverinfo: "none",
		showlegend: false,
		marker: { colors: CHART_COLORS }
	} as Data];
};

const calculateFrequencyData = (dataset: Record<string, any>[], selectedColumn: string | null) => {
	const frequencies: Record<string, number> = {};
	dataset.forEach((item) => {
		const value = selectedColumn ? String(item[selectedColumn]) : "";
		frequencies[value] = (frequencies[value] || 0) + 1;
	});
	return frequencies;
};

const calculateSumData = (dataset: Record<string, any>[]) => {
	const sums: Record<string, number> = {};
	dataset.forEach((item) => {
		Object.entries(item).forEach(([key, value]) => {
			if (typeof value === "number") {
				sums[key] = (sums[key] || 0) + value;
			}
		});
	});
	return sums;
};

const generatePlotlyData = ({
	dataset,
	traces,
	hiddenTraces,
	activeChartType,
	histogramColumn,
	pieMode,
	selectedColumn,
}: {
	dataset: Record<string, any>[];
	traces: TraceConfig[];
	hiddenTraces: Record<string, boolean>;
	activeChartType: PlotType;
	histogramColumn: string | null;
	pieMode: "frequency" | "sum";
	selectedColumn: string | null;
}) => {
	if (activeChartType === "pie") {
		return generatePieData(dataset, pieMode, selectedColumn);
	}

	if (activeChartType === "histogram" && histogramColumn) {
		return [{
			type: "histogram",
			locationmode: "country names",
			x: dataset.map((d) => d[histogramColumn]),
			name: histogramColumn,
			marker: { color: CHART_COLORS[0] }
		} as Data];
	}


	if (activeChartType === "choropleth") {
		// Create a map to store the sums for each entity
		const entitySums = new Map<string, number>();

		const locationColumn = traces[0].x;
		const zColumn = traces[0].z;
		// Sum the electric cars sold for each entity
		dataset.forEach(item => {
			const locations = item[locationColumn];
			const z = item[zColumn as string];
			if (entitySums.has(locations)) {
				entitySums.set(locations, entitySums.get(locations)! + z);
			} else {
				entitySums.set(locations, z);
			}
		});

		// Convert the map to arrays for locations and z
		const locations = Array.from(entitySums.keys());
		const z = Array.from(entitySums.values());
		return [{
			type: "choropleth",
			locationmode: traces[0].locationmode || "country names",
			locations,
			z,
			colorscale: "Viridis",
			autocolorscale: true,
			reversescale: true,
			colorbar: { thickness: 20 }
		} as Data];
	}

	if (activeChartType === "bar") {
		return traces.map((trace, index) => {
			if (hiddenTraces[trace.name]) return {};
			const xColumnName = trace.x; // Get the x column name from the trace
			const yColumnName = trace.y; // Get the y column name from the trace

			// Group data by x column and sum the y values
			const groupedData = dataset.reduce((acc, item) => {
				const xValue = item[xColumnName];
				if (!acc[xValue]) {
					acc[xValue] = 0;
				}
				acc[xValue] += item[yColumnName];
				return acc;
			}, {} as Record<string, number>);


			return {
				type: "bar",
				x: Object.keys(groupedData),
				y: Object.values(groupedData),
				name: trace.name,
				marker: { color: CHART_COLORS[index % CHART_COLORS.length] }
			} as Data;
		});
	}

	return traces
		// .filter((trace) => !hiddenTraces[trace.name])
		.map((trace, index) => {
			if (hiddenTraces[trace.name]) return {};
			const traceColor = CHART_COLORS[index % CHART_COLORS.length];
			const baseTrace = {
				type: trace.type,
				name: trace.name,
				mode: traces[0].mode || "markers",
				marker: { color: traceColor },
				x: dataset.map((d) => d[trace.x]),
				y: dataset.map((d) => d[trace.y]),
			};
			if (trace.groupBy) {
				const groupedData = groupByColumn(dataset, trace.groupBy);
				return Object.entries(groupedData).map(([group, groupDataset], groupIndex) => ({
					...baseTrace,
					x: (groupDataset as Record<string, any>[]).map((d) => d[trace.x]),
					y: (groupDataset as Record<string, any>[]).map((d) => d[trace.y]),
					name: group,
					visible: !hiddenTraces[group] ? true : false,
					marker: { color: CHART_COLORS[groupIndex % CHART_COLORS.length] },

				}));
			}
			return baseTrace;
		})
		.flat();
};

const generateLayout = ({
	activeChartType,
	histogramColumn,
	ranges,
	xAxisLabel,
	yAxisLabel,
	traces,
}: {
	activeChartType: PlotType;
	histogramColumn: string | null;
	ranges: { x: number[], y: number[] } | null;
	xAxisLabel: string;
	yAxisLabel: string;
	traces?: TraceConfig[];
}): Partial<Layout> => {
	const baseLayout: Partial<Layout> = {
		showlegend: false,
		hovermode: "closest",
		autosize: true,
		plot_bgcolor: "transparent",
		paper_bgcolor: "transparent",
		xaxis: { fixedrange: true },
		yaxis: { fixedrange: true },
		margin: { t: 10, b: 40, l: 40, r: 40 },
	};

	if (activeChartType === "choropleth") {
		return {
			...baseLayout,
			geo: {
				projection: { type: "robinson" }
			}
		};
	}

	if (activeChartType === "pie") {
		return {
			...baseLayout,
			margin: { t: 10, b: 10, l: 10, r: 10 }
		};
	}

	if (activeChartType === "histogram") {
		return {
			...baseLayout,
			xaxis: { title: histogramColumn || "", fixedrange: true },
			yaxis: { title: "Count", fixedrange: true }
		};
	}

	if (activeChartType === "bar") {
		return {
			...baseLayout,
			barmode: traces?.some(trace => trace.stack) ? "stack" : "group",
			bargap: 0.1,

		};
	}

	if (ranges) {
		return {
			...baseLayout,
			xaxis: { range: ranges.x, tickformat: "d", fixedrange: true },
			yaxis: { range: ranges.y, fixedrange: true }
		};
	}

	return baseLayout;
};

const generateConfig = (): Partial<Config> => ({
	responsive: true,
	displayModeBar: false,
});


export default function DataVisualizerPlotly({
	dataset,
	traces = [],
	xAxisLabel = "X AXIS",
	yAxisLabel = "Y AXIS",
}: DataVisualizerProps) {
	const initialColumn = dataset.length > 0 ? Object.keys(dataset[0])[0] : null;

	const [activeChartType, setActiveChartType] = useState<PlotType>(traces[0].type);
	const [hiddenTraces, setHiddenTraces] = useState<Record<string, boolean>>(getInitialHiddenTraces);
	const [pieMode, setPieMode] = useState<"frequency" | "sum">("frequency");
	const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number, name: string } | null>(null);

	const [selectedColumn, setSelectedColumn] = useState<string | null>(
		initialColumn
	);
	const [histogramColumn, setHistogramColumn] = useState<string | null>(
		initialColumn
	);


	const { width } = useWindowDimensions();
	const buttonContainerStyle: {
		justifyContent: "center" | "flex-start";
		flex: number;
	} = {
		justifyContent: "center",
		flex: 1,
	};
	if (width < SLIDE_MAX_WIDTH) {
		buttonContainerStyle.justifyContent = "flex-start";
	}

	const ranges = useMemo(() => calculateRanges(dataset, traces, activeChartType),
		[dataset, traces, activeChartType]);

	const plotlyData = useMemo(() => generatePlotlyData({
		dataset,
		traces,
		hiddenTraces,
		activeChartType,
		histogramColumn,
		pieMode,
		selectedColumn
	}), [dataset, traces, hiddenTraces, activeChartType, histogramColumn, pieMode, selectedColumn]);


	const layout = useMemo(() => {
		return generateLayout({
			activeChartType,
			histogramColumn,
			ranges,
			xAxisLabel,
			yAxisLabel,
			traces
		});
	}, [activeChartType, histogramColumn, ranges, xAxisLabel, yAxisLabel, traces]);

	const config = useMemo(() => generateConfig(), []);

	const toggleTrace = useCallback((traceName: string) => {
		setHiddenTraces((prev) => ({
			...prev,
			[traceName]: !prev[traceName]
		}));
	}, []);

	const handlePointClick = useCallback((data: any) => {
		const pointData = data[0];
		console.log({ pointData, traces })
		if (activeChartType === "choropleth") {
			const x = pointData.data.locations[pointData.pointIndex];
			const y = pointData.data.z[pointData.pointIndex];
			const name = pointData.data.locations[pointData.pointIndex];
			setSelectedPoint({ x, y, name });
		} else {
			const x = pointData.data.x[pointData.pointIndex];
			const y = pointData.data.y[pointData.pointIndex];
			const name = pointData.data.name;
			setSelectedPoint({ x, y, name });
		}
	}, [activeChartType]);

	return (
		<View style={localStyles.container}>
			{activeChartType === "pie" && (
				<SegmentedButtons
					value={pieMode}
					onValueChange={(value) => setPieMode(value as "frequency" | "sum")}
					buttons={PIE_MODE_OPTIONS}
					style={{ marginBottom: 16 }}
				/>
			)}
			{/* Add Y Axis Label */}
			{!["pie", "choropleth"].includes(activeChartType) && (
				<View style={localStyles.yAxisLabelContainer}>
					<Text style={localStyles.axisLabel}>{yAxisLabel}</Text>
				</View>
			)}
			<View style={localStyles.plotWrapper}>
				<View style={localStyles.plotContainer}>
					<Suspense fallback={<ActivityIndicator />}>
						<DataPlotter
							data={plotlyData}
							layout={layout}
							config={config}
							style={localStyles.plot}
							dom={{ scrollEnabled: false }}
							onHover={() => { }}
							onPointClick={handlePointClick}
						/>
					</Suspense>
				</View>
				{/* Add X Axis Label */}
				{!["pie", "choropleth"].includes(activeChartType) && (
					<View style={localStyles.xAxisLabelContainer}>
						<Text style={localStyles.axisLabel}>{xAxisLabel}</Text>
					</View>
				)}
			</View>
			{selectedPoint && (
				<View style={styles.selectedPointContainer}>
					<IconButton style={{ position: "absolute", top: -20, right: -20 }} icon="close" size={20} iconColor={Colors.primary} onPress={() => setSelectedPoint(null)} />
					{activeChartType !== "choropleth" && (
						<Text style={styles.selectedPointText}>{traces[0].type === "scatter" && traces[0].groupBy ? `${traces[0].groupBy}:` : ""}{selectedPoint.name}</Text>
					)}
					<Text style={styles.selectedPointText}>{traces[0].x}: {selectedPoint.x}</Text>
					<Text style={styles.selectedPointText}>{traces[0].type === "scatter" ? `${traces[0].y}:` : "Value:"} {selectedPoint.y}</Text>
				</View>
			)}
			{/* Add Buttons for each trace */}
			<ScrollView
				style={{
					maxHeight: 100,
				}}
				contentContainerStyle={{
					flexDirection: "row",
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				{activeChartType === "pie" &&
					pieMode === "frequency" &&
					Object.keys(dataset[0] || {}).map((columnName, index) => (
						<Button
							key={columnName}
							mode="outlined"
							onPress={() => setSelectedColumn(columnName)}
							style={[
								localStyles.button,
								selectedColumn !== columnName && localStyles.disabledButton,
							]}
							icon={() => (
								<View
									style={[
										localStyles.colorSquare,
										{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
									]}
								/>
							)}
						>
							{columnName}
						</Button>
					))}
				{activeChartType === "bar" &&
					traces.map((trace, index) => (
						<Button
							key={trace.name}
							mode="outlined"
							onPress={() => toggleTrace(trace.name)}
							style={[
								localStyles.button,
								hiddenTraces[trace.name] && localStyles.disabledButton,
							]}
							icon={() => (
								<View
									style={[
										localStyles.colorSquare,
										{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
									]}
								/>
							)}
						>
							{trace.name}
						</Button>
					))}
				{activeChartType === "histogram" &&
					Object.keys(dataset[0] || {}).map((columnName, index) => (
						<Button
							key={columnName}
							mode="outlined"
							onPress={() => setHistogramColumn(columnName)}
							style={[
								localStyles.button,
								histogramColumn !== columnName && localStyles.disabledButton,
							]}
							icon={() => (
								<View
									style={[
										localStyles.colorSquare,
										{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
									]}
								/>
							)}
						>
							{columnName}
						</Button>
					))}
				{activeChartType === "scatter" &&
					(traces.some(trace => trace.groupBy) ?
						Object.keys(groupByColumn(dataset, traces[0].groupBy)).map((group, index) => (
							<Button
								key={group}
								mode="outlined"
								onPress={() => toggleTrace(`${group}`)}
								style={[
									localStyles.button,
									hiddenTraces[`${group}`] && localStyles.disabledButton,
								]}
								icon={() => (
									<View
										style={[
											localStyles.colorSquare,
											{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
										]}
									/>
								)}
							>
								{`${group}`}
							</Button>
						))
						: traces.length > 1 &&
						traces.map((trace, index) => (
							<Button
								key={trace.name}
								mode="outlined"
								onPress={() => toggleTrace(trace.name)}
								style={[
									localStyles.button,
									hiddenTraces[trace.name] && localStyles.disabledButton,
								]}
								icon={() => (
									<View
										style={[
											localStyles.colorSquare,
											{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
										]}
									/>
								)}
							>
								{trace.name}
							</Button>
						))
					)
				}
			</ScrollView>
		</View>
	);
}

const localStyles = StyleSheet.create({
	container: {
		width: "100%",
		maxWidth: SLIDE_MAX_WIDTH,
		alignSelf: "center",
	},
	title: {
		textAlign: "center",
		marginBottom: 16,
		color: "black",
		fontSize: 18,
		fontWeight: "bold",
	},
	plotWrapper: {
		width: "100%",
		position: "relative",
	},
	plotContainer: {
		width: "100%",
		overflow: "hidden",
		position: "relative",
		height: 350,
	},
	plot: {
		width: "100%",
		flex: 1,
	},
	yAxisLabelContainer: {
		justifyContent: "center",
		zIndex: 1,
	},
	axisLabel: {
		color: "black",
		fontWeight: "bold",
	},
	xAxisLabelContainer: {
		alignItems: "flex-end",
		zIndex: 1,
	},
	chartTypeButtons: {
		flex: 1,
		justifyContent: "center",
	},
	pieModeButtons: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 16,
	},
	button: {
		minWidth: 100,
		borderRadius: 5,
		backgroundColor: "white",
		borderColor: "#E4E4E4",
		elevation: 2,
		boxShadow: "0 1px 1.5px rgba(0, 0, 0, 0.2)",
		margin: 4,
	},
	disabledButton: {
		opacity: 0.5,
		backgroundColor: "#F5F5F5",
	},
	colorSquare: {
		width: 12,
		height: 12,
		borderRadius: 2,
	},
	plotTypeButton: {
		marginTop: 16,
		alignSelf: "center",
	},
});
