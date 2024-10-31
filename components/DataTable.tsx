import React, { useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  VirtualizedList,
} from "react-native";
import { useDataFetch } from "@/hooks/useDataFetch";
import { Text } from "react-native-paper";
import { DatasetInfo } from "@/types";
import ThemedTitle from "./themed/ThemedTitle";

type DataTableProps = {
  headerColors?: string[];
  datasetInfo: DatasetInfo;
};

const MAX_VISIBLE_COLUMNS = 4;
const ROWS_PER_BATCH = 20;
const MAX_WIDTH = 600;
const MAX_COLUMN_WIDTH = 150;

export default function DataTable({
  datasetInfo,
  headerColors = ["#7B1FA2", "#2196F3", "#FF9800", "#FFC107"],
}: DataTableProps) {
  const { url, name, extension } = datasetInfo;
  const { data, columns, isLoading, error } = useDataFetch(url, extension.toLocaleLowerCase() === "csv");

  const screenHeight = Dimensions.get("window").height;
  const tableHeight = screenHeight * 0.25;
  const screenWidth = Dimensions.get("window").width;

  const COLUMN_WIDTH = useMemo(() => {
    const containerWidth = Math.min(screenWidth, MAX_WIDTH);
    const availableColumns = Math.min(columns.length, MAX_VISIBLE_COLUMNS);
    
    if (columns.length === 0) return 0;
    
    // Calculate the ideal width based on available space
    let idealWidth = containerWidth / columns.length;
    
    // If we have fewer columns than MAX_VISIBLE_COLUMNS
    if (columns.length <= MAX_VISIBLE_COLUMNS) {
      // Allow columns to expand, but not beyond MAX_COLUMN_WIDTH
      return Math.min(idealWidth, MAX_COLUMN_WIDTH);
    }
    
    // If we have more columns than MAX_VISIBLE_COLUMNS
    return containerWidth / MAX_VISIBLE_COLUMNS;
  }, [screenWidth, columns.length]);

  // Calculate table width based on number of columns and their width
  const tableWidth = useMemo(() => {
    if (columns.length === 0) return 0;
    
    const totalColumnsWidth = COLUMN_WIDTH * columns.length;
    const containerWidth = Math.min(screenWidth, MAX_WIDTH);
    
    // If we have fewer columns than MAX_VISIBLE_COLUMNS, use the actual total width
    if (columns.length <= MAX_VISIBLE_COLUMNS) {
      return Math.min(totalColumnsWidth, containerWidth);
    }
    
    // If more than MAX_VISIBLE_COLUMNS, limit width to container width
    return containerWidth;
  }, [columns.length, COLUMN_WIDTH, screenWidth]);

  const getItem = useCallback((data: any[], index: number) => data[index], []);
  const getItemCount = useCallback((data: any[]) => data.length, []);
  const keyExtractor = useCallback(
    (item: any, index: number) => index.toString(),
    []
  );

  const renderRow = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <View key={index} style={styles.row}>
        {columns.map((col, colIndex) => (
          <View key={colIndex} style={[styles.cell, { width: COLUMN_WIDTH }]}>
            <Text
              style={styles.cellText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item[col.accessor]}
            </Text>
          </View>
        ))}
      </View>
    ),
    [columns, COLUMN_WIDTH]
  );

  const TableHeader = useMemo(
    () => (
      <View style={styles.headerRow}>
        {columns.map((col, index) => (
          <View
            key={index}
            style={[
              styles.headerCell,
              {
                width: COLUMN_WIDTH,
                backgroundColor: headerColors[index % headerColors.length],
              },
            ]}
          >
            <Text
              style={styles.headerText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {col.Header}
            </Text>
          </View>
        ))}
      </View>
    ),
    [columns, COLUMN_WIDTH, headerColors]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.tableContainer, { width: tableWidth }]}>
        <ThemedTitle style={[styles.boldText]}>{name}</ThemedTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          scrollEnabled={columns.length > MAX_VISIBLE_COLUMNS}
          contentContainerStyle={[
            styles.scrollViewContent,
            columns.length <= MAX_VISIBLE_COLUMNS && { flexGrow: 1 },
          ]}
        >
          <View
            style={[
              styles.tableWrapper,
              {
                width: COLUMN_WIDTH * columns.length,
                height: tableHeight,
              },
            ]}
          >
            {TableHeader}
            <VirtualizedList
              data={data}
              renderItem={renderRow}
              keyExtractor={keyExtractor}
              getItem={getItem}
              getItemCount={getItemCount}
              initialNumToRender={ROWS_PER_BATCH}
              maxToRenderPerBatch={ROWS_PER_BATCH}
              windowSize={5}
              removeClippedSubviews={true}
              style={[styles.tableBody, { maxHeight: tableHeight - 40 }]}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </ScrollView>
        <Text style={[styles.metadataText, styles.boldText]}>
          {data.length} records
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
  },
  boldText: {
    fontWeight: "bold",
  },
  metadataText: {
    alignSelf: "flex-end",
  },
  tableContainer: {
    alignSelf: "center",
    gap: 8,
  },
  scrollViewContent: {
    justifyContent: "center",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  tableWrapper: {
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    zIndex: 1,
  },
  headerCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    overflow: "hidden",
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  tableBody: {
    flexGrow: 0,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
  },
  cellText: {
    fontSize: 14,
    color: "#000000",
  },
});