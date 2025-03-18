import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { BaseEditorProps } from './types';

export default function MatchWordsEditor({ 
  options,
  onOptionsChange
}: BaseEditorProps) {
  
  // Ensure we have at least one pair to start with
  useEffect(() => {
    if (options.length < 2) {
      onOptionsChange(['', '']);
    }
  }, []);
  
  // Add a new matching pair
  const handleAddPair = () => {
    onOptionsChange([...options, '', '']);
  };
  
  // Handle changes to term or definition
  const handleItemChange = (text: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = text;
    onOptionsChange(newOptions);
  };
  
  // Remove a pair
  const handleRemovePair = (pairIndex: number) => {
    const termIndex = pairIndex * 2;
    const defIndex = termIndex + 1;
    
    const newOptions = [...options];
    newOptions.splice(termIndex, 2); // Remove both term and definition
    onOptionsChange(newOptions);
  };
  
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Matching Pairs</Text>
      <Text style={styles.helpText}>
        Create pairs of items that students will need to match together. 
        The left items will be displayed in one color, and the right items in another.
      </Text>
      
      {/* Display pairs */}
      {Array.from({ length: Math.floor(options.length / 2) }).map((_, pairIndex) => {
        const termIndex = pairIndex * 2;
        const defIndex = termIndex + 1;
        
        return (
          <View key={pairIndex} style={styles.pairRow}>
            <TextInput
              label="Term"
              value={options[termIndex] || ''}
              onChangeText={(text) => handleItemChange(text, termIndex)}
              style={styles.pairInput}
              placeholder="Term"
            />
            <Text style={styles.pairConnector}>↔</Text>
            <TextInput
              label="Definition"
              value={options[defIndex] || ''}
              onChangeText={(text) => handleItemChange(text, defIndex)}
              style={styles.pairInput}
              placeholder="Definition"
            />
            <IconButton
              icon="delete"
              onPress={() => handleRemovePair(pairIndex)}
              disabled={options.length <= 4} // Minimum 2 pairs
            />
          </View>
        );
      })}
      
      <Button
        icon="plus"
        mode="outlined"
        onPress={handleAddPair}
        style={{ marginTop: 16 }}
      >
        Add Pair
      </Button>
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
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pairInput: {
    flex: 1,
  },
  pairConnector: {
    marginHorizontal: 8,
    fontSize: 20,
  },
}); 