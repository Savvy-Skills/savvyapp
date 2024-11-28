import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { TableRowProps } from '../types/table';

function TableRow({ item, columns, columnWidth }: TableRowProps) {
  return (
    <View style={styles.row}>
      {columns.map((col, colIndex) => (
        <View key={colIndex} style={[styles.cell, { width: columnWidth }]}>
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
  );
}

const styles = StyleSheet.create({
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
    color: '#000000',
  },
});

export default memo(TableRow);

