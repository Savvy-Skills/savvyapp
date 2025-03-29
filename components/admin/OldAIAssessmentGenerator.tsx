import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Card, Button, Text, TextInput, Chip, Portal, Modal, IconButton, Divider, Surface } from 'react-native-paper';
import Dropdown from '@/components/common/Dropdown';
import { Assessment, AssessmentInfo, Option } from '@/types/index';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';
import { createAssessments } from '@/services/adminApi';

// Import all editor components
import {
  SingleChoiceEditor,
  MultipleChoiceEditor,
  TrueFalseEditor,
  FillInTheBlankEditor,
  MatchWordsEditor,
  OrderListEditor,
  NumericalEditor,
  DragDropEditor,
  OpenEndedEditor
} from './assessmentEditors';

import { generateAssessments, improveAssessment } from '@/services/aiApi';
import AssessmentPreview from './AssessmentPreview';

// Add interfaces for component props

// Form component props interface
interface AssessmentFormProps {
  contentTopic: string;
  setContentTopic: (topic: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  concepts: string[];
  setConcepts: (concepts: string[]) => void;
  conceptInput: string;
  setConceptInput: (input: string) => void;
  gradeLevel: string;
  setGradeLevel: (level: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  handleGenerateAssessments: () => Promise<void>;
  loading: boolean;
  gradeLevelOptions: Array<{label: string; value: string}>;
  toneOptions: Array<{label: string; value: string}>;
}

// Loading indicator props interface
interface LoadingIndicatorProps {
  progress: number;
}

// Assessment card props interface
interface AssessmentCardProps {
  item: Assessment;
  index: number;
  handleEditAssessment: (assessment: Assessment) => void;
  handleStartImproveAssessment: (assessment: Assessment) => void;
  handleRemoveClick: (assessment: Assessment) => void;
}

// Editor props interface
interface AssessmentEditorProps {
  item: Assessment;
  assessmentId: string;
  editorFormDataMap: { [key: string]: Partial<AssessmentInfo> };
  handleEditorFormChange: (assessmentId: string, data: Partial<AssessmentInfo>) => void;
  handleCancelEdit: (assessmentId: string) => void;
  handleSaveAssessment: (assessmentId: string) => void;
  renderEditor: (assessment: Assessment, assessmentId: string) => React.ReactNode;
}

// Component for the assessment form
const AssessmentForm = ({ 
  contentTopic, setContentTopic,
  description, setDescription,
  concepts, setConcepts,
  conceptInput, setConceptInput,
  gradeLevel, setGradeLevel,
  tone, setTone,
  handleGenerateAssessments,
  loading,
  gradeLevelOptions,
  toneOptions
}: AssessmentFormProps) => {

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

  return (
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
  );
};

// Loading indicator component
const LoadingIndicator = ({ progress }: LoadingIndicatorProps) => (
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
);

// Component for displaying an individual assessment
const AssessmentCard = ({ 
  item, 
  index, 
  handleEditAssessment, 
  handleStartImproveAssessment,
  handleRemoveClick 
}: AssessmentCardProps) => (
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
          <View style={styles.actionButtons}>
            <IconButton
              icon="delete"
              mode="outlined"
              onPress={() => handleRemoveClick(item)}
              style={styles.removeButton}
            />
            <Button 
              mode="outlined" 
              onPress={() => handleStartImproveAssessment(item)}
              style={styles.improveButton}
              icon="magic-staff"
            >
              Improve
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => handleEditAssessment(item)}
            >
              Edit & Save
            </Button>
          </View>
        )}
      </View>
    </View>
    
    <Divider style={styles.assessmentDivider} />
    
    <View style={styles.optionsContainer}>
      <AssessmentPreview assessment={item} />
    </View>
    
    {item.explanation && (
      <View style={styles.explanationContainer}>
        <Text variant="bodySmall" style={styles.explanationLabel}>Explanation:</Text>
        <Text style={styles.explanationText}>{item.explanation}</Text>
      </View>
    )}
  </Surface>
);

