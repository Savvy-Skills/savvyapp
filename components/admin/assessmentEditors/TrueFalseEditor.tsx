import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { BaseEditorProps } from './types';

export default function TrueFalseEditor({ 
  options, 
  correctAnswers, 
  onOptionsChange, 
  onCorrectAnswersChange,
  onFormDataChange
}: BaseEditorProps) {
  
  // Set default options if not already set
  useEffect(() => {
    if (options.length !== 2 || options[0] !== 'True' || options[1] !== 'False') {
      onOptionsChange(['True', 'False']);
      if (correctAnswers.length === 0) {
        onCorrectAnswersChange([0]); // Default to 'True' as correct
      }
    }
  }, []);
  
  return (
    <View style={styles.trueFalseContainer}>
      <Text variant="titleMedium" style={{ marginBottom: 16 }}>Correct Answer</Text>
      
      <View style={styles.segmentedButtonContainer}>
        <Button
          mode={correctAnswers[0] === 0 ? 'contained' : 'outlined'}
          onPress={() => onCorrectAnswersChange([0])}
          style={[styles.segmentedButton, { borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
        >
          True
        </Button>
        <Button
          mode={correctAnswers[0] === 1 ? 'contained' : 'outlined'}
          onPress={() => onCorrectAnswersChange([1])}
          style={[styles.segmentedButton, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
        >
          False
        </Button>
      </View>
      
      <Text style={styles.helpText}>
        The statement above will be presented to students who must determine if it's true or false.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  trueFalseContainer: {
    marginVertical: 16,
  },
  segmentedButtonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  segmentedButton: {
    flex: 1,
    borderRadius: 4,
  },
  helpText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 14,
    marginBottom: 8,
  },
}); 