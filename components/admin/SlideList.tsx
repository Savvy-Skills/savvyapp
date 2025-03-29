import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, DataTable, Text, Checkbox } from 'react-native-paper';
import { LocalSlide } from '@/types/index';
import styles from '@/styles/styles';
import { Colors } from '@/constants/Colors';
import { Card } from 'react-native-paper';

interface SlideListProps {
  slides: LocalSlide[];
  loading: boolean;
  onEditSlide: (slide: LocalSlide) => void;
  onDisableSlide: (slideId: number) => void;
  onRemoveSlide: (slide: LocalSlide) => void;
  selectedSlides?: number[];
  onSelectSlide?: (slideId: number, isSelected: boolean) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export default function SlideList({ 
  slides= [], 
  loading, 
  onEditSlide, 
  onDisableSlide, 
  onRemoveSlide, 
  selectedSlides = [], 
  onSelectSlide,
  onSelectAll,
  onDeselectAll
}: SlideListProps) {
  if (loading) {
    return <Text>Loading slides...</Text>;
  }

  const hasSelectedSlides = selectedSlides.length > 0;
  const allSlidesSelected = selectedSlides.length === slides.length;
  
  const toggleAllSelection = () => {
    if (hasSelectedSlides) {
      onDeselectAll && onDeselectAll();
    } else {
      onSelectAll && onSelectAll();
    }
  };

  const renderItem = ({ item }: { item: LocalSlide }) => {
    const isSelected = selectedSlides?.includes(item.slide_id) || false;
    
    return (
      <Card style={[localStyles.slideCard, isSelected && localStyles.selectedCard]} key={item.slide_id}>
        <Card.Content>
          <View style={localStyles.slideHeader}>
            {selectedSlides !== undefined && onSelectSlide && (
              <Checkbox
                status={isSelected ? 'checked' : 'unchecked'}
                onPress={() => onSelectSlide(item.slide_id, !isSelected)}
              />
            )}
            <View style={localStyles.slideInfo}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall">Type: {item.type}</Text>
            </View>
            <View style={localStyles.actionButtons}>
              <Button
                icon="pencil"
                mode="outlined"
                onPress={() => onEditSlide(item)}
                style={localStyles.actionButton}
              >
                Edit
              </Button>
              <Button
                icon="delete"
                mode="outlined"
                onPress={() => onRemoveSlide(item)}
                style={[localStyles.actionButton, localStyles.removeButton]}
              >
                Remove
              </Button>
            </View>
          </View>
          
          {/* Rest of the card content */}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={localStyles.container}>
      <DataTable>
        <DataTable.Header>
          {selectedSlides !== undefined && onSelectSlide && (
            <DataTable.Title style={[localStyles.checkboxColumn]}>
              <Checkbox
                status={hasSelectedSlides ? 'checked' : 'unchecked'}
                onPress={toggleAllSelection}
              />
            </DataTable.Title>
          )}
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title>Type</DataTable.Title>
          <DataTable.Title>Subtype</DataTable.Title>
          <DataTable.Title>Order</DataTable.Title>
          <DataTable.Title>Actions</DataTable.Title>
        </DataTable.Header>

        {slides.map((slide, index) => {
          const isSelected = selectedSlides?.includes(slide.slide_id) || false;
          
          return (
            <DataTable.Row 
              key={slide.slide_id} 
              style={isSelected ? localStyles.selectedRow : undefined}
            >
              {selectedSlides !== undefined && onSelectSlide && (
                <DataTable.Cell style={localStyles.checkboxColumn}>
                  <Checkbox
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => onSelectSlide(slide.slide_id, !isSelected)}
                  />
                </DataTable.Cell>
              )}
              <DataTable.Cell>{slide.name}</DataTable.Cell>
              <DataTable.Cell>{slide.type}</DataTable.Cell>
              <DataTable.Cell>
                {slide.type === 'Content'
                  ? (slide as any).contents.map((content: any) => content.type).join(', ')
                  : (slide as any).assessment_info?.type}
              </DataTable.Cell>
              <DataTable.Cell>{index + 1}</DataTable.Cell>
              <DataTable.Cell>
                <View style={localStyles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => onEditSlide(slide)}
                    style={[styles.savvyButton, localStyles.actionButton]}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => onRemoveSlide(slide)}
                    style={[styles.savvyButton, localStyles.actionButton, localStyles.removeButton]}
                  >
                    Remove
                  </Button>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideCard: {
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    
  },
  deleteButton: {
    borderColor: 'red',
    color: 'red',
  },
  removeButton: {
    borderColor: Colors.revealedButton,
    color: Colors.revealedButton,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slideInfo: {
    flex: 1,
    marginLeft: 8,
  },
  checkboxColumn: {
    maxWidth: 50,
    justifyContent: 'center',
  },
  selectedRow: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
}); 