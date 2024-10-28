import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import AssessmentWrapper from '../AssessmentWrapper';
import { QuestionInfo } from '@/types';

export default function OpenEnded({ question }: {question: QuestionInfo}) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    return true;
  };

  return (
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
		<View>
			<TextInput
				onChangeText={setAnswer}
				value={answer}
				placeholder="Type your answer here"
			/>
		</View>
    </AssessmentWrapper>
  );
}