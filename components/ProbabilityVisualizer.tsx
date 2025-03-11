import { Colors } from '@/constants/Colors';
import React from 'react';
import { View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { probabilityVisualizerStyles } from '@/styles/styles';

interface ProbabilityVisualizerProps {
  probabilities: Record<string, number>;
  prediction: number;
  isEmpty?: boolean;
}

const ProbabilityVisualizer = ({ probabilities, prediction, isEmpty = false }: ProbabilityVisualizerProps) => {
  // Generate array of digits 0-9
  const digits = Array.from({ length: 10 }, (_, i) => i.toString());

  return (
    <Surface style={probabilityVisualizerStyles.container}>
      {digits.map((digit) => {
        // If canvas is empty, all probabilities are 0
        const probability = isEmpty ? 0 : (probabilities?.[digit] || 0);
        const isPredicted = !isEmpty && parseInt(digit) === prediction;
        
        return (
          <View key={digit} style={probabilityVisualizerStyles.digitContainer}>
            <View style={probabilityVisualizerStyles.barContainer}>
              <Animated.View 
                style={[
                  probabilityVisualizerStyles.probabilityBar, 
                  { 
                    height: `${Math.round(probability * 100)}%`,
                    backgroundColor: isPredicted ? Colors.success : Colors.blue,
                  }
                ]}
              />
            </View>
            <Text style={[
              probabilityVisualizerStyles.digit, 
              isPredicted && probabilityVisualizerStyles.predictedDigit
            ]}>
              {digit}
            </Text>
            <Text style={probabilityVisualizerStyles.percentage}>
              {(probability * 100).toFixed(0)}%
            </Text>
          </View>
        );
      })}
    </Surface>
  );
};

export default ProbabilityVisualizer; 