// Editor component for editing an assessment
const AssessmentEditor = ({ 
  item, 
  assessmentId, 
  editorFormDataMap, 
  handleEditorFormChange, 
  handleCancelEdit, 
  handleSaveAssessment,
  renderEditor
}: AssessmentEditorProps) => (
  <Surface style={styles.editorCard}>
    <View style={styles.editorHeader}>
      <Text variant="titleMedium">Editing {item.type} Assessment</Text>
      <Chip style={styles.typeIndicator}>{item.type}</Chip>
    </View>
    
    <Divider style={styles.editorDivider} />
    
    {item.type !== 'Fill in the Blank' && (
      <TextInput
        label="Question Text"
        value={editorFormDataMap[assessmentId]?.text || ''}
        onChangeText={(text) => handleEditorFormChange(assessmentId, { text })}
        multiline
        numberOfLines={3}
        style={styles.editorInput}
      />
    )}
    
    <View style={styles.editorContent}>
      {renderEditor(item, assessmentId)}
    </View>
    
    <TextInput
      label="Explanation (Optional)"
      value={editorFormDataMap[assessmentId]?.explanation || ''}
      onChangeText={(explanation) => handleEditorFormChange(assessmentId, { explanation })}
      multiline
      numberOfLines={3}
      style={styles.editorInput}
      placeholder="Provide an explanation that will be shown after answering"
    />
    
    <View style={styles.editorActions}>
      <Button onPress={() => handleCancelEdit(assessmentId)}>Cancel</Button>
      <Button mode="contained" onPress={() => handleSaveAssessment(assessmentId)}>Save</Button>
    </View>
  </Surface>
);

