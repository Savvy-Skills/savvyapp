import React, { useState, useMemo } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, SegmentedButtons, Text, ToggleButton } from "react-native-paper";
import { useDataFetch } from "@/hooks/useDataFetch";
import DataTable from "./DataTable";
import Filter from "./Filter";
import { filterData } from "@/utils/filterData";
import type { DatasetInfo } from "@/types";
import type { FilterField, CombinedFilter } from "@/types/filter";
import DataVisualizerPlotly, { TraceConfig } from "@/components/data/DataVisualizerPlotly";
import styles from "@/styles/styles";
import ThemedTitle from "../themed/ThemedTitle";
import { useViewStore } from "@/store/viewStore";
import { Colors } from "@/constants/Colors";
import { generateColors } from "@/utils/utilfunctions";

interface DataTableContainerProps {
	data?: any[];
	columns?: any[];
	datasetInfo: DatasetInfo;
	headerColors?: string[];
	traces?: TraceConfig[];
	NN?: boolean;
	hideVisualizer?: boolean;
	hideFilter?: boolean;
	index: number;
	padding?: number;
	invert?: boolean;
	originalData?: any[];
	originalTraces?: TraceConfig[];
}


export default function DataTableContainer({
	data: providedData,
	columns: providedColumns,
	datasetInfo,
	headerColors,
	traces,
	hideVisualizer = false,
	hideFilter = false,
	index,
	originalData,
	originalTraces,
}: DataTableContainerProps) {
	// Destructure datasetInfo if available
	const { url, extension } = datasetInfo || {};
	const validTraces = traces && traces.length > 0;

	// Set default view to table if originalTraces is undefined
	const [selectedView, setSelectedView] = useState<"table" | "chart">(validTraces ? "chart" : "table");
	const { setTrigger } = useViewStore();

	// Use data fetch only if data is not provided
	const { data, columns, isLoading, error } = useDataFetch({
		source: url,
		isCSV: extension?.toLowerCase() === "csv"
	});

	// Use provided data and columns if available, otherwise use fetched data
	const finalData = providedData || data;
	const finalColumns = providedColumns || columns;

	const [activeFilter, setActiveFilter] = useState<CombinedFilter | null>(null);
	const [showFilters, setShowFilters] = useState(false);
	const [containerWidth, setContainerWidth] = useState(0);

	// If originalTraces is provided, merge it with the traces
	const finalTraces = traces ? [...(originalTraces || []), ...traces] : originalTraces;
	
	// Determine if chart view should be available
	const chartViewAvailable = validTraces;

	const fields: FilterField[] = useMemo(() => {
		if (!finalData || !finalColumns || !finalData.length || !finalColumns.length) return [];

		return finalColumns.map((column) => {
			const values = finalData.map((row) => row[column.accessor]);
			const isNumeric = !isNaN(Number(values[0]));

			const filteredValues = values.filter(
				(value) =>
					value !== null &&
					value !== undefined &&
					value !== "" &&
					value.toString().trim() !== ""
			);

			return {
				name: column.Header,
				accessor: column.accessor,
				type: isNumeric ? "numeric" : "categorical",
				uniqueValues: isNumeric
					? undefined
					: Array.from(new Set(filteredValues))
						.filter(
							(value) =>
								value !== null &&
								value !== undefined &&
								value.toString().trim() !== ""
						)
						.sort(),
			};
		});
	}, [finalData, finalColumns]);

	const filteredData = useMemo(() => {
		if (!finalData) return [];
		// If originalData is provided, merge it with the finalData	
		if (originalData) {
			return [...originalData, ...finalData];
		}
		return filterData(finalData, activeFilter);
	}, [finalData, activeFilter, originalData]);

	const handleViewChange = (view: "table" | "chart") => {
		setSelectedView(view);
		setTrigger("scrollToEnd");
	};

	if (isLoading && !finalData) {
		return (
			<View style={styles.centeredContainer}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centeredContainer}>
				<Text>Error: {error}</Text>
			</View>
		);
	}


	return (
		<View onLayout={(event) => {
			const { height, width } = event.nativeEvent.layout;
			setContainerWidth(width);
		}} id={`datatable-container-${index}`} style={[{ gap: 16 }]}>
			<View>
				<ThemedTitle style={[styles.datasetTitle]}>Dataset: {datasetInfo?.name}</ThemedTitle>
				{datasetInfo?.metadata?.about && <Text style={styles.datasetAbout}>{datasetInfo?.metadata?.about}</Text>}
			</View>
			<View style={{ flexDirection: "row", gap: 4, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
				{chartViewAvailable && (
					<SegmentedButtons
						style={{ flex: 1, height: "100%", maxWidth: 200 }}
						buttons={[{ label: "Chart", value: "chart", icon: "chart-box-outline", style: { ...styles.toggleButton } },
							{ label: "Table", value: "table", icon: "table-large", style: { ...styles.toggleButton } }]}
						onValueChange={(value) => handleViewChange(value as "table" | "chart")}
						value={selectedView}
						theme={{ roundness: 0, colors: { secondaryContainer: generateColors(Colors.primary, 0.2).muted } }}
					/>
				)}
				{!hideFilter && (
					<Button
						icon="cog-outline"
						onPress={() => setShowFilters((prev) => !prev)}
						style={[styles.toggleButton, showFilters && styles.toggleButtonActive]}
						textColor={Colors.text}
						mode="outlined"
					>
						Filters
					</Button>
				)}
			</View>
			{!hideFilter && showFilters && <Filter fields={fields} onFilterChange={setActiveFilter} />}
			{(selectedView === "table" || !chartViewAvailable) && <DataTable
				data={filteredData}
				columns={finalColumns}
				name={datasetInfo?.name}
				headerColors={headerColors}
				parentWidth={containerWidth}
			/>}
			{selectedView === "chart" && chartViewAvailable && (!hideVisualizer && finalTraces && finalTraces.length > 0) && <DataVisualizerPlotly
				dataset={filteredData}
				traces={finalTraces}
				title="Data Visualizer"
				xAxisLabel={finalTraces[0].x}
				yAxisLabel={finalTraces[0].y}
			/>}
			{datasetInfo?.metadata?.source && <Text style={styles.datasetSource}>Data Source: <Text style={{}}>{datasetInfo?.metadata?.source}</Text></Text>}
		</View>
	);
}