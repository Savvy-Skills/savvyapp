import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, IconButton } from 'react-native-paper';
import AssessmentWrapper from '../AssessmentWrapper';
import { QuestionInfo } from '@/types';

export default function ReorderAssessment({ question }: { question: QuestionInfo }) {
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const correctOrder = question.options.sort(
    (a, b) => a.correctOrder - b.correctOrder
  ).map((option) => option.text);

  const items = question.options.map((option) => option.text).sort(() => Math.random() - 0.5);

  useEffect(() => {
    setCurrentOrder(items);
  }, []);

  const moveItem = (index: number, direction: string) => {
    if (isCorrect) return;

    const newOrder = [...currentOrder];
    const item = newOrder[index];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, item);
    setCurrentOrder(newOrder);
  };

  const handleSubmit = () => {
    const correct = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
    setIsCorrect(correct);
    return correct;
  };

  return (
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
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
                  disabled={index === 0 || isCorrect}
                />
                <IconButton
                  icon="arrow-down"
                  onPress={() => moveItem(index, "down")}
                  disabled={index === currentOrder.length - 1 || isCorrect}
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