import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator, VirtualizedList } from 'react-native';
import { useDataFetch } from '@/hooks/useDataFetch';

type DataTableProps = {
  source: string;
  isCSV?: boolean;
  headerColors?: string[];
};

const MAX_VISIBLE_COLUMNS = 4;
const ROWS_PER_BATCH = 20; // Number of rows to render at once

export default function DataTable({ 
  source, 
  isCSV = true, 
  headerColors = ['#7B1FA2', '#2196F3', '#FF9800', '#FFC107']
}: DataTableProps) {
  const { data, columns, isLoading, error } = useDataFetch(source, isCSV);

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const tableHeight = screenHeight * 0.25;
  const maxTableWidth = Math.min(screenWidth, 600);
  
  const colWidth = useMemo(() => 
    columns.length <= MAX_VISIBLE_COLUMNS 
      ? maxTableWidth / columns.length 
      : maxTableWidth / MAX_VISIBLE_COLUMNS,
    [columns.length, maxTableWidth]
  );

  const getItem = useCallback((data: any[], index: number) => data[index], []);
  const getItemCount = useCallback((data: any[]) => data.length, []);
  const keyExtractor = useCallback((item: any, index: number) => index.toString(), []);

  const renderRow = useCallback(({ item, index }: { item: any, index: number }) => (
    <View key={index} style={styles.row}>
      {columns.map((col, colIndex) => (
        <View 
          key={colIndex} 
          style={[styles.cell, { width: colWidth }]}
        >
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
  ), [columns, colWidth]);

  const TableHeader = useMemo(() => (
    <View style={styles.headerRow}>
      {columns.map((col, index) => (
        <View 
          key={index} 
          style={[
            styles.headerCell, 
            { 
              width: colWidth,
              backgroundColor: headerColors[index % headerColors.length] 
            }
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
  ), [columns, colWidth, headerColors]);

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
    <View style={[styles.container, { height: tableHeight }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        scrollEnabled={columns.length > MAX_VISIBLE_COLUMNS}
      >
        <View style={[
          styles.tableWrapper,
          columns.length <= MAX_VISIBLE_COLUMNS && { width: maxTableWidth }
        ]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableWrapper: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    zIndex: 1,
  },
  headerCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    overflow: 'hidden',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  tableBody: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  cellText: {
    fontSize: 14,
  },
});