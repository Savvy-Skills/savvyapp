import React from 'react';
import { View } from 'react-native';
import { Surface, Text, Chip, Button, Divider, TextInput } from 'react-native-paper';
import { AssessmentEditorProps } from '../types';
import { styles } from '../styles';

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

export default AssessmentEditor; 