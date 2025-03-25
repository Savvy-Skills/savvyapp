import React from 'react';
import { View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

interface ExplanationInputProps {
  explanation: string;
  onChange: (explanation: string) => void;
  label?: string;
}

const ExplanationInput: React.FC<ExplanationInputProps> = ({
  explanation,
  onChange,
  label = 'Explanation'
}) => {
  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ marginBottom: 8 }} variant="titleMedium">
        {label}
      </Text>
      <TextInput
        mode="outlined"
        multiline
        numberOfLines={4}
        placeholder="Provide an explanation for this question that will be shown after answering"
        value={explanation}
        onChangeText={onChange}
      />
    </View>
  );
};

export default ExplanationInput; 