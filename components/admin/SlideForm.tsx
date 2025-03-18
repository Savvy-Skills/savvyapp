import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Text, TextInput, SegmentedButtons, Divider } from 'react-native-paper';
import ContentFormFields from './ContentFormFields';
import AssessmentFormFieldsContainer from './AssessmentFormFieldsContainer';
import { LocalSlide, AssessmentInfo, AssessmentTypes } from '@/types/index';

type SlideType = 'Content' | 'Assessment';
type ContentType = 'Text' | 'Image' | 'Video';

interface SlideFormProps {
  isEditing: boolean;
  slideForm: Partial<LocalSlide>;
  onSlideFormChange: (form: Partial<LocalSlide>) => void;
  slideType: SlideType;
  onSlideTypeChange: (type: SlideType) => void;
  contentType: ContentType;
  contentText: string;
  mediaUrl: string;
  onContentTypeChange: (type: ContentType) => void;
  onContentTextChange: (text: string) => void;
  onMediaUrlChange: (url: string) => void;
  onContentFormDataChange: (data: any) => void;
  assessmentType: AssessmentTypes;
  questionText: string;
  options: string[];
  correctAnswers: number[];
  onAssessmentTypeChange: (type: AssessmentTypes) => void;
  onQuestionTextChange: (text: string) => void;
  onOptionsChange: (options: string[]) => void;
  onCorrectAnswersChange: (answers: number[]) => void;
  onAssessmentFormDataChange: (data: Partial<AssessmentInfo>) => void;
  onOpenContentDialog: () => void;
  onOpenAssessmentDialog: () => void;
  onSave: () => void;
  onCancel: () => void;
  importedAssessment?: Partial<AssessmentInfo> | null;
  onCancelImport: () => void;
}

export default function SlideForm({
  isEditing,
  slideForm,
  onSlideFormChange,
  slideType,
  onSlideTypeChange,
  contentType,
  contentText,
  mediaUrl,
  onContentTypeChange,
  onContentTextChange,
  onMediaUrlChange,
  onContentFormDataChange,
  assessmentType,
  questionText,
  options,
  correctAnswers,
  onAssessmentTypeChange,
  onQuestionTextChange,
  onOptionsChange,
  onCorrectAnswersChange,
  onAssessmentFormDataChange,
  onOpenContentDialog,
  onOpenAssessmentDialog,
  onSave,
  onCancel,
  importedAssessment,
  onCancelImport
}: SlideFormProps) {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Card.Title title={isEditing ? "Edit Slide" : "Create New Slide"} />
        <Card.Content>
          <TextInput
            label="Slide Name"
            value={slideForm.name}
            onChangeText={(text) => onSlideFormChange({ ...slideForm, name: text })}
            style={styles.input}
          />

          <View style={styles.formSection}>
            <Text variant="titleMedium">Slide Type</Text>
            <SegmentedButtons
              value={slideType}
              onValueChange={(value) => {
                if (value !== 'Assessment' && importedAssessment) {
                  onCancelImport();
                }
                onSlideTypeChange(value as SlideType);
              }}
              buttons={[
                { value: 'Content', label: 'Content' },
                { value: 'Assessment', label: 'Assessment' }
              ]}
              style={styles.segmentedButton}
            />
          </View>
          
          <Divider style={styles.divider} />

          {/* Content options */}
          {slideType === 'Content' && (
            <>
              <View style={styles.importActions}>
                <Button 
                  mode="outlined" 
                  onPress={onOpenContentDialog}
                  style={styles.importButton}
                >
                  Import Existing Content
                </Button>
                <Text style={styles.orText}>OR</Text>
              </View>

              <ContentFormFields
                contentType={contentType}
                contentText={contentText}
                mediaUrl={mediaUrl}
                onContentTypeChange={onContentTypeChange}
                onContentTextChange={onContentTextChange}
                onMediaUrlChange={onMediaUrlChange}
                onFormDataChange={onContentFormDataChange}
              />
            </>
          )}

          {/* Assessment options */}
          {slideType === 'Assessment' && (
            <>
              {!importedAssessment ? (
                <>
                  <View style={styles.importActions}>
                    <Button 
                      mode="outlined" 
                      onPress={onOpenAssessmentDialog}
                      style={styles.importButton}
                    >
                      Import Existing Assessment
                    </Button>
                    <Text style={styles.orText}>OR</Text>
                  </View>

                  <AssessmentFormFieldsContainer
                    assessmentType={assessmentType}
                    questionText={questionText}
                    options={options}
                    correctAnswers={correctAnswers}
                    onAssessmentTypeChange={onAssessmentTypeChange}
                    onQuestionTextChange={onQuestionTextChange}
                    onOptionsChange={onOptionsChange}
                    onCorrectAnswersChange={onCorrectAnswersChange}
                    onFormDataChange={onAssessmentFormDataChange}
                  />
                </>
              ) : (
                <View style={styles.importedContainer}>
                  <View style={styles.importedHeader}>
                    <Text variant="titleMedium">Imported Assessment</Text>
                    <Button 
                      mode="text" 
                      icon="close" 
                      onPress={onCancelImport}
                      compact
                    >
                      Cancel Import
                    </Button>
                  </View>
                  
                  <Card style={styles.previewCard}>
                    <Card.Content>
                      <Text style={styles.previewLabel}>Type:</Text>
                      <Text style={styles.previewValue}>{importedAssessment.type}</Text>
                      
                      <Text style={styles.previewLabel}>Question:</Text>
                      <Text style={styles.previewValue}>{importedAssessment.text}</Text>
                      
                      {importedAssessment.options && importedAssessment.options.length > 0 && (
                        <>
                          <Text style={styles.previewLabel}>Options:</Text>
                          {importedAssessment.options.map((option, index) => (
                            <Text key={index} style={[
                              styles.previewValue, 
                              option.isCorrect && styles.correctOption
                            ]}>
                              • {option.text} {option.isCorrect ? '(Correct)' : ''}
                            </Text>
                          ))}
                        </>
                      )}
                    </Card.Content>
                  </Card>
                </View>
              )}
            </>
          )}

          <View style={styles.formActions}>
            <Button mode="outlined" onPress={onCancel} style={styles.formButton}>
              Cancel
            </Button>
            <Button mode="contained" onPress={onSave} style={styles.formButton}>
              Save
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCard: {
    padding: 8,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  formSection: {
    marginVertical: 12,
  },
  segmentedButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  importActions: {
    alignItems: 'center',
    marginBottom: 16,
  },
  importButton: {
    width: '80%',
    marginBottom: 8,
  },
  orText: {
    marginVertical: 8,
    fontWeight: 'bold',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  formButton: {
    minWidth: 100,
  },
  importedContainer: {
    marginTop: 16,
  },
  importedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
  },
  previewLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  previewValue: {
    marginBottom: 8,
  },
  correctOption: {
    color: 'green',
    fontWeight: 'bold',
  },
}); 