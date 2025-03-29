import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, TextInput, Divider, Card } from 'react-native-paper';
import { Assessment, AssessmentInfo, AssessmentTypes } from '@/types/index';
import { createAssessment } from '@/services/adminApi';
import AssessmentFormFieldsContainer from './AssessmentFormFieldsContainer';
import RichTextEditorComponent from '@/components/common/RichTextEditorComponent';
import styles from '@/styles/styles';
import { Colors } from '@/constants/Colors';

interface AssessmentFormProps {
  onAssessmentCreated: (assessment: AssessmentInfo) => void;
  onCancel: () => void;
  viewId: number | null;
  initialData?: Assessment;
}

export default function AssessmentForm({
  onAssessmentCreated,
  onCancel,
  viewId
}: AssessmentFormProps) {
  // Core state
  const [assessmentType, setAssessmentType] = useState<AssessmentTypes>('Single Choice');
  const [questionText, setQuestionText] = useState('What is the answer to this question?');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([0]);
  const [assessmentFormData, setAssessmentFormData] = useState<Partial<AssessmentInfo>>({});
  const [assessmentName, setAssessmentName] = useState('New Assessment');
  const [loading, setLoading] = useState(false);
  
  // Explanation section state
  const [explanationExpanded, setExplanationExpanded] = useState(false);
  const [explanation, setExplanation] = useState('');

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
      explanation: explanation // Include explanation in the data
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
      onAssessmentCreated(createdAssessment as AssessmentInfo);
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
    <Card style={localStyles.card}>
      <Card.Title title="Create Assessment" />
      <Card.Content>
        <View style={localStyles.nameContainer}>
          <Text variant="titleMedium" style={localStyles.sectionTitle}>Assessment Name</Text>
          <TextInput
            value={assessmentName}
            onChangeText={setAssessmentName}
            placeholder="Enter assessment name"
            style={styles.input}
          />
        </View>
        
        <Divider style={localStyles.divider} />
        
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
        
        <Divider style={localStyles.divider} />
        
        {/* Explanation Section */}
        <View style={localStyles.explanationSection}>
          <Button 
            mode="outlined"
            onPress={() => setExplanationExpanded(!explanationExpanded)}
            icon={explanationExpanded ? "chevron-up" : "chevron-down"}
            style={localStyles.expandButton}
          >
            {explanationExpanded ? "Hide Explanation" : "Add Explanation (Optional)"}
          </Button>
          
          {explanationExpanded && (
            <Card style={localStyles.explanationCard}>
              <Card.Content>
                <RichTextEditorComponent
                  value={explanation}
                  onChange={setExplanation}
                  label="Explanation"
                  placeholder="Enter an explanation for the correct answer..."
                  numberOfLines={4}
                  previewHeight={60}
                  enableColors={true}
                  enableFontSize={true}
                />
              </Card.Content>
            </Card>
          )}
        </View>

        <View style={localStyles.formActions}>
          <Button 
            onPress={onCancel}
            mode="outlined"
            style={[styles.savvyButton, localStyles.cancelButton]}
          >
            Cancel
          </Button>
          <Button 
            onPress={handleSave} 
            loading={loading}
            disabled={loading || !isValid()}
            mode="contained"
            style={[styles.savvyButton, localStyles.saveButton]}
          >
            Create
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const localStyles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  nameContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    minWidth: 100,
  },
  explanationSection: {
    marginVertical: 16,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  explanationCard: {
    marginTop: 8,
  },
}); 