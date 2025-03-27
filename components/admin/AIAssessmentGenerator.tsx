import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Card, Button, Text, TextInput, Chip, Portal, Modal, IconButton, Divider, Surface } from 'react-native-paper';
import Dropdown from '@/components/common/Dropdown';
import { Assessment, AssessmentInfo, AssessmentTypes } from '@/types/index';
import { createAssessment } from '@/services/adminApi';
import AssessmentFormDialog from './AssessmentFormDialog';

// You'll need to implement this endpoint in your API
import { generateAssessments } from '@/services/aiApi';

interface AIAssessmentGeneratorProps {
  viewId: number;
  onAssessmentsCreated: (assessments: AssessmentInfo[]) => void;
}

export default function AIAssessmentGenerator({ viewId, onAssessmentsCreated }: AIAssessmentGeneratorProps) {
  // Form state
  const [contentTopic, setContentTopic] = useState('');
  const [description, setDescription] = useState('');
  const [concepts, setConcepts] = useState<string[]>([]);
  const [conceptInput, setConceptInput] = useState('');
  const [gradeLevel, setGradeLevel] = useState('K-12');
  const [tone, setTone] = useState('educational');
  
  // Results state
  const [generatedAssessments, setGeneratedAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [currentEditingAssessment, setCurrentEditingAssessment] = useState<Assessment | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  
  // Define grade level options
  const gradeLevelOptions = [
    { label: 'K-2', value: 'K-2' },
    { label: '3-5', value: '3-5' },
    { label: '6-8', value: '6-8' },
    { label: '9-12', value: '9-12' },
    { label: 'K-12 (General)', value: 'K-12' },
  ];
  
  // Define tone options
  const toneOptions = [
    { label: 'Educational', value: 'educational' },
    { label: 'Conversational', value: 'conversational' },
    { label: 'Engaging', value: 'engaging' },
    { label: 'Playful', value: 'playful' },
    { label: 'Formal', value: 'formal' },
  ];
  
  // Add a concept to the list
  const addConcept = () => {
    if (conceptInput.trim() && !concepts.includes(conceptInput.trim())) {
      setConcepts([...concepts, conceptInput.trim()]);
      setConceptInput('');
    }
  };
  
  // Remove a concept from the list
  const removeConcept = (concept: string) => {
    setConcepts(concepts.filter(c => c !== concept));
  };
  
  // Simulate progress during generation
  const simulateProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);
  };
  
  // Handle form submission
  const handleGenerateAssessments = async () => {
    if (!contentTopic.trim()) return;
    
    setLoading(true);
    setGeneratedAssessments([]);
    setSavedCount(0);
    simulateProgress();
    
    try {
      const requestData = {
        content_topic: contentTopic,
        description: description,
        concepts: concepts,
        grade_level: gradeLevel,
        tone: tone
      };
      
      const result = await generateAssessments(requestData);
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      setProgress(100);
      
      // Wait a moment to show 100% progress
      setTimeout(() => {
        setGeneratedAssessments(result.assessments);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error generating assessments:', error);
      setLoading(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  };
  
  // Open edit dialog for an assessment
  const handleEditAssessment = (assessment: Assessment) => {
    setCurrentEditingAssessment(assessment);
    setEditDialogVisible(true);
  };
  
  // Save an edited assessment
  const handleSaveAssessment = (savedAssessment: AssessmentInfo) => {
    // Update the list of generated assessments
    setGeneratedAssessments(prev => 
      prev.map(assessment => 
        assessment.text === currentEditingAssessment?.text ? 
        { ...assessment, saved: true } : assessment
      )
    );
    setSavedCount(prev => prev + 1);
    setEditDialogVisible(false);
    setCurrentEditingAssessment(null);
  };
  
  // Save all assessments at once
  const handleSaveAll = async () => {
    setLoading(true);
    const savedAssessments: AssessmentInfo[] = [];
    
    try {
      for (const assessment of generatedAssessments) {
        if (!assessment.saved) {
          // Prepare assessment for saving (ensure it has viewId)
          const assessmentWithViewId = {
            ...assessment,
            view_id: viewId,
            slideName: assessment.slideName || assessment.text.substring(0, 30),
            buttonLabel: "Submit"
          };
          
          const savedAssessment = await createAssessment(assessmentWithViewId);
          savedAssessments.push(savedAssessment as AssessmentInfo);
        }
      }
      
      // Mark all as saved
      setGeneratedAssessments(prev => 
        prev.map(assessment => ({ ...assessment, saved: true }))
      );
      setSavedCount(generatedAssessments.length);
      
      // Notify parent component
      onAssessmentsCreated(savedAssessments);
    } catch (error) {
      console.error('Error saving assessments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Card style={styles.formCard}>
        <Card.Title title="AI Assessment Generator" subtitle="Generate comprehensive educational assessments" />
        <Card.Content>
          <TextInput
            label="Content Topic*"
            value={contentTopic}
            onChangeText={setContentTopic}
            style={styles.input}
            placeholder="e.g., Photosynthesis, American Revolution, Fractions"
            mode="outlined"
          />
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            placeholder="Provide additional details about the content topic"
            multiline
            numberOfLines={3}
            mode="outlined"
          />
          
          <View style={styles.conceptsContainer}>
            <Text variant="bodyMedium" style={styles.label}>Key Concepts</Text>
            <View style={styles.conceptInputContainer}>
              <TextInput
                value={conceptInput}
                onChangeText={setConceptInput}
                placeholder="Add a key concept"
                style={styles.conceptInput}
                mode="outlined"
                returnKeyType="done"
                onSubmitEditing={addConcept}
              />
              <Button mode="contained" onPress={addConcept} style={styles.addButton}>Add</Button>
            </View>
            
            <ScrollView horizontal style={styles.chipsScrollView}>
              <View style={styles.chipsContainer}>
                {concepts.map((concept, index) => (
                  <Chip 
                    key={index} 
                    onClose={() => removeConcept(concept)}
                    style={styles.chip}
                  >
                    {concept}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
          
          <View style={styles.dropdownRow}>
            <View style={styles.dropdownContainer}>
              <Dropdown
                label="Grade Level"
                value={gradeLevel}
                options={gradeLevelOptions}
                onChange={(value: string) => setGradeLevel(value)}
              />
            </View>
            
            <View style={styles.dropdownContainer}>
              <Dropdown
                label="Tone"
                value={tone}
                options={toneOptions}
                onChange={(value: string) => setTone(value)}
              />
            </View>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="contained" 
            onPress={handleGenerateAssessments}
            loading={loading}
            disabled={loading || !contentTopic.trim()}
            icon="lightning-bolt"
          >
            Generate Assessments
          </Button>
        </Card.Actions>
      </Card>
      
      {loading && (
        <Card style={styles.loadingCard}>
          <Card.Content style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#4361ee" />
            <Text style={styles.loadingText}>Generating comprehensive assessments... This may take a minute.</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.floor(progress)}%</Text>
          </Card.Content>
        </Card>
      )}
      
      {generatedAssessments.length > 0 && !loading && (
        <Card style={styles.resultsCard}>
          <Card.Title 
            title="Generated Assessments" 
            subtitle={`${generatedAssessments.length} assessments for "${contentTopic}"`}
            right={(props) => (
              <Button 
                mode="contained" 
                onPress={handleSaveAll}
                disabled={savedCount === generatedAssessments.length}
              >
                {savedCount === 0 ? 'Save All' : 
                 savedCount === generatedAssessments.length ? 'All Saved' : 
                 `Save Remaining (${generatedAssessments.length - savedCount})`}
              </Button>
            )}
          />
          <Divider />
          <Card.Content style={styles.resultsList}>
            <View style={styles.assessmentTypesContainer}>
              <Text variant="bodyMedium" style={styles.typeLabel}>Assessment Types:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typesRow}>
                  {[...new Set(generatedAssessments.map(a => a.type))].map((type, index) => (
                    <Chip key={index} style={styles.typeChip}>{type}</Chip>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <FlatList
              data={generatedAssessments}
              keyExtractor={(item, index) => `assessment-${index}`}
              renderItem={({ item, index }) => (
                <Surface style={[styles.assessmentCard, item.saved && styles.savedCard]}>
                  <View style={styles.assessmentHeader}>
                    <View style={styles.assessmentTitleContainer}>
                      <Text variant="titleMedium">{index + 1}. {item.text}</Text>
                      <Chip style={styles.typeIndicator}>{item.type}</Chip>
                    </View>
                    <View style={styles.assessmentActions}>
                      {item.saved ? (
                        <Chip icon="check" mode="outlined">Saved</Chip>
                      ) : (
                        <Button 
                          mode="outlined" 
                          onPress={() => handleEditAssessment(item)}
                        >
                          Edit & Save
                        </Button>
                      )}
                    </View>
                  </View>
                  
                  <Divider style={styles.assessmentDivider} />
                  
                  <View style={styles.optionsContainer}>
                    {renderAssessmentPreview(item)}
                  </View>
                </Surface>
              )}
              contentContainerStyle={styles.flatListContent}
            />
          </Card.Content>
        </Card>
      )}
      
      {currentEditingAssessment && (
        <AssessmentFormDialog
          visible={editDialogVisible}
          onDismiss={() => {
            setEditDialogVisible(false);
            setCurrentEditingAssessment(null);
          }}
          onSave={handleSaveAssessment}
          viewId={viewId}
          initialData={currentEditingAssessment}
        />
      )}
    </View>
  );
}

// Helper function to render a preview of the assessment based on its type
function renderAssessmentPreview(assessment: Assessment) {
  const { type, options = [] } = assessment;
  
  if (type === 'Open Ended') {
    const sampleAnswer = options.find(opt => opt.isCorrect);
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Sample Answer:</Text>
        {sampleAnswer && (
          <View style={styles.correctOption}>
            <Text>{sampleAnswer.text}</Text>
          </View>
        )}
      </View>
    );
  }
  
  if (type === 'Match the Words' || type === 'Drag and Drop') {
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Matching Items:</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.matchRow}>
            <Text style={styles.matchItem}>{option.text}</Text>
            <Text style={styles.matchArrow}>→</Text>
            <Text style={styles.matchTarget}>{option.match}</Text>
          </View>
        ))}
      </View>
    );
  }
  
  if (type === 'Order List') {
    const sortedOptions = [...options].sort((a, b) => a.correctOrder - b.correctOrder);
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Correct Order:</Text>
        {sortedOptions.map((option, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.orderNumber}>{index + 1}.</Text>
            <Text style={styles.orderText}>{option.text}</Text>
          </View>
        ))}
      </View>
    );
  }
  
  if (type === 'Fill in the Blank') {
    // Display question with highlighted blanks
    const questionWithBlanks = assessment.text.replace(/\[(.*?)\]/g, 
      (match, p1) => `<Text style="background-color: #e0e7ff; padding: 2px 6px; borderRadius: 4px;">${p1}</Text>`);
    
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Question with Blanks:</Text>
        <View style={styles.blankQuestion}>
          <Text>{questionWithBlanks}</Text>
        </View>
        
        {options.length > 0 && (
          <>
            <Text variant="bodyMedium" style={[styles.previewLabel, {marginTop: 10}]}>Distractors:</Text>
            <View style={styles.distractorsContainer}>
              {options.map((option, index) => (
                <Chip key={index} style={styles.distractor}>{option.text}</Chip>
              ))}
            </View>
          </>
        )}
      </View>
    );
  }
  
  if (type === 'Numerical') {
    const answer = options.find(opt => opt.isCorrect);
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Numerical Answer:</Text>
        {answer && (
          <View style={styles.correctOption}>
            <Text>{answer.text}</Text>
          </View>
        )}
      </View>
    );
  }
  
  // Default for Single Choice, Multiple Choice, True or False
  return (
    <View>
      {options.map((option, index) => (
        <View 
          key={index} 
          style={[
            styles.option, 
            option.isCorrect ? styles.correctOption : styles.incorrectOption
          ]}
        >
          <Text>{option.text}</Text>
          {option.isCorrect && (
            <Chip compact icon="check" style={styles.correctChip}>Correct</Chip>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 8,
  },
  conceptsContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  typeLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  conceptInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  conceptInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    justifyContent: 'center',
  },
  chipsScrollView: {
    maxHeight: 80,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingCard: {
    marginBottom: 20,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4361ee',
  },
  progressText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  resultsCard: {
    marginBottom: 20,
  },
  resultsList: {
    padding: 0,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  assessmentCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  savedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4cc9f0',
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  assessmentTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  assessmentActions: {
    justifyContent: 'center',
  },
  typeIndicator: {
    marginTop: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  assessmentDivider: {
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 8,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4cc9f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  incorrectOption: {
    backgroundColor: 'rgba(247, 37, 133, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  correctChip: {
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
  },
  previewLabel: {
    fontWeight: '500',
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchItem: {
    flex: 1,
    padding: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 4,
  },
  matchArrow: {
    marginHorizontal: 8,
    color: '#666',
  },
  matchTarget: {
    flex: 1,
    padding: 8,
    backgroundColor: 'rgba(76, 201, 240, 0.05)',
    borderRadius: 4,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 4,
  },
  orderNumber: {
    width: 24,
    fontWeight: 'bold',
  },
  orderText: {
    flex: 1,
  },
  blankQuestion: {
    padding: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 4,
  },
  distractorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  distractor: {
    margin: 4,
  },
  assessmentTypesContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  typesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeChip: {
    marginRight: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
}); 