import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, IconButton } from 'react-native-paper';
import AssessmentWrapper from '../AssessmentWrapper';
import { useCourseStore } from '@/store/courseStore';
import { AssessmentProps } from './SingleChoice';

export default function ReorderAssessment({ question, index }: AssessmentProps) {
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const { setSubmittableState, correctnessStates, setCorrectnessState, submittedAssessments } = useCourseStore();

  
  const correctOrder = question.options.sort(
    (a, b) => a.correctOrder - b.correctOrder
  ).map((option) => option.text);

  const items = question.options.map((option) => option.text).sort(() => Math.random() - 0.5);

  useEffect(() => {
    setCurrentOrder(items);
    setSubmittableState(index, true);
  }, []);

  const moveItem = (index: number, direction: string) => {
    const newOrder = [...currentOrder];
    const item = newOrder[index];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, item);
    setCurrentOrder(newOrder);
  };

  useEffect(() => {
    let correct: boolean = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
	setCorrectnessState(index, correct);
  }, [currentOrder, index, setSubmittableState]);


  const currentSubmissionIndex = submittedAssessments.findIndex(
	(submission) => submission.question_id === question.id
  );
  const currentSubmission = currentSubmissionIndex !== -1 ? submittedAssessments[currentSubmissionIndex] : undefined;
  const blocked = currentSubmission ? currentSubmission.correct : false;

  return (
    <AssessmentWrapper question={question}>
      <List.Section>
        {currentOrder.map((item, index) => (
          <List.Item
            key={index}
            title={item}
            left={() => (
              <View style={styles.buttonContainer}>
                <IconButton
                  icon="arrow-up"
                  onPress={() => moveItem(index, "up")}
                  disabled={index === 0 || blocked}
                />
                <IconButton
                  icon="arrow-down"
                  onPress={() => moveItem(index, "down")}
                  disabled={index === currentOrder.length - 1 || blocked}
                />
              </View>
            )}
          />
        ))}
      </List.Section>
    </AssessmentWrapper>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});