import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';

interface DragDropEditorProps {
  categories: [string, string]; // Always exactly 2 categories
  items: [string[], string[]];  // Items for each category
  onCategoryChange: (index: 0 | 1, value: string) => void;
  onAddItem: (categoryIndex: 0 | 1) => void;
  onRemoveItem: (categoryIndex: 0 | 1, itemIndex: number) => void;
  onItemChange: (categoryIndex: 0 | 1, itemIndex: number, value: string) => void;
}

export default function DragDropEditor({
  categories,
  items,
  onCategoryChange,
  onAddItem,
  onRemoveItem,
  onItemChange
}: DragDropEditorProps) {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Drag and Drop Configuration</Text>
      <Text style={styles.helpText}>
        Create two categories and add items that belong to each. Students will drag items 
        to their correct categories.
      </Text>
      
      {/* Categories section */}
      <View style={styles.dragDropSection}>
        <Text variant="titleSmall" style={{ marginTop: 8, marginBottom: 8 }}>Categories</Text>
        
        {/* First Category */}
        <View style={styles.categoryRow}>
          <TextInput
            label="Category 1"
            value={categories[0]}
            onChangeText={(text) => onCategoryChange(0, text)}
            style={styles.categoryInput}
          />
        </View>
        
        {/* Second Category */}
        <View style={styles.categoryRow}>
          <TextInput
            label="Category 2"
            value={categories[1]}
            onChangeText={(text) => onCategoryChange(1, text)}
            style={styles.categoryInput}
          />
        </View>
      </View>
      
      {/* Render category 1 items */}
      <CategoryItemsList 
        categoryIndex={0}
        categoryName={categories[0]}
        items={items[0]}
        onAddItem={() => onAddItem(0)}
        onRemoveItem={(itemIndex) => onRemoveItem(0, itemIndex)}
        onItemChange={(itemIndex, value) => onItemChange(0, itemIndex, value)}
      />
      
      {/* Render category 2 items */}
      <CategoryItemsList 
        categoryIndex={1}
        categoryName={categories[1]}
        items={items[1]}
        onAddItem={() => onAddItem(1)}
        onRemoveItem={(itemIndex) => onRemoveItem(1, itemIndex)}
        onItemChange={(itemIndex, value) => onItemChange(1, itemIndex, value)}
      />
    </View>
  );
}

interface CategoryItemsListProps {
  categoryIndex: 0 | 1;
  categoryName: string;
  items: string[];
  onAddItem: () => void;
  onRemoveItem: (itemIndex: number) => void;
  onItemChange: (itemIndex: number, value: string) => void;
}

function CategoryItemsList({
  categoryIndex,
  categoryName,
  items,
  onAddItem,
  onRemoveItem,
  onItemChange
}: CategoryItemsListProps) {
  return (
    <View style={styles.dragDropSection}>
      <View style={styles.categoryHeader}>
        <Text variant="titleSmall" style={{ marginBottom: 8 }}>
          Items for {categoryName || `Category ${categoryIndex + 1}`}
        </Text>
        <Button
          icon="plus"
          mode="outlined"
          compact
          onPress={onAddItem}
          style={{ marginLeft: 'auto' }}
        >
          Add Item
        </Button>
      </View>
      
      {/* List all items for this category */}
      {items.map((item, index) => (
        <View key={`cat${categoryIndex}-item-${index}`} style={styles.itemRow}>
          <TextInput
            label={`Item ${index + 1}`}
            value={item}
            onChangeText={(text) => onItemChange(index, text)}
            style={styles.itemInput}
            placeholder="Enter item text"
          />
          <IconButton
            icon="delete"
            onPress={() => onRemoveItem(index)}
          />
        </View>
      ))}
      
      {items.length === 0 && (
        <Text style={[styles.helpText, { fontStyle: 'italic' }]}>
          No items added yet. Add items that belong to {categoryName || `Category ${categoryIndex + 1}`}.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  helpText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  dragDropSection: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
  },
  categoryRow: {
    marginBottom: 8,
  },
  categoryInput: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  itemInput: {
    flex: 1,
  },
}); 