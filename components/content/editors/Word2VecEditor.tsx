import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { ContentInfo } from '@/types/index';

interface Word2VecEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function Word2VecEditor({ content, onContentChange }: Word2VecEditorProps) {
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="titleMedium">Word2Vec Editor</Text>
          <Text variant="bodyMedium" style={styles.placeholderText}>
            Word2Vec editor functionality will be implemented here.
            This will include configuration for word embedding visualization and analysis.
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