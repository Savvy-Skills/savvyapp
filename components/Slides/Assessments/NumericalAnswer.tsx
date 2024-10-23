import React, { useState } from 'react';
import AssessmentWrapper from '../AssessmentWrapper';
import { TextInput } from 'react-native-paper';
import { QuestionInfo } from '@/types';

export default function NumericalAnswerAssessment({ question }: {question: QuestionInfo}) {
  const [value, setValue] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const answer = parseFloat(question.options[0].text);

  const handleChange = (event: any) => {
	const { text } = event.nativeEvent;

    setValue(text.replace(/[^0-9.]/g, ''));
  };

  const handleSubmit = () => {
	// Check if correct answer is of type array, if not check if its an object(objects should have keys 'min' and 'max'), if not check if its a number
	let correct: boolean;
	if (Array.isArray(answer)) {
		correct = answer.includes(parseFloat(value));
	} else {
		correct = Math.abs(parseFloat(value)) === answer;
	}
	setIsCorrect(correct);
	return correct;
  };

  return (
    <AssessmentWrapper
      question={question}
      onSubmit={handleSubmit}
    >
      <TextInput
        value={value}
        onChange={handleChange}
		disabled={isCorrect}
      />
    </AssessmentWrapper>
  );
}