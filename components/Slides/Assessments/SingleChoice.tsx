import React, { useState } from 'react';
import { View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import AssessmentWrapper from '../AssessmentWrapper';
import { QuestionInfo } from '@/types';

export default function SingleChoice({ question }: {question: QuestionInfo}) {
  const [selectedValue, setSelectedValue] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const options = question.options.map((option) => option.text);
  const correctAnswer = question.options.find((option) => option.isCorrect)?.text;

  const handleSubmit = () => {
    const correctness = selectedValue === correctAnswer;
    setIsCorrect(correctness);
    return correctness;
  };

  return (
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
      <RadioButton.Group onValueChange={value => setSelectedValue(value)} value={selectedValue}>
        {options.map((option, index) => (
          <RadioButton.Item key={index} label={option} value={option} disabled={isCorrect} />
        ))}
      </RadioButton.Group>
    </AssessmentWrapper>
  );
}