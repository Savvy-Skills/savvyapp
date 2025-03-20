import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';
import { LocalSlide } from '@/types/index';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS,
  useAnimatedReaction,
  withSpring
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface DraggableListProps {
  slides: LocalSlide[];
  onReorder: (reorderedSlides: LocalSlide[]) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function DraggableList({ slides, onReorder, onSave, onCancel }: DraggableListProps) {
  const [localSlides, setLocalSlides] = useState<LocalSlide[]>([...slides]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const dropTargetIndex = useSharedValue<number | null>(null);
  
  // Update local slides when props change
  useEffect(() => {
    setLocalSlides([...slides]);
  }, [slides]);
  
  // Move a slide from one position to another
  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const updatedSlides = [...localSlides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);
    
    setLocalSlides(updatedSlides);
    // Call the parent component's onReorder with the updated order
    onReorder(updatedSlides);
    // Enter reordering state when changes are made
    setIsReordering(true);
  };

  return (
    <View style={styles.container}>
      {/* Removed duplicate action buttons */}
      
      {/* Drop indicator line that shows where the item will be placed */}
      {draggingIndex !== null && (
        <DropIndicator 
          dropTargetIndex={dropTargetIndex}
          draggingIndex={draggingIndex}
          numItems={localSlides.length}
        />
      )}
      
      {localSlides.map((slide, index) => (
        <DraggableItem 
          key={slide.slide_id} 
          slide={slide} 
          index={index}
          moveSlide={moveSlide}
          totalSlides={localSlides.length}
          onDragStart={() => {
            setDraggingIndex(index);
            // Enter reordering state on drag start
            setIsReordering(true);
          }}
          onDragEnd={() => setDraggingIndex(null)}
          dropTargetIndex={dropTargetIndex}
        />
      ))}
    </View>
  );
}

interface DropIndicatorProps {
  dropTargetIndex: Animated.SharedValue<number | null>;
  draggingIndex: number;
  numItems: number;
}

function DropIndicator({ dropTargetIndex, draggingIndex, numItems }: DropIndicatorProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (dropTargetIndex.value === null) {
      return { 
        height: 0,
        opacity: 0 
      };
    }
    
    // Determine if we're dragging up or down
    const isDraggingDown = draggingIndex < dropTargetIndex.value;
    
    // Adjust position based on drag direction
    // For dragging down (lower to higher), place indicator at bottom of target
    // For dragging up (higher to lower), place indicator at top of target
    const itemHeight = 60;
    const itemMargin = 8;
    const basePosition = dropTargetIndex.value * (itemHeight + itemMargin);
    
    // If dragging down, adjust to bottom of target item
    const adjustedPosition = isDraggingDown ? basePosition + itemHeight : basePosition;
    
    return {
      height: 4, // Height of the indicator
      opacity: 1,
      transform: [
        { translateY: adjustedPosition }
      ]
    };
  });
  
  return (
    <Animated.View style={[styles.dropIndicator, animatedStyle]} />
  );
}

interface DraggableItemProps {
  slide: LocalSlide;
  index: number;
  moveSlide: (fromIndex: number, toIndex: number) => void;
  totalSlides: number;
  onDragStart: () => void;
  onDragEnd: () => void;
  dropTargetIndex: Animated.SharedValue<number | null>;
}

function DraggableItem({ 
  slide, 
  index, 
  moveSlide, 
  totalSlides,
  onDragStart,
  onDragEnd,
  dropTargetIndex
}: DraggableItemProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const initialPositionY = useSharedValue(0);
  const rowHeight = 60; // Height of each row
  
  // Calculate which index the item is being dragged over
  const calculateDropIndex = (y: number) => {
    // Convert current position to potential index
    const startOffset = initialPositionY.value;
    const currentOffset = startOffset + y;
    let potentialIndex = Math.round(currentOffset / rowHeight);
    
    // Clamp to valid range
    potentialIndex = Math.max(0, Math.min(totalSlides - 1, potentialIndex));
    
    return potentialIndex;
  };
  
  // Create the pan gesture using the new Gesture API
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      initialPositionY.value = index * rowHeight;
      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
      translateX.value = event.translationX;
      
      // Update the drop target indicator
      const potentialIndex = calculateDropIndex(event.translationY);
      dropTargetIndex.value = potentialIndex;
    })
    .onEnd((event) => {
      const finalDropIndex = calculateDropIndex(event.translationY);
      
      // Check if we've moved far enough horizontally to consider it a valid drop
      const isValidDrop = Math.abs(event.translationX) < 100; // Allow some horizontal movement
      
      if (isValidDrop && finalDropIndex !== index) {
        runOnJS(moveSlide)(index, finalDropIndex);
      }
      
      // Animate back to original position
      translateY.value = withSpring(0);
      translateX.value = withSpring(0);
      isDragging.value = false;
      dropTargetIndex.value = null;
      runOnJS(onDragEnd)();
    });
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: isDragging.value ? 1.03 : 1 }
      ],
      zIndex: isDragging.value ? 100 : 1,
      shadowOpacity: withTiming(isDragging.value ? 0.2 : 0),
      shadowRadius: isDragging.value ? 8 : 0,
      elevation: isDragging.value ? 5 : 0,
      backgroundColor: withTiming(isDragging.value ? '#F5F5F5' : 'white'),
    };
  });
  
  return (
    <Animated.View style={[styles.draggableItem, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.itemContent}>
          <IconButton 
            icon="drag-vertical" 
            size={24} 
            style={styles.dragHandle}
          />
          
          <View style={styles.slideInfo}>
            <Text style={styles.slideTitle}>{slide.name}</Text>
            <Text style={styles.slideType}>{slide.type}</Text>
          </View>
          
          <Text style={styles.orderNumber}>{index + 1}</Text>
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    position: 'relative',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  draggableItem: {
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  dragHandle: {
    marginRight: 8,
  },
  slideInfo: {
    flex: 1,
  },
  slideTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  slideType: {
    fontSize: 14,
    color: '#666',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  dropIndicator: {
    position: 'absolute',
    left: 16, // Match container padding
    right: 16, // Match container padding
    height: 4,
    backgroundColor: '#2196F3',
    borderRadius: 2,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
}); 