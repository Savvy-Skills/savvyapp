import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import AssessmentWrapper from '../AssessmentWrapper';
import { AssessmentProps } from './SingleChoice';

export default function OpenEnded({ question, index }: AssessmentProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    return true;
  };

  return (
    <AssessmentWrapper question={question}>
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