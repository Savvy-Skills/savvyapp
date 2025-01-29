import React, { useState, useMemo, lazy, Suspense } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useDataFetch } from "@/hooks/useDataFetch";
import DataTable from "./DataTable";
import Filter from "./Filter";
import { filterData } from "../utils/filterData";
import type { DatasetInfo } from "@/types";
import type { FilterField, CombinedFilter } from "../types/filter";
import DataVisualizerPlotly, { TraceConfig } from "@/components/DataVisualizerPlotly";
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";

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
	invert = false,
}: DataTableContainerProps) {
	// Destructure datasetInfo if available
	const { url, extension } = datasetInfo || {};
	const { currentSlideIndex } = useCourseStore();

	// Use data fetch only if data is not provided
	const { data, columns, isLoading, error } = useDataFetch({
		source: url,
		isCSV: extension?.toLowerCase() === "csv"
	}
	);

	// Use provided data and columns if available, otherwise use fetched data
	const finalData = providedData || data;
	const finalColumns = providedColumns || columns;

	const [activeFilter, setActiveFilter] = useState<CombinedFilter | null>(null);
	const [containerWidth, setContainerWidth] = useState(0);

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
		return filterData(finalData, activeFilter);
	}, [finalData, activeFilter]);

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
				<Text>Error: {error.message}</Text>
			</View>
		);
	}

	if (currentSlideIndex !== index) {
		return <View />;
	}

	return (
		<View onLayout={(event) => {
			const { height, width } = event.nativeEvent.layout;
			setContainerWidth(width);
		}} id={`datatable-container-${index}`} style={[{ flexDirection: invert ? "column-reverse" : "column" }]}>
			<DataTable
				data={filteredData}
				columns={finalColumns}
				name={datasetInfo?.name}
				headerColors={headerColors}
				parentWidth={containerWidth}
			/>
			{!hideFilter && <Filter fields={fields} onFilterChange={setActiveFilter} />}
			{(!hideVisualizer && traces && traces.length > 0) && <DataVisualizerPlotly
				dataset={filteredData}
				traces={traces}
				title="Data Visualizer"
			/>}
		</View>
	);
}