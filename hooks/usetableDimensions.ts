import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import type { TableDimensionsProps } from '../types/table';
import { SLIDE_MAX_WIDTH } from '@/constants/Utils';

const MAX_VISIBLE_COLUMNS = 4;
const MAX_WIDTH = SLIDE_MAX_WIDTH;
const MAX_COLUMN_WIDTH = 150;

export function useTableDimensions({ columns }: Pick<TableDimensionsProps, 'columns'>) {
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const tableHeight = screenHeight * 0.25;

  const columnWidth = useMemo(() => {
    const containerWidth = Math.min(screenWidth, MAX_WIDTH);
    const availableColumns = Math.min(columns.length, MAX_VISIBLE_COLUMNS);
    
    if (columns.length === 0) return 0;
    
    let idealWidth = containerWidth / columns.length;
    
    if (columns.length <= MAX_VISIBLE_COLUMNS) {
      return Math.min(idealWidth, MAX_COLUMN_WIDTH);
    }
    
    return containerWidth / MAX_VISIBLE_COLUMNS;
  }, [screenWidth, columns.length]);

  const tableWidth = useMemo(() => {
    if (columns.length === 0) return 0;
    
    const totalColumnsWidth = columnWidth * columns.length;
    const containerWidth = Math.min(screenWidth, MAX_WIDTH);
    
    if (columns.length <= MAX_VISIBLE_COLUMNS) {
      return Math.min(totalColumnsWidth, containerWidth);
    }
    
    return containerWidth;
  }, [columns.length, columnWidth, screenWidth]);

  return {
    tableHeight,
    tableWidth,
    columnWidth,
    screenWidth,
  };
}

