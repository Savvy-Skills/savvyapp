import React from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Button, Text, TextInput, Chip } from 'react-native-paper';
import Dropdown from '@/components/common/Dropdown';
import { AssessmentFormProps } from '../types';
import { styles } from '../styles';

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

export default AssessmentForm; 