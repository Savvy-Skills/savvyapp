import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput, Text, Card } from 'react-native-paper';
import AssessmentWrapper from '../AssessmentWrapper';
import { AssessmentProps } from './SingleChoice';
import { useViewStore } from '@/store/viewStore';
import { Colors } from '@/constants/Colors';

export default function OpenEnded({ slide, question, quizMode = false }: AssessmentProps) {
  const { setAnswer } = useViewStore();

  console.log({slide});
  
  // Get current answer from slide state
  const currentValue = slide.answer?.[0]?.text || '';
  
  const handleTextChange = useCallback((text: string) => {
    if (text !== currentValue) {
      // For open-ended questions, we don't determine correctness here
      // It will be determined by the answer reviewer later
      setAnswer([{ text }], false);
    }
  }, [currentValue, setAnswer]);

  // Get score color based on rating
  const getScoreColor = () => {
    if (!slide.subRating) return Colors.text;
    if (slide.subRating.rating >= 70) return Colors.success;
    if (slide.subRating.rating >= 50) return Colors.revealed;
    return Colors.error;
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
          numberOfLines={4}
          mode="outlined"
          disabled={slide.isCorrect || slide.isEvaluating}
        />
        {slide.isEvaluating && (
          <Card style={[styles.feedbackCard, { borderLeftColor: Colors.revealed }]}>
            <Card.Content style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.revealed} />
              <Text>Evaluating your answer...</Text>
            </Card.Content>
          </Card>
        )}
        {slide.submitted && slide.subRating && !slide.isEvaluating && (
          <Card style={[styles.feedbackCard, { borderLeftColor: getScoreColor() }]}>
            <Card.Content>
              <View style={styles.ratingContainer}>
                <Text style={[styles.ratingValue, { color: getScoreColor() }]}>
                  Score: {slide.subRating?.rating}/100
                </Text>
              </View>
              
              {slide.subRating?.feedback && (
                <>
                  <Text style={styles.sectionTitle}>Feedback</Text>
                  <Text>{slide.subRating?.feedback}</Text>
                </>
              )}
              
              {slide.subRating?.reasoning && (
                <>
                  <Text style={styles.sectionTitle}>Reasoning</Text>
                  <Text>{slide.subRating?.reasoning}</Text>
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
  }
});