import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, IconButton, Divider } from 'react-native-paper';
import { BaseEditorProps } from './types';
import { Rubric, RubricLevel } from '@/types/index';
import { generateColors } from '@/utils/utilfunctions';
import { Colors } from '@/constants/Colors';
import baseRubrics from './rubrics/baseRubrics';
import Dropdown from '@/components/common/Dropdown';

// Instead of a static default, we'll use a function to generate defaults
const createDefaultLevel = (index: number): RubricLevel => ({ 
  name: `Level #${index + 1}`, 
  description: '', 
  value: index + 1 
});

const DEFAULT_CRITERION = { criterion: '', levels: [createDefaultLevel(0)] };

const OpenEndedEditor: React.FC<BaseEditorProps> = ({
  onFormDataChange,
  formData
}) => {
  const [rubrics, setRubrics] = useState<Rubric[]>(formData?.rubric || [DEFAULT_CRITERION]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Convert baseRubrics to dropdown options format
  const templateOptions = baseRubrics.map(rubric => ({
    label: rubric.name,
    value: rubric.id
  }));

  // Initialize with existing data if available
  useEffect(() => {
    if (formData?.rubric && formData.rubric.length > 0) {
      setRubrics(formData.rubric);
    }
  }, []);

  // Update form data when rubrics change
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        rubric: rubrics
      });
    }
  }, [rubrics]);

  const handleCriterionChange = (index: number, value: string) => {
    const newRubrics = [...rubrics];
    newRubrics[index].criterion = value;
    setRubrics(newRubrics);
  };

  const handleAddCriterion = () => {
    setRubrics([...rubrics, { ...DEFAULT_CRITERION }]);
  };

  const handleRemoveCriterion = (index: number) => {
    const newRubrics = rubrics.filter((_, idx) => idx !== index);
    setRubrics(newRubrics.length ? newRubrics : [DEFAULT_CRITERION]);
  };

  const handleLevelChange = (criterionIndex: number, levelIndex: number, field: keyof RubricLevel, value: string | number) => {
    const newRubrics = [...rubrics];
    newRubrics[criterionIndex].levels[levelIndex] = {
      ...newRubrics[criterionIndex].levels[levelIndex],
      [field]: field === 'value' ? Number(value) : value
    };
    setRubrics(newRubrics);
  };

  const handleAddLevel = (criterionIndex: number) => {
    const newRubrics = [...rubrics];
    const newLevelIndex = newRubrics[criterionIndex].levels.length;
    newRubrics[criterionIndex].levels.push(createDefaultLevel(newLevelIndex));
    setRubrics(newRubrics);
  };

  const handleRemoveLevel = (criterionIndex: number, levelIndex: number) => {
    const newRubrics = [...rubrics];
    newRubrics[criterionIndex].levels = newRubrics[criterionIndex].levels.filter((_, idx) => idx !== levelIndex);
    
    // Ensure there's always at least one level
    if (newRubrics[criterionIndex].levels.length === 0) {
      newRubrics[criterionIndex].levels = [createDefaultLevel(0)];
    }
    
    setRubrics(newRubrics);
  };

  const handleApplyBaseRubric = (templateId: string) => {
    const selectedRubric = baseRubrics.find(r => r.id === templateId);
    if (selectedRubric) {
      setRubrics([...selectedRubric.rubric]);
      setSelectedTemplateId(''); // Reset selection after applying
    }
  };

  return (
    <ScrollView>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Grading Criteria
          </Text>
          
          <Text style={styles.helpText}>
            Define rubric criteria and grading levels for evaluating open-ended responses.
          </Text>

          <View style={styles.templateSection}>
            <Dropdown 
              label="Apply Template Rubric"
              value={selectedTemplateId}
              options={templateOptions}
              onChange={handleApplyBaseRubric}
              placeholder="Select a template rubric"
            />
          </View>

          {rubrics.map((rubric, criterionIndex) => (
            <Card key={criterionIndex} style={styles.criterionCard}>
              <Card.Content>
                <View style={styles.criterionHeader}>
                  <TextInput
                    label="Criterion"
                    value={rubric.criterion}
                    onChangeText={(text) => handleCriterionChange(criterionIndex, text)}
                    style={styles.criterionInput}
                    placeholder="e.g., Content Understanding, Writing Quality"
                  />
                  {rubrics.length > 1 && (
                    <IconButton
                      icon="delete"
                      onPress={() => handleRemoveCriterion(criterionIndex)}
                      disabled={rubrics.length <= 1}
                    />
                  )}
                </View>

                <Text style={styles.levelsTitle}>Grading Levels</Text>
                
                {rubric.levels.map((level, levelIndex) => (
                  <View key={levelIndex} style={styles.levelContainer}>
                    <Divider style={styles.divider} />
                    <View style={styles.levelRow}>
                      <TextInput
                        label="Level Name"
                        value={level.name}
                        onChangeText={(text) => handleLevelChange(criterionIndex, levelIndex, 'name', text)}
                        style={styles.levelNameInput}
                        placeholder={`Level #${levelIndex + 1}`}
                      />
                      <TextInput
                        label="Points"
                        value={level.value.toString()}
                        onChangeText={(text) => handleLevelChange(criterionIndex, levelIndex, 'value', text)}
                        keyboardType="numeric"
                        style={styles.pointsInput}
                        placeholder={(levelIndex + 1).toString()}
                      />
                    </View>
                    <TextInput
                      label="Description"
                      value={level.description}
                      onChangeText={(text) => handleLevelChange(criterionIndex, levelIndex, 'description', text)}
                      multiline
                      style={styles.descriptionInput}
                      placeholder="Describe criteria for this level"
                    />
                    {rubric.levels.length > 1 && (
                      <IconButton
                        icon="delete"
                        style={styles.removeLevel}
                        onPress={() => handleRemoveLevel(criterionIndex, levelIndex)}
                        disabled={rubric.levels.length <= 1}
                      />
                    )}
                  </View>
                ))}
                
                <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() => handleAddLevel(criterionIndex)}
                  style={styles.addButton}
                >
                  Add Level
                </Button>
              </Card.Content>
            </Card>
          ))}
          
          <Button
            mode="outlined"
            icon="plus"
            onPress={handleAddCriterion}
            style={styles.addButton}
          >
            Add Criterion
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  helpText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 14,
    marginBottom: 16,
  },
  templateSection: {
    marginBottom: 16,
  },
  criterionCard: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  criterionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criterionInput: {
    flex: 1,
    marginBottom: 8,
  },
  levelsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  levelContainer: {
    marginBottom: 8,
    position: 'relative',
  },
  levelRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  levelNameInput: {
    flex: 3,
    marginRight: 8,
  },
  pointsInput: {
    flex: 1,
  },
  descriptionInput: {
    marginTop: 8,
  },
  removeLevel: {
    position: 'absolute',
    right: -8,
    top: -8,
  },
  divider: {
    marginVertical: 8,
  },
  addButton: {
    marginTop: 8,
  },
});

export default OpenEndedEditor; 