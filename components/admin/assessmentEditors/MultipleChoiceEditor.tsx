import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, IconButton, Checkbox } from 'react-native-paper';
import { BaseEditorProps } from './types';

export default function MultipleChoiceEditor({ 
  options,
  correctAnswers,
  onOptionsChange,
  onCorrectAnswersChange
}: BaseEditorProps) {
  
  const handleOptionChange = (text: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = text;
    onOptionsChange(newOptions);
  };
  
  const handleAddOption = () => {
    onOptionsChange([...options, '']);
  };
  
  const handleRemoveOption = (index: number) => {
    // Update options array
    const newOptions = options.filter((_, idx) => idx !== index);
    onOptionsChange(newOptions);
    
    // Update correct answers if needed
    if (correctAnswers.includes(index)) {
      const newCorrectAnswers = correctAnswers.filter(answer => answer !== index)
        .map(answer => answer > index ? answer - 1 : answer);
      onCorrectAnswersChange(newCorrectAnswers);
    } else if (correctAnswers.some(answer => answer > index)) {
      // Adjust indices for answers that come after the removed item
      const newCorrectAnswers = correctAnswers.map(answer => 
        answer > index ? answer - 1 : answer
      );
      onCorrectAnswersChange(newCorrectAnswers);
    }
  };
  
  const toggleCorrectAnswer = (index: number) => {
    const newCorrectAnswers = [...correctAnswers];
    const answerIndex = newCorrectAnswers.indexOf(index);
    
    if (answerIndex > -1) {
      // Remove from correct answers
      newCorrectAnswers.splice(answerIndex, 1);
    } else {
      // Add to correct answers
      newCorrectAnswers.push(index);
    }
    
    onCorrectAnswersChange(newCorrectAnswers);
  };
  
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Options</Text>
      <Text style={styles.helpText}>
        Add answer options and select all correct ones.
      </Text>
      
      {options.map((option, index) => (
        <View key={index} style={styles.optionRow}>
          <Checkbox
            status={correctAnswers.includes(index) ? 'checked' : 'unchecked'}
            onPress={() => toggleCorrectAnswer(index)}
          />
          <TextInput
            value={option}
            onChangeText={(text) => handleOptionChange(text, index)}
            placeholder={`Option ${index + 1}`}
            style={styles.optionInput}
          />
          <IconButton
            icon="delete"
            onPress={() => handleRemoveOption(index)}
            disabled={options.length <= 2}
          />
        </View>
      ))}
      
      <View style={styles.addButtonContainer}>
        <IconButton
          icon="plus"
          mode="outlined"
          containerColor="#f0f0f0"
          size={20}
          onPress={handleAddOption}
        />
        <Text>Add Option</Text>
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
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginLeft: 8,
  },
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
}); 