import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { BaseEditorProps } from './types';

export default function FillInTheBlankEditor({ 
  questionText,
  options,
  onQuestionTextChange,
  onOptionsChange,
}: BaseEditorProps) {
  const [fillBlankText, setFillBlankText] = useState(questionText);
  const [blankOptions, setBlankOptions] = useState<string[]>([]);
  const [distractorOptions, setDistractorOptions] = useState<string[]>([]);
  
  // Initialize the component with the current question text
  useEffect(() => {
    setFillBlankText(questionText);
	setDistractorOptions(options);
    processTextForBlanks(questionText);
  }, []);
  
  // Process fill in the blank text and extract blanks
  const processTextForBlanks = (text: string) => {
    const regex = /\[([^\]]+)\]/g;
    const blanks = text.match(regex) || [];
    const blanksContent = blanks.map(blank => blank.slice(1, -1));
    
    if (blanksContent.length > 0) {
      setBlankOptions(blanksContent);
      
    } else {
      setBlankOptions([]);
      setDistractorOptions(options);
    }
  };
  
  // Handle text change and update parent
  const handleFillBlankTextChange = (text: string) => {
    setFillBlankText(text);
    onQuestionTextChange(text);
    processTextForBlanks(text);
  };
  
  // Update parent with only distractor options
  useEffect(() => {
    // Only send distractors as options to the parent
    onOptionsChange(distractorOptions);
  }, [distractorOptions]);
  
  // Add a new distractor option
  const handleAddDistractor = () => {
    const newDistractors = [...distractorOptions, ''];
    setDistractorOptions(newDistractors);
  };
  
  // Update a distractor option
  const handleDistractorChange = (text: string, index: number) => {
    const newDistractors = [...distractorOptions];
    newDistractors[index] = text;
    setDistractorOptions(newDistractors);
  };
  
  // Remove a distractor option
  const handleRemoveDistractor = (index: number) => {
    const newDistractors = distractorOptions.filter((_, idx) => idx !== index);
    setDistractorOptions(newDistractors);
  };
  
  // Creates a preview version of the fill-in-blank text
  const processedFillBlankText = () => {
    return fillBlankText.replace(/\[([^\]]+)\]/g, '[ _____ ]');
  };
  
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Fill in the Blank Text</Text>
      <Text style={styles.helpText}>
        Create a text with blanks by placing words in square brackets like: "The [moon] orbits the [Earth]."
      </Text>
      
      <TextInput
        value={fillBlankText}
        onChangeText={handleFillBlankTextChange}
        multiline
        style={styles.textInput}
        placeholder="Enter text with [blanks]..."
      />
      
      {fillBlankText && (
        <View style={styles.previewContainer}>
          <Text variant="titleSmall">Preview:</Text>
          <Text style={styles.previewText}>{processedFillBlankText()}</Text>
        </View>
      )}
      
      {blankOptions.length > 0 && (
        <View style={styles.detectedBlanksContainer}>
          <Text variant="titleSmall">Detected Blanks (Correct Answers):</Text>
          {blankOptions.map((blank, index) => (
            <View key={index} style={styles.blankItem}>
              <Text style={styles.blankNumber}>{index + 1}</Text>
              <Text style={styles.blankText}>{blank}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.distractorsContainer}>
        <Text variant="titleSmall" style={{ marginVertical: 8 }}>Distractor Options (optional)</Text>
        <Text style={styles.helpText}>
          Add additional incorrect options to make the question more challenging.
          These will be mixed with the correct answers when presented to users.
        </Text>
        
        {distractorOptions.map((distractor, index) => (
          <View key={index} style={styles.optionRow}>
            <TextInput
              value={distractor}
              onChangeText={(text) => handleDistractorChange(text, index)}
              placeholder={`Distractor ${index + 1}`}
              style={styles.optionInput}
            />
            <IconButton
              icon="delete"
              onPress={() => handleRemoveDistractor(index)}
            />
          </View>
        ))}
        
        <Button
          icon="plus"
          mode="outlined"
          onPress={handleAddDistractor}
          style={{ marginTop: 8 }}
        >
          Add Distractor
        </Button>
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
  textInput: {
    marginBottom: 16,
  },
  previewContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
  },
  detectedBlanksContainer: {
    marginBottom: 16,
  },
  blankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  blankNumber: {
    width: 24,
    fontWeight: 'bold',
  },
  blankText: {
    flex: 1,
  },
  distractorsContainer: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
  },
}); 