// Main component
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
  const [savedCount, setSavedCount] = useState(0);
  const [activeFilterType, setActiveFilterType] = useState<string>('All');
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  
  // Replace the single editing state with a map to track which assessment is being edited
  const [editingAssessmentIds, setEditingAssessmentIds] = useState<{ [key: string]: boolean }>({});
  // Store form data for each assessment being edited
  const [editorFormDataMap, setEditorFormDataMap] = useState<{ [key: string]: Partial<AssessmentInfo> }>({});
  
  // Add new state for JSON preview modal
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [jsonData, setJsonData] = useState('');
  
  // Add state for assessment improvement
  const [improvingAssessmentId, setImprovingAssessmentId] = useState<string | null>(null);
  const [improvementInstructions, setImprovementInstructions] = useState('');
  const [improvementLoading, setImprovementLoading] = useState(false);
  const [improvedAssessment, setImprovedAssessment] = useState<Assessment | null>(null);
  const [improvementModalVisible, setImprovementModalVisible] = useState(false);
  
  // Add new state for confirmation dialogs
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [confirmationSkip, setConfirmationSkip] = useState(false);
  const [assessmentToRemove, setAssessmentToRemove] = useState<Assessment | null>(null);
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false);
  
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

  // Effect to filter assessments when the filter or assessments change
  useEffect(() => {
    if (activeFilterType === 'All') {
      setFilteredAssessments(generatedAssessments);
    } else {
      setFilteredAssessments(generatedAssessments.filter(a => a.type === activeFilterType));
    }
  }, [generatedAssessments, activeFilterType]);
  
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
    setActiveFilterType('All');
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
  
  // Open edit view for an assessment
  const handleEditAssessment = (assessment: Assessment) => {
    // Create a unique ID for this assessment (using its text as a simple identifier)
    const assessmentId = assessment.text;
    
    // Initialize form data for this assessment
    setEditorFormDataMap(prev => ({
      ...prev,
      [assessmentId]: {
        ...assessment,
        slideName: assessment.slideName || assessment.text.substring(0, 30),
      }
    }));
    
    // Mark this assessment as being edited
    setEditingAssessmentIds(prev => ({
      ...prev,
      [assessmentId]: true
    }));
  };
  
  // Handle canceling the edit of an assessment
  const handleCancelEdit = (assessmentId: string) => {
    // Remove the editing state for this assessment
    setEditingAssessmentIds(prev => {
      const newState = { ...prev };
      delete newState[assessmentId];
      return newState;
    });
    
    // Clean up the form data
    setEditorFormDataMap(prev => {
      const newData = { ...prev };
      delete newData[assessmentId];
      return newData;
    });
  };
  
  // Handle editor form data changes for a specific assessment
  const handleEditorFormChange = (assessmentId: string, data: Partial<AssessmentInfo>) => {
    setEditorFormDataMap(prevData => ({
      ...prevData,
      [assessmentId]: {
        ...prevData[assessmentId],
        ...data
      }
    }));
  };
  
  // Save an edited assessment
  const handleSaveAssessment = async (assessmentId: string) => {
    try {
      const formData = editorFormDataMap[assessmentId];
      
      // Update the list of generated assessments with the edited data
      // but don't save to server yet - just mark as edited in local state
      setGeneratedAssessments(prev => 
        prev.map(assessment => 
          assessment.text === assessmentId ? 
            { ...assessment, ...formData, edited: true } : assessment
        )
      );
      
      // Clear the editing state
      handleCancelEdit(assessmentId);
      
    } catch (error) {
      console.error('Error updating assessment:', error);
    }
  };
  
  // Show remove confirmation dialog
  const handleRemoveClick = (assessment: Assessment) => {
    setAssessmentToRemove(assessment);
    setRemoveConfirmVisible(true);
  };
  
  // Function to remove an assessment from the generated list
  const handleRemoveAssessment = () => {
    if (!assessmentToRemove) return;
    
    setGeneratedAssessments(prev => 
      prev.filter(assessment => assessment.text !== assessmentToRemove.text)
    );
    
    setAssessmentToRemove(null);
  };
  
  // Handle save confirmation
  const handleConfirmSave = async (skip: boolean) => {
    setConfirmationSkip(skip);
    await performSaveAll();
  };
  
  // Show confirmation dialog before saving
  const handleSaveAllClick = () => {
    if (confirmationSkip) {
      performSaveAll();
    } else {
      setConfirmDialogVisible(true);
    }
  };
  
  // Save all assessments at once
  const performSaveAll = async () => {
    setLoading(true);
    const assessmentsToSave = generatedAssessments.filter(a => !a.saved);
    
    try {
      // Convert the assessment objects to the format expected by the API
      const assessmentData = assessmentsToSave.map(assessment => ({
        ...assessment,
        slideName: assessment.slideName || assessment.text.substring(0, 30)
      }));
      
      // Save the assessments to the backend
      const savedAssessments = await createAssessments(viewId, assessmentData);
            
      // Update the count of saved assessments
      setSavedCount(prev => prev + savedAssessments.length);
      
      // Notify parent component of new assessments
      onAssessmentsCreated(savedAssessments as AssessmentInfo[]);
      
    } catch (error) {
      console.error('Error saving assessments:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };
  
  // Get all unique assessment types
  const getAssessmentTypes = () => {
    const types = [...new Set(generatedAssessments.map(a => a.type))];
    return ['All', ...types];
  };
  
  // Render the appropriate editor based on assessment type
  const renderEditor = (assessment: Assessment, assessmentId: string) => {
    const formData = editorFormDataMap[assessmentId];
    if (!formData) return null;
    
    const { type } = assessment;
    const commonProps = {
      questionText: formData.text || '',
      options: formData.options?.map(o => o.text) || [],
      correctAnswers: formData.options?.map((o, idx) => o.isCorrect ? idx : -1).filter(idx => idx !== -1) || [],
      onQuestionTextChange: (text: string) => handleEditorFormChange(assessmentId, { text }),
      onOptionsChange: (options: string[]) => {
        // Convert simple array to options array with appropriate structure
        let optionsArray: Option[] = [];
        
        if (type === 'Match the Words' || type === 'Drag and Drop') {
          // Handle matching type editors
          optionsArray = [];
          for (let i = 0; i < options.length; i += 2) {
            if (i + 1 < options.length) {
              optionsArray.push({
                text: options[i],
                match: options[i + 1],
                isCorrect: true,
                correctOrder: i + 1
              });
            }
          }
        } else if (type === 'Order List') {
          // Handle order list with correctOrder property
          optionsArray = options.map((text, index) => ({
            text,
            correctOrder: index + 1,
            isCorrect: true
          }));
        } else {
          // Default format for most types
          optionsArray = options.map((text, index) => ({
            ...formData.options?.[index],
            isCorrect: formData.options?.[index]?.isCorrect || false,
            text,
            correctOrder: index + 1
          }));
        }
        
        handleEditorFormChange(assessmentId, { options: optionsArray });
      },
      onCorrectAnswersChange: (answers: number[]) => {
        const updatedOptions = formData.options?.map((o, idx) => ({
          ...o,
          isCorrect: answers.includes(idx)
        }));
        
        handleEditorFormChange(assessmentId, { options: updatedOptions });
      },
      onFormDataChange: (data: Partial<AssessmentInfo>) => handleEditorFormChange(assessmentId, data),
      formData: formData as AssessmentInfo
    };
    
    // Same switch case as before, just with the updated props
    switch (type) {
      case 'Single Choice':
        return <SingleChoiceEditor {...commonProps} />;
      case 'Multiple Choice':
        return <MultipleChoiceEditor {...commonProps} />;
      case 'True or False':
        return <TrueFalseEditor {...commonProps} />;
      case 'Fill in the Blank':
        return <FillInTheBlankEditor {...commonProps} />;
      case 'Match the Words':
        return <MatchWordsEditor {...commonProps} />;
      case 'Order List':
        return <OrderListEditor {...commonProps} />;
      case 'Numerical':
        return <NumericalEditor {...commonProps} extras={formData.extras} />;
      case 'Drag and Drop':
        return <DragDropEditor {...commonProps} />;
      case 'Open Ended':
        return <OpenEndedEditor {...commonProps} />;
      default:
        return <Text>No editor available for this assessment type</Text>;
    }
  };
  
  // Function to handle showing JSON preview
  const handleShowJson = () => {
    const prettyJson = JSON.stringify(generatedAssessments, null, 2);
    setJsonData(prettyJson);
    setJsonModalVisible(true);
  };
  
  // Function to copy JSON to clipboard
  const handleCopyJson = () => {
    // This is a basic implementation that would need to be adapted for React Native
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonData);
      // Show a notification or toast here
    }
  };
  
  // Function to start improving an assessment
  const handleStartImproveAssessment = (assessment: Assessment) => {
    setImprovingAssessmentId(assessment.text);
    setImprovementInstructions('');
    setImprovedAssessment(null);
    setImprovementModalVisible(true);
  };
  
  // Function to submit the improvement request
  const handleImproveAssessment = async () => {
    if (!improvingAssessmentId) return;
    
    setImprovementLoading(true);
    
    try {
      const assessmentToImprove = generatedAssessments.find(a => a.text === improvingAssessmentId);
      if (!assessmentToImprove) throw new Error('Assessment not found');
      
      const requestData = {
        assessment: assessmentToImprove,
        instructions: improvementInstructions,
        content_topic: contentTopic,
        description: description,
        concepts: concepts,
        grade_level: gradeLevel,
        tone: tone
      };
      
      const result = await improveAssessment(requestData);
      setImprovedAssessment(result.improved_assessment);
    } catch (error) {
      console.error('Error improving assessment:', error);
      // Show error message
    } finally {
      setImprovementLoading(false);
    }
  };
  
  // Function to accept the improved assessment
  const handleAcceptImprovedAssessment = () => {
    if (!improvedAssessment || !improvingAssessmentId) return;
    
    // Update the assessment in the list
    setGeneratedAssessments(prev => 
      prev.map(assessment => 
        assessment.text === improvingAssessmentId ? 
          { ...improvedAssessment, edited: true } : assessment
      )
    );
    
    // Close the modal and reset state
    setImprovementModalVisible(false);
    setImprovingAssessmentId(null);
    setImprovedAssessment(null);
    setImprovementInstructions('');
  };

  const assessmentToImprove = generatedAssessments.find(a => a.text === improvingAssessmentId);
  
  return (
    <View style={styles.container}>
      {/* Form card using the extracted component */}
      <AssessmentForm 
        contentTopic={contentTopic}
        setContentTopic={setContentTopic}
        description={description}
        setDescription={setDescription}
        concepts={concepts}
        setConcepts={setConcepts}
        conceptInput={conceptInput}
        setConceptInput={setConceptInput}
        gradeLevel={gradeLevel}
        setGradeLevel={setGradeLevel}
        tone={tone}
        setTone={setTone}
        handleGenerateAssessments={handleGenerateAssessments}
        loading={loading}
        gradeLevelOptions={gradeLevelOptions}
        toneOptions={toneOptions}
      />
      
      {/* Loading indicator using the extracted component */}
      {loading && <LoadingIndicator progress={progress} />}
      
      {generatedAssessments.length > 0 && !loading && (
        <Card style={styles.resultsCard}>
          <Card.Title 
            title="Generated Assessments" 
            subtitle={`${generatedAssessments.length} assessments for "${contentTopic}"`}
            right={(props) => (
              <View style={styles.headerButtons}>
                <Button 
                  mode="outlined" 
                  onPress={handleShowJson}
                  style={styles.jsonButton}
                >
                  View JSON
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveAllClick}
                  disabled={savedCount === generatedAssessments.length}
                >
                  {savedCount === 0 ? 'Save All' : 
                   savedCount === generatedAssessments.length ? 'All Saved' : 
                   `Save Remaining (${generatedAssessments.length - savedCount})`}
                </Button>
              </View>
            )}
          />
          <Divider />
          <Card.Content style={styles.resultsList}>
            <View style={styles.assessmentTypesContainer}>
              <Text variant="bodyMedium" style={styles.typeLabel}>Assessment Types:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typesRow}>
                  {getAssessmentTypes().map((type, index) => (
                    <Chip 
                      key={index} 
                      style={[styles.typeChip, activeFilterType === type && styles.activeTypeChip]}
                      onPress={() => setActiveFilterType(type)}
                      selected={activeFilterType === type}
                    >
                      {type}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <FlatList
              data={filteredAssessments}
              keyExtractor={(item, index) => `assessment-${index}`}
              renderItem={({ item, index }) => {
                const assessmentId = item.text;
                const isEditing = editingAssessmentIds[assessmentId];
                
                if (isEditing) {
                  // Render the editor component
                  return (
                    <AssessmentEditor
                      item={item}
                      assessmentId={assessmentId}
                      editorFormDataMap={editorFormDataMap}
                      handleEditorFormChange={handleEditorFormChange}
                      handleCancelEdit={handleCancelEdit}
                      handleSaveAssessment={handleSaveAssessment}
                      renderEditor={renderEditor}
                    />
                  );
                }
                
                // Render the assessment card component
                return (
                  <AssessmentCard 
                    item={item}
                    index={index}
                    handleEditAssessment={handleEditAssessment}
                    handleStartImproveAssessment={handleStartImproveAssessment}
                    handleRemoveClick={handleRemoveClick}
                  />
                );
              }}
              contentContainerStyle={styles.flatListContent}
            />
          </Card.Content>
        </Card>
      )}
      
      {/* JSON Preview Modal */}
      <Portal>
        <Modal
          visible={jsonModalVisible}
          onDismiss={() => setJsonModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.jsonModal}>
            <View style={styles.jsonHeader}>
              <Text variant="titleLarge">Assessment JSON Data</Text>
              <IconButton icon="close" onPress={() => setJsonModalVisible(false)} />
            </View>
            <Divider style={styles.modalDivider} />
            <ScrollView style={styles.jsonScrollView}>
              <View style={styles.jsonContent}>
                <Button 
                  mode="contained" 
                  onPress={handleCopyJson} 
                  icon="content-copy"
                  style={styles.copyButton}
                >
                  Copy to Clipboard
                </Button>
                <View style={styles.jsonTextContainer}>
                  <Text selectable style={styles.jsonText}>{jsonData}</Text>
                </View>
              </View>
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
      
      {/* Improvement Modal */}
      <Portal>
        <Modal
          visible={improvementModalVisible}
          onDismiss={() => {
            if (!improvementLoading) {
              setImprovementModalVisible(false);
              setImprovingAssessmentId(null);
              setImprovedAssessment(null);
            }
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.improvementModal}>
            <View style={styles.jsonHeader}>
              <Text variant="titleLarge">Improve Assessment</Text>
              <IconButton 
                icon="close" 
                onPress={() => {
                  if (!improvementLoading) {
                    setImprovementModalVisible(false);
                    setImprovingAssessmentId(null);
                    setImprovedAssessment(null);
                  }
                }} 
                disabled={improvementLoading}
              />
            </View>
            <Divider style={styles.modalDivider} />
            
            <ScrollView style={styles.improvementScrollView}>
              {improvingAssessmentId && (
                <View style={styles.improvementContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Original Assessment</Text>
                  <Surface style={styles.assessmentPreviewCard}>
                    {/* Add assessment text for all but fill in the blank type */}
                    {assessmentToImprove?.type !== 'Fill in the Blank' && (
                      <Text variant="bodyMedium" style={styles.categoryTitle}>{assessmentToImprove?.text}</Text>
                    )}
                    <AssessmentPreview 
                      assessment={assessmentToImprove!} 
                    />
                  </Surface>
                  
                  {!improvedAssessment ? (
                    <>
                      <Text variant="titleMedium" style={styles.sectionTitle}>Improvement Instructions</Text>
                      <TextInput
                        label="Instructions for improvement"
                        value={improvementInstructions}
                        onChangeText={setImprovementInstructions}
                        multiline
                        numberOfLines={4}
                        mode="outlined"
                        style={styles.instructionsInput}
                        placeholder="e.g., Make it more challenging, add more distractors, increase complexity, align with grade level, etc."
                        disabled={improvementLoading}
                      />
                      
                      <Button
                        mode="contained"
                        onPress={handleImproveAssessment}
                        loading={improvementLoading}
                        disabled={improvementLoading || !improvementInstructions.trim()}
                        icon="auto-fix"
                        style={styles.improveActionButton}
                      >
                        Generate Improved Version
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text variant="titleMedium" style={styles.sectionTitle}>Improved Assessment</Text>
                      <Surface style={styles.assessmentPreviewCard}>
                        <AssessmentPreview assessment={improvedAssessment} />
                      </Surface>
                      
                      <View style={styles.comparisonActions}>
                        <Button
                          mode="outlined"
                          onPress={() => setImprovedAssessment(null)}
                          style={styles.comparisonButton}
                        >
                          Reject & Try Again
                        </Button>
                        <Button
                          mode="contained"
                          onPress={handleAcceptImprovedAssessment}
                          style={styles.comparisonButton}
                        >
                          Accept Improvement
                        </Button>
                      </View>
                    </>
                  )}
                </View>
              )}
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
      
      {/* Save Confirmation Dialog */}
      <ConfirmationDialog
        visible={confirmDialogVisible}
        onDismiss={() => setConfirmDialogVisible(false)}
        onConfirm={handleConfirmSave}
        skip={true}
        title="Save Assessments"
        content={`Are you sure you want to save ${generatedAssessments.filter(a => !a.saved).length} assessments to this view?`}
      />
      
      {/* Remove Assessment Confirmation Dialog */}
      <ConfirmationDialog
        visible={removeConfirmVisible}
        onDismiss={() => {
          setRemoveConfirmVisible(false);
          setAssessmentToRemove(null);
        }}
        onConfirm={() => {
          handleRemoveAssessment();
          setRemoveConfirmVisible(false);
        }}
        title="Remove Assessment"
        content={`Are you sure you want to remove this assessment? This action cannot be undone.`}
      />
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
    padding: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
  },
  blankHighlight: {
    backgroundColor: '#e0e7ff',
    padding: 2,
    borderRadius: 4,
    color: '#4361ee',
    fontWeight: 'bold',
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
  activeTypeChip: {
    backgroundColor: 'rgba(67, 97, 238, 0.3)',
  },
  // Update editor styles for inline editing
  editorCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4361ee',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editorDivider: {
    marginBottom: 16,
  },
  editorContent: {
    marginVertical: 16,
  },
  editorInput: {
    marginBottom: 16,
  },
  editorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4361ee',
  },
  explanationLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  explanationText: {
    fontStyle: 'italic',
  },
  // Rubric styles
  rubricContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(76, 201, 240, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 201, 240, 0.2)',
  },
  criterion: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
  },
  criterionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  level: {
    padding: 10,
    backgroundColor: 'rgba(67, 97, 238, 0.03)',
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4361ee',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelName: {
    fontWeight: 'bold',
  },
  levelPoints: {
    fontStyle: 'italic',
  },
  levelDescription: {
    fontSize: 14,
  },
  // Numerical styles
  numericPrefix: {
    marginRight: 2,
  },
  numericValue: {
    fontWeight: 'bold',
  },
  numericSuffix: {
    marginLeft: 2,
  },
  numericOperator: {
    fontStyle: 'italic',
    color: '#666',
  },
  // Category styling for Drag and Drop
  categoryContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryTitle: {
    padding: 8,
    fontWeight: 'bold',
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  // Filter buttons
  filterButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4361ee',
  },
  // Styles for the header buttons
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jsonButton: {
    marginRight: 8,
  },
  
  // Styles for action buttons
  actionButtons: {
    flexDirection: 'row',
  },
  improveButton: {
    marginRight: 8,
  },
  
  // Styles for the JSON modal
  modalContainer: {
    margin: 20,
    flex: 1,
  },
  jsonModal: {
    padding: 20,
    borderRadius: 10,
    flex: 1,
  },
  jsonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDivider: {
    marginVertical: 10,
  },
  jsonScrollView: {
    flex: 1,
  },
  jsonContent: {
    flex: 1,
  },
  copyButton: {
    marginBottom: 16,
  },
  jsonTextContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    flex: 1,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  
  // Styles for the improvement modal
  improvementModal: {
    padding: 20,
    borderRadius: 10,
    flex: 1,
  },
  improvementScrollView: {
    flex: 1,
  },
  improvementContent: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  assessmentPreviewCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
  },
  instructionsInput: {
    marginBottom: 16,
  },
  improveActionButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  comparisonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  comparisonButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  assessmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllButton: {
    marginLeft: 8,
  },
  removeButton: {
    marginRight: 8,
  },
  typesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
}); 
