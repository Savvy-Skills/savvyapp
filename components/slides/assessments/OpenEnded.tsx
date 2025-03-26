import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Text, Card, Button, Divider } from 'react-native-paper';
import AssessmentWrapper from '../AssessmentWrapper';
import { AssessmentProps } from './SingleChoice';
import { useViewStore } from '@/store/viewStore';
import { Colors } from '@/constants/Colors';
import { Rubric } from '@/types';

export default function OpenEnded({ slide, question, quizMode = false }: AssessmentProps) {
  const { setAnswer, evaluateOpenEndedAnswer } = useViewStore();
  const [showRubrics, setShowRubrics] = useState(false);

  const maxScore = slide.assessment_info?.options?.[0]?.subRating?.max_score || 100;
  const error = slide.error;
  
  // Get current answer from slide state
  const currentValue = slide.answer?.[0]?.text || '';
  
  const handleTextChange = useCallback((text: string) => {
    if (text !== currentValue) {
      // For open-ended questions, we don't determine correctness here
      // It will be determined by the answer reviewer later
      setAnswer([{ text }], false);
      // Clear any errors when the user starts typing again

    }
  }, [currentValue, setAnswer]);

  // Get score color based on rating
  const getScoreColor = () => {
    if (!slide.answer?.[0]?.subRating) return Colors.text;
	if (slide.revealed) return Colors.revealed;
	// TODO: Color scale should be based on the max score
    if (slide.answer?.[0]?.subRating.rating >= maxScore * 0.8) return Colors.success;
    if (slide.answer?.[0]?.subRating.rating >= maxScore * 0.5) return Colors.blue;
    return Colors.error;
  };

  // Toggle rubrics visibility
  const toggleRubrics = () => {
    setShowRubrics(!showRubrics);
  };

  // Render a single criterion with its achieved level
  const renderCriterion = (rubric: Rubric) => {
    // Find the selected level (the one with the highest value)
    const selectedLevel = rubric.levels && rubric.levels.length > 0 
      ? rubric.levels[0] // In the response, we only get the achieved level
      : null;
    
    if (!selectedLevel) return null;

    
    return (
      <View key={rubric.criterion} style={styles.criterionContainer}>
        <Text style={styles.criterionTitle}>
          {rubric.criterion}: <Text style={styles.criterionLevel}>{selectedLevel.name} ({selectedLevel.value} points)</Text>
        </Text>
        
        <Text style={styles.criterionDescription}>
          {selectedLevel.description}
        </Text>
        
        {selectedLevel.quote && (
          <Text style={styles.criterionQuote}>
            {selectedLevel.quote}
          </Text>
        )}
        
        <Divider style={styles.divider} />
      </View>
    );
  };

  // Render error message
  const renderError = () => {
    if (!error) return null;
    
    return (
      <Card style={styles.errorCard}>
        <Card.Content>
          <Text style={styles.errorText}>{error}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <AssessmentWrapper 
      slide={slide}
      question={question}
    >
      <View>
        <TextInput
          onChangeText={handleTextChange}
          value={currentValue}
          placeholder="Type your answer here"
          multiline
          numberOfLines={10}
          mode="outlined"
          disabled={slide.isCorrect || slide.isEvaluating}
        />
        
        {error && renderError()}
        
        {slide.isEvaluating && !error && (
          <Card style={[styles.feedbackCard, { borderLeftColor: Colors.revealed }]}>
            <Card.Content style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.revealed} />
              <Text>Evaluating your answer...</Text>
            </Card.Content>
          </Card>
        )}
        
        {slide.submitted && slide.answer?.[0]?.subRating && !slide.isEvaluating && !error && (
          <Card style={[styles.feedbackCard, { borderLeftColor: getScoreColor() }]}>
            <Card.Content>
              <View style={styles.ratingContainer}>
                <Text style={[styles.ratingValue, { color: getScoreColor() }]}>
                  Score: {slide.answer?.[0]?.subRating.rating}/{maxScore}
                </Text>
              </View>
              
              {slide.answer?.[0]?.subRating.feedback && (
                <>
                  <Text style={styles.sectionTitle}>Feedback</Text>
                  <Text>{slide.answer?.[0]?.subRating.feedback}</Text>
                </>
              )}
              
              {slide.answer?.[0]?.subRating.rubrics && slide.answer?.[0]?.subRating.rubrics.length > 0 && (
                <>
                  <TouchableOpacity 
                    onPress={toggleRubrics}
                    style={styles.toggleButton}
                  >
                    <Text style={styles.toggleButtonText}>
                      {showRubrics ? 'Hide Criteria Evaluation' : 'Show Criteria Evaluation'}
                    </Text>
                  </TouchableOpacity>
                  
                  {showRubrics && (
                    <View style={styles.rubricsContainer}>
                      {slide.answer?.[0]?.subRating.rubrics.map(renderCriterion)}
                    </View>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        )}
      </View>
    </AssessmentWrapper>
  );
}

const styles = StyleSheet.create({
  feedbackCard: {
    borderLeftWidth: 5,
    marginTop: 16,
  },
  errorCard: {
    borderLeftWidth: 5,
    borderLeftColor: Colors.error,
    marginTop: 16,
  },
  errorText: {
    color: Colors.error,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontWeight: '600',
    color: '#3498db',
  },
  rubricsContainer: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 10,
  },
  criterionContainer: {
    marginBottom: 12,
  },
  criterionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  criterionLevel: {
    color: '#3498db',
  },
  criterionDescription: {
    marginLeft: 10,
    marginBottom: 4,
  },
  criterionQuote: {
    marginLeft: 10,
    fontStyle: 'italic',
    fontSize: 12,
    color: '#7f8c8d',
  },
  divider: {
    marginTop: 8,
  }
});