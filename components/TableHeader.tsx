import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { TableHeaderProps } from '../types/table';

function TableHeader({ columns, columnWidth, headerColors }: TableHeaderProps) {
  return (
    <View style={styles.headerRow}>
      {columns.map((col, index) => (
        <View
          key={index}
          style={[
            styles.headerCell,
            {
              width: columnWidth,
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
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    zIndex: 1,
  },
  headerCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    overflow: 'hidden',
    // alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
    flexShrink: 1,
  },
});

export default memo(TableHeader);

