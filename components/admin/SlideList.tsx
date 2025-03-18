import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, DataTable, Text } from 'react-native-paper';
import { LocalSlide } from '@/types/index';

interface SlideListProps {
  slides: LocalSlide[];
  loading: boolean;
  onEditSlide: (slide: LocalSlide) => void;
  onDisableSlide: (slideId: number) => void;
}

export default function SlideList({ slides, loading, onEditSlide, onDisableSlide }: SlideListProps) {
  if (loading) {
    return <Text>Loading slides...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title>Type</DataTable.Title>
          <DataTable.Title>Subtype</DataTable.Title>
          <DataTable.Title>Order</DataTable.Title>
          <DataTable.Title>Actions</DataTable.Title>
        </DataTable.Header>

        {slides.map((slide, index) => (
          <DataTable.Row key={slide.slide_id}>
            <DataTable.Cell>{slide.name}</DataTable.Cell>
            <DataTable.Cell>{slide.type}</DataTable.Cell>
            <DataTable.Cell>
              {slide.type === 'Content'
                ? (slide as any).content_info?.type
                : (slide as any).assessment_info?.type}
            </DataTable.Cell>
            <DataTable.Cell>{index + 1}</DataTable.Cell>
            <DataTable.Cell>
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={() => onEditSlide(slide)}
                  style={styles.actionButton}
                >
                  Edit
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => onDisableSlide(slide.slide_id)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  Disable
                </Button>
              </View>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    marginHorizontal: 4,
  },
  deleteButton: {
    borderColor: 'red',
    color: 'red',
  },
}); 