import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { BaseEditorProps } from './types';

export default function OrderListEditor({ 
  options,
  onOptionsChange
}: BaseEditorProps) {
  
  // Add a new item to the order list
  const handleAddItem = () => {
    onOptionsChange([...options, '']);
  };
  
  // Update an item's text
  const handleItemChange = (text: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = text;
    onOptionsChange(newOptions);
  };
  
  // Remove an item from the list
  const handleRemoveItem = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onOptionsChange(newOptions);
  };
  
  // Move an item up or down in the list
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === options.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newOptions = [...options];
    
    // Swap the items
    [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
    onOptionsChange(newOptions);
  };
  
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Order List Items</Text>
      <Text style={styles.helpText}>
        Add items in the correct order. Students will need to drag them into this sequence.
      </Text>
      
      {options.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <View style={styles.positionBadge}>
            <Text style={styles.positionNumber}>{index + 1}</Text>
          </View>
          <TextInput
            value={item}
            onChangeText={(text) => handleItemChange(text, index)}
            placeholder={`Item ${index + 1}`}
            style={styles.itemInput}
          />
          <View style={styles.actionButtons}>
            <IconButton
              icon="arrow-up"
              size={20}
              onPress={() => moveItem(index, 'up')}
              disabled={index === 0}
            />
            <IconButton
              icon="arrow-down"
              size={20}
              onPress={() => moveItem(index, 'down')}
              disabled={index === options.length - 1}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleRemoveItem(index)}
              disabled={options.length <= 2}
            />
          </View>
        </View>
      ))}
      
      <View style={styles.addButtonContainer}>
        <IconButton
          icon="plus"
          mode="outlined"
          containerColor="#f0f0f0"
          size={20}
          onPress={handleAddItem}
        />
        <Text>Add Item</Text>
      </View>
      
      <Text style={styles.helpText}>
        The order shown here is the correct sequence. Items will be presented in random order to students.
      </Text>
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
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 4,
  },
  positionBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  positionNumber: {
    fontWeight: 'bold',
  },
  itemInput: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
}); 