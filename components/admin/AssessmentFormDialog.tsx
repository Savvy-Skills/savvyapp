import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput, Divider } from 'react-native-paper';
import { Assessment, AssessmentInfo, AssessmentTypes } from '@/types/index';
import { createAssessment } from '@/services/adminApi';
import AssessmentFormFieldsContainer from './AssessmentFormFieldsContainer';

interface AssessmentFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (assessment: AssessmentInfo) => void;
  viewId: number | null;
}

export default function AssessmentFormDialog({
  visible,
  onDismiss,
  onSave,
  viewId
}: AssessmentFormDialogProps) {
  // Core state
  const [assessmentType, setAssessmentType] = useState<AssessmentTypes>('Single Choice');
  const [questionText, setQuestionText] = useState('What is the answer to this question?');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([0]);
  const [assessmentFormData, setAssessmentFormData] = useState<Partial<AssessmentInfo>>({});
  const [assessmentName, setAssessmentName] = useState('New Assessment');
  const [loading, setLoading] = useState(false);

  // Initialize form when dialog becomes visible
  useEffect(() => {
    if (visible) {
      // Set default values when creating a new assessment
      setAssessmentName('New Assessment');
      setQuestionText('What is the answer to this question?');
    }
  }, [visible]);

  // Reset form
  const resetForm = () => {
    setAssessmentType('Single Choice');
    setQuestionText('What is the answer to this question?');
    setOptions(['', '']);
    setCorrectAnswers([0]);
    setAssessmentFormData({});
    setAssessmentName('New Assessment');
    setLoading(false);
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  // Prepare assessment data based on assessment type
  const prepareAssessmentData = (): Assessment => {
    let finalAssessmentData = {
      ...assessmentFormData,
      type: assessmentType,
      text: questionText,
      slideName: assessmentName,
      buttonLabel: "Submit",
      view_id: viewId || 0,
      subtype: "Text",
      explanation: ""
    } as Assessment;

    // Structure options based on assessment type
    if (assessmentType === 'True or False') {
      finalAssessmentData.options = [
        { text: 'True', isCorrect: correctAnswers.includes(0), correctOrder: 0, match: '' },
        { text: 'False', isCorrect: correctAnswers.includes(1), correctOrder: 1, match: '' }
      ];
    } else if (assessmentType === 'Single Choice' || assessmentType === 'Multiple Choice') {
      finalAssessmentData.options = options.map((text, idx) => ({
        text,
        isCorrect: correctAnswers.includes(idx),
        correctOrder: 0,
        match: ''
      }));
    } else if (assessmentType === 'Match the Words') {
      const pairCount = Math.floor(options.length / 2);
      finalAssessmentData.options = Array.from({ length: pairCount }).flatMap((_, idx) => [
        {
          text: options[idx * 2] || '',  // Term
          isCorrect: true,
          correctOrder: idx,
          match: options[idx * 2 + 1] || '',  // Definition
        }
      ]);
    } else if (assessmentType === 'Order List') {
      finalAssessmentData.options = options.map((text, idx) => ({
        text,
        isCorrect: true,
        correctOrder: idx,
        match: ''
      }));
    } else if (assessmentType === 'Fill in the Blank') {
      // For Fill in Blank, the options should only be distractors
      // The blanks/answers are embedded in the question text with brackets
      finalAssessmentData.options = options.map(distractor => ({
        text: distractor,
        isCorrect: false, 
        correctOrder: 0,
        match: ''
      }));
    } else if (assessmentType === 'Numerical') {
      finalAssessmentData.options = [{
        text: options[0] || '0',
        isCorrect: true,
        correctOrder: 0,
        match: ''
      }];
    } else if (assessmentType === 'Drag and Drop') {
      const cat1Name = options[0] || 'Category 1';
      const cat2Name = options[1] || 'Category 2';
      
      const finalOptions: {
        text: string;
        isCorrect: boolean;
        correctOrder: number;
        match: string;
      }[] = [];
      
      // Process items for each category
      options.slice(2).filter((_, idx) => idx % 2 === 0 && options[idx+2]?.trim()).forEach((item, idx) => {
        finalOptions.push({
          text: item,
          isCorrect: true,
          correctOrder: finalOptions.length,
          match: cat1Name
        });
      });
      
      options.slice(2).filter((_, idx) => idx % 2 === 1 && options[idx+2]?.trim()).forEach((item, idx) => {
        finalOptions.push({
          text: item,
          isCorrect: true,
          correctOrder: finalOptions.length,
          match: cat2Name
        });
      });
      
      finalAssessmentData.options = finalOptions;
    } else if (assessmentType === 'Open Ended') {
      // For Open Ended, we just need to store the model answer if provided
      finalAssessmentData.options = options[0] ? [{
        text: options[0],
        isCorrect: true,
        correctOrder: 0,
        match: ''
      }] : [];
    }

    return finalAssessmentData;
  };

  const handleSave = async () => {
    if (!viewId || !assessmentName || !questionText) return;

    setLoading(true);
    try {
      // Prepare assessment data
      const finalAssessmentData = prepareAssessmentData();
      
      // Save assessment
      const createdAssessment = await createAssessment(finalAssessmentData);
      resetForm();
      onSave(createdAssessment as AssessmentInfo);
    } catch (error) {
      console.error("Error creating assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Validate form before enabling save button
  const isValid = () => {
    if (!assessmentName || !questionText || !viewId) return false;
    
    // Different types have different validation requirements
    if (assessmentType === 'Single Choice' || assessmentType === 'Multiple Choice') {
      // Need at least two options with text
      const validOptions = options.filter(opt => opt.trim()).length >= 2;
      // Need at least one correct answer
      const hasCorrectAnswer = correctAnswers.length > 0;
      return validOptions && hasCorrectAnswer;
    }
    
    if (assessmentType === 'Match the Words') {
      // Need at least one complete pair
      return options.length >= 2 && options[0]?.trim() && options[1]?.trim();
    }
    
    if (assessmentType === 'Drag and Drop') {
      // Need categories and at least one item in each
      const cat1Items = options.slice(2).filter((_, idx) => idx % 2 === 0);
      const cat2Items = options.slice(2).filter((_, idx) => idx % 2 === 1);
      return cat1Items.some(item => item.trim()) && 
             cat2Items.some(item => item.trim());
    }
    
    if (assessmentType === 'Order List') {
      // Need at least two items for ordering
      return options.filter(opt => opt.trim()).length >= 2;
    }
    
    if (assessmentType === 'Numerical') {
      // Need a valid number as the answer
      return options.length > 0 && options[0].trim() !== '' && !isNaN(Number(options[0]));
    }
    
    if (assessmentType === 'Fill in the Blank') {
      // Check if the question text contains at least one blank in [brackets]
      const hasBlanks = /\[[^\]]+\]/g.test(questionText);
      return hasBlanks;
    }
    
    if (assessmentType === 'Open Ended') {
      // Open-ended questions just need a question text
      return questionText.trim() !== '';
    }
    
    return true;
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>Create Assessment</Dialog.Title>
        <Dialog.ScrollArea style={{ maxHeight: 600 }}>
          <ScrollView>
            <View style={styles.nameContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Assessment Name</Text>
              <TextInput
                value={assessmentName}
                onChangeText={setAssessmentName}
                placeholder="Enter assessment name"
                style={styles.input}
              />
            </View>
            
            <Divider style={styles.divider} />
            
            <AssessmentFormFieldsContainer
              assessmentType={assessmentType}
              questionText={questionText}
              options={options}
              correctAnswers={correctAnswers}
              onAssessmentTypeChange={(type) => {
                setAssessmentType(type);
                // Reset options for different question types
                if (type === 'True or False') {
                  setOptions(['True', 'False']);
                  setCorrectAnswers([0]);
                } else if (type === 'Single Choice' || type === 'Multiple Choice') {
                  setOptions(['', '']);
                  setCorrectAnswers([0]);
                } else if (type === 'Match the Words') {
                  // Initialize with two empty pairs
                  setOptions(['', '', '', '']);
                  setCorrectAnswers([]);
                } else if (type === 'Drag and Drop') {
                  // Initialize with two categories
                  setOptions(['Category 1', 'Category 2']);
                  setCorrectAnswers([]);
                } else if (type === 'Order List') {
                  setOptions(['', '']);
                  setCorrectAnswers([]);
                } else if (type === 'Numerical') {
                  setOptions(['']);
                  setCorrectAnswers([0]);
                } else if (type === 'Fill in the Blank') {
                  setOptions([]);
                  setCorrectAnswers([]);
                } else if (type === 'Open Ended') {
                  setOptions(['']); // First option is for model answer (optional)
                  setCorrectAnswers([]);
                }
              }}
              onQuestionTextChange={setQuestionText}
              onOptionsChange={setOptions}
              onCorrectAnswersChange={setCorrectAnswers}
              onFormDataChange={setAssessmentFormData}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Divider />
        <Dialog.Actions style={styles.dialogActions}>
          <Button 
            onPress={handleDismiss}
            mode="outlined"
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button 
            onPress={handleSave} 
            loading={loading}
            disabled={loading || !isValid()}
            mode="contained"
            style={styles.saveButton}
          >
            Create
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 600,
    width: "100%",
    marginHorizontal: 'auto',
  },
  dialogTitle: {
    paddingBottom: 8,
  },
  nameContainer: {
    marginVertical: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  dialogActions: {
    padding: 16,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    minWidth: 100,
  },
}); 