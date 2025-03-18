import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { ContentInfo } from '@/types/index';

interface NeuronEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function NeuronEditor({ content, onContentChange }: NeuronEditorProps) {
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="titleMedium">Neuron Editor</Text>
          <Text variant="bodyMedium" style={styles.placeholderText}>
            Neuron editor functionality will be implemented here.
            This will include configuration for neuron visualization parameters.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  placeholderText: {
    marginTop: 8,
    opacity: 0.7,
  },
}); 