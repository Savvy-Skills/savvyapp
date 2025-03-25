import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput, Divider, Card, IconButton, ToggleButton } from 'react-native-paper';
import { Assessment, AssessmentInfo, AssessmentTypes } from '@/types/index';
import { createAssessment } from '@/services/adminApi';
import AssessmentFormFieldsContainer from './AssessmentFormFieldsContainer';
import RichText from '@/components/slides/RichTextComponent';
import RichTextEditorComponent from '@/components/common/RichTextEditorComponent';

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
  
  // Explanation section state
  const [explanationExpanded, setExplanationExpanded] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explSelection, setExplSelection] = useState({ start: 0, end: 0 });
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [history, setHistory] = useState<string[]>([]);

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
    setExplanation('');
    setExplanationExpanded(false);
    setActiveStyles({ bold: false, italic: false, underline: false });
    setHistory([]);
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

  // Find if the current selection is entirely within a style tag
  const findContainingStyleTag = (text: string, selStart: number, selEnd: number) => {
    const tags = findStyleTags(text);
    
    for (const tag of tags) {
      if (selStart >= tag.contentStart && selEnd <= tag.contentEnd) {
        return tag;
      }
    }
    
    return null;
  };

  // Find all style tags in the text and their positions
  const findStyleTags = (input: string) => {
    const regex = /\[style=(\{.*?\})\](.*?)\[\/style\]/g;
    const tags = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
      try {
        const style = JSON.parse(match[1]);
        tags.push({
          start: match.index,
          end: match.index + match[0].length,
          contentStart: match.index + `[style=${match[1]}]`.length,
          contentEnd: match.index + match[0].length - '[/style]'.length,
          styleString: match[1],
          style
        });
      } catch (e) {
        console.warn(`Invalid style string: ${match[1]}`);
      }
    }

    return tags;
  };

  // Apply style to selected text
  const applyStyle = (styleKey: string, styleValue: any) => {
    if (explSelection.start !== explSelection.end) {
      // Save current state to history before updating
      setHistory([...history, explanation]);
      
      const containingTag = findContainingStyleTag(explanation, explSelection.start, explSelection.end);
      
      if (containingTag) {
        // Clone the existing style
        const currentStyle = { ...containingTag.style } as any;
        
        // Toggle the style property
        if (currentStyle[styleKey] === styleValue) {
          delete currentStyle[styleKey];
        } else {
          currentStyle[styleKey] = styleValue;
        }
        
        // Create new style string and update text
        const newStyleString = JSON.stringify(currentStyle);
        const fullContent = explanation.substring(containingTag.contentStart, containingTag.contentEnd);
        
        const newText = 
          explanation.substring(0, containingTag.start) + 
          `[style=${newStyleString}]${fullContent}[/style]` + 
          explanation.substring(containingTag.end);
        
        setExplanation(newText);
      } else {
        // No containing tag, just add the style
        const styleObject = { [styleKey]: styleValue } as any;
        const selectedText = explanation.substring(explSelection.start, explSelection.end);
        const styleTag = `[style=${JSON.stringify(styleObject)}]${selectedText}[/style]`;
        
        const newText = 
          explanation.substring(0, explSelection.start) + 
          styleTag + 
          explanation.substring(explSelection.end);
        
        setExplanation(newText);
      }
    }
  };

  const toggleBold = () => applyStyle('fontWeight', 'bold');
  const toggleItalic = () => applyStyle('fontStyle', 'italic');
  const toggleUnderline = () => applyStyle('textDecorationLine', 'underline');
  
  const undo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setExplanation(previousState);
    }
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
            
            <Divider style={styles.divider} />
            
            {/* Explanation Section */}
            <View style={styles.explanationSection}>
              <Button 
                mode="outlined"
                onPress={() => setExplanationExpanded(!explanationExpanded)}
                icon={explanationExpanded ? "chevron-up" : "chevron-down"}
                style={styles.expandButton}
              >
                {explanationExpanded ? "Hide Explanation" : "Add Explanation (Optional)"}
              </Button>
              
              {explanationExpanded && (
                <Card style={styles.explanationCard}>
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
  explanationSection: {
    marginVertical: 16,
    paddingHorizontal: 24,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  explanationCard: {
    marginTop: 8,
  },
  toolbar: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  explanationInput: {
    marginBottom: 16,
  },
  previewTitle: {
    marginBottom: 8,
  },
  previewContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 60,
  },
}); 