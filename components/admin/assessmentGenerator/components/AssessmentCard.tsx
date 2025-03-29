import React from 'react';
import { View } from 'react-native';
import { Surface, Text, Chip, IconButton, Button, Divider } from 'react-native-paper';
import { AssessmentCardProps } from '../types';
import { styles } from '../styles';
import AssessmentPreview from '@/components/admin/AssessmentPreview';

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

export default AssessmentCard; 