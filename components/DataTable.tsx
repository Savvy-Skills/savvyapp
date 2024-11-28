import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  VirtualizedList,
} from 'react-native';
import { Text } from 'react-native-paper';
import ThemedTitle from './themed/ThemedTitle';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import type { DataTableProps } from '../types/table';
import { useTableDimensions } from '@/hooks/usetableDimensions';

const MAX_VISIBLE_COLUMNS = 4;
const ROWS_PER_BATCH = 20;
const MAX_WIDTH = 600;

export default function DataTable({
  data,
  columns,
  name,
  headerColors = [
    'rgba(123, 31, 162, 0.2)',
    'rgba(33, 150, 243, 0.2)',
    'rgba(255, 152, 0, 0.2)',
    'rgba(255, 193, 7, 0.2)',
  ],
}: DataTableProps) {
  const { tableHeight, tableWidth, columnWidth } = useTableDimensions({ columns });

  const getItem = useCallback((items: any[], index: number) => items[index], []);
  const getItemCount = useCallback((items: any[]) => items.length, []);
  const keyExtractor = useCallback((item: any, index: number) => index.toString(), []);

  const renderRow = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <TableRow
        key={index}
        item={item}
        columns={columns}
        columnWidth={columnWidth}
      />
    ),
    [columns, columnWidth]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.tableContainer, { width: tableWidth }]}>
        <ThemedTitle style={[styles.boldText, styles.title]}>{name}</ThemedTitle>
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
                width: columnWidth * columns.length,
                height: tableHeight,
              },
            ]}
          >
            <TableHeader
              columns={columns}
              columnWidth={columnWidth}
              headerColors={headerColors}
            />
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
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    alignSelf: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  metadataText: {
    alignSelf: 'flex-end',
  },
  tableContainer: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  scrollViewContent: {
    justifyContent: 'center',
  },
  tableWrapper: {
    backgroundColor: '#FFFFFF',
  },
  tableBody: {
    flexGrow: 0,
  },
});

