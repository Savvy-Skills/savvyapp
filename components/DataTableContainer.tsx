import React, { useState, useMemo, lazy, Suspense } from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useDataFetch } from "@/hooks/useDataFetch";
import DataTable from "./DataTable";
import Filter from "./Filter";
import { filterData } from "../utils/filterData";
import type { DatasetInfo } from "@/types";
import type { FilterField, CombinedFilter } from "../types/filter";
import DataVisualizerPlotly, { TraceConfig } from "@/components/DataVisualizerPlotly";
import NeuralNetworkVisualizer from "./SimpleNN";

interface DataTableContainerProps {
	datasetInfo: DatasetInfo;
	headerColors?: string[];
	traces?: TraceConfig[];
	NN?: boolean;
	hideVisualizer?: boolean;
	hideFilter?: boolean;
}


export default function DataTableContainer({
	datasetInfo,
	headerColors,
	traces,
	NN,
	hideVisualizer = false,
	hideFilter = false,
}: DataTableContainerProps) {
	const { url, name, extension } = datasetInfo;
	const { data, columns, isLoading, error } = useDataFetch(
		url,
		extension.toLowerCase() === "csv"
	);

	const [activeFilter, setActiveFilter] = useState<CombinedFilter | null>(null);

	const fields: FilterField[] = useMemo(() => {
		if (!data || !columns) return [];

		return columns.map((column) => {
			const values = data.map((row) => row[column.accessor]);
			// Check first value for type inference
			const isNumeric = !isNaN(Number(values[0]));

			// Filter out null, undefined, and empty string values
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
	}, [data, columns]);

	const filteredData = useMemo(() => {
		if (!data) return [];
		return filterData(data, activeFilter);
	}, [data, activeFilter]);

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text>Error: {error.message}</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<DataTable
				data={filteredData}
				columns={columns}
				name={name}
				headerColors={headerColors}
			/>
			{!hideFilter && <Filter fields={fields} onFilterChange={setActiveFilter} />}
			{!hideVisualizer && <DataVisualizerPlotly
				dataset={filteredData}
				traces={traces}
					title="Data Visualizer"
				/>
			}
			{NN && <NeuralNetworkVisualizer data={filteredData} columns={columns}  />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 16,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
