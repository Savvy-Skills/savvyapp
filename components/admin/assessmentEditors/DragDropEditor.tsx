import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { BaseEditorProps } from './types';

export default function DragDropEditor({ 
  options,
  onOptionsChange
}: BaseEditorProps) {
  // Parse the options array into a more manageable structure
  // First two items are category names, remaining items alternate between categories
  const [categories, setCategories] = useState<[string, string]>(['Category 1', 'Category 2']);
  const [categoryItems, setCategoryItems] = useState<[string[], string[]]>([[], []]);
  
  // Initialize from options when component mounts or options change externally
  useEffect(() => {
    if (options.length >= 2) {
      // Extract category names
      const cat1 = options[0] || 'Category 1';
      const cat2 = options[1] || 'Category 2';
      
      // Extract items for each category
      const cat1Items = options.slice(2).filter((_, idx) => idx % 2 === 0);
      const cat2Items = options.slice(2).filter((_, idx) => idx % 2 === 1);
      
      setCategories([cat1, cat2]);
      setCategoryItems([cat1Items, cat2Items]);
    } else {
      // Initialize with defaults if not enough options provided
      setCategories(['Category 1', 'Category 2']);
      setCategoryItems([[], []]);
      
      // Update options to reflect default state
      onOptionsChange(['Category 1', 'Category 2']);
    }
  }, []);
  
  // Convert our internal state back to the options array format and update parent
  const updateOptions = (
    newCategories: [string, string] = categories, 
    newItems: [string[], string[]] = categoryItems
  ) => {
    // Start with category names
    const newOptions = [...newCategories];
    
    // Interleave items from both categories
    const maxItems = Math.max(newItems[0].length, newItems[1].length);
    
    for (let i = 0; i < maxItems; i++) {
      if (i < newItems[0].length) newOptions.push(newItems[0][i]);
      else newOptions.push(''); // Padding for category 1
      
      if (i < newItems[1].length) newOptions.push(newItems[1][i]);
      else newOptions.push(''); // Padding for category 2
    }
    
    onOptionsChange(newOptions);
  };
  
  // Handle category name changes
  const handleCategoryChange = (index: 0 | 1, value: string) => {
    const newCategories: [string, string] = [...categories] as [string, string];
    newCategories[index] = value;
    setCategories(newCategories);
    updateOptions(newCategories);
  };
  
  // Handle adding an item to a category
  const handleAddItem = (categoryIndex: 0 | 1) => {
    const newItems: [string[], string[]] = [
      [...categoryItems[0]],
      [...categoryItems[1]]
    ];
    newItems[categoryIndex].push('');
    setCategoryItems(newItems);
    updateOptions(categories, newItems);
  };
  
  // Handle removing an item from a category
  const handleRemoveItem = (categoryIndex: 0 | 1, itemIndex: number) => {
    const newItems: [string[], string[]] = [
      [...categoryItems[0]],
      [...categoryItems[1]]
    ];
    newItems[categoryIndex].splice(itemIndex, 1);
    setCategoryItems(newItems);
    updateOptions(categories, newItems);
  };
  
  // Handle changes to an item's text
  const handleItemChange = (categoryIndex: 0 | 1, itemIndex: number, value: string) => {
    const newItems: [string[], string[]] = [
      [...categoryItems[0]],
      [...categoryItems[1]]
    ];
    newItems[categoryIndex][itemIndex] = value;
    setCategoryItems(newItems);
    updateOptions(categories, newItems);
  };
  
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
        
        {/* Category 1 */}
        <View style={styles.categoryRow}>
          <TextInput
            label="Category 1"
            value={categories[0]}
            onChangeText={(text) => handleCategoryChange(0, text)}
            style={styles.categoryInput}
          />
        </View>
        
        {/* Category 2 */}
        <View style={styles.categoryRow}>
          <TextInput
            label="Category 2"
            value={categories[1]}
            onChangeText={(text) => handleCategoryChange(1, text)}
            style={styles.categoryInput}
          />
        </View>
      </View>
      
      {/* Items for Category 1 */}
      <View style={styles.dragDropSection}>
        <View style={styles.categoryHeader}>
          <Text variant="titleSmall">Items for {categories[0]}</Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => handleAddItem(0)}
          />
        </View>
        
        {categoryItems[0].map((item, index) => (
          <View key={`cat1-item-${index}`} style={styles.itemRow}>
            <TextInput
              value={item}
              onChangeText={(text) => handleItemChange(0, index, text)}
              placeholder={`Item ${index + 1}`}
              style={styles.itemInput}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleRemoveItem(0, index)}
            />
          </View>
        ))}
        
        {categoryItems[0].length === 0 && (
          <Text style={styles.emptyMessage}>No items yet. Click + to add items.</Text>
        )}
      </View>
      
      {/* Items for Category 2 */}
      <View style={styles.dragDropSection}>
        <View style={styles.categoryHeader}>
          <Text variant="titleSmall">Items for {categories[1]}</Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => handleAddItem(1)}
          />
        </View>
        
        {categoryItems[1].map((item, index) => (
          <View key={`cat2-item-${index}`} style={styles.itemRow}>
            <TextInput
              value={item}
              onChangeText={(text) => handleItemChange(1, index, text)}
              placeholder={`Item ${index + 1}`}
              style={styles.itemInput}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleRemoveItem(1, index)}
            />
          </View>
        ))}
        
        {categoryItems[1].length === 0 && (
          <Text style={styles.emptyMessage}>No items yet. Click + to add items.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  helpText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 14,
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
  emptyMessage: {
    fontStyle: 'italic',
    opacity: 0.5,
    textAlign: 'center',
    padding: 16,
  }
}); 