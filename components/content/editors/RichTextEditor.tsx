import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ContentInfo } from '@/types/index';

interface RichTextEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function RichTextEditor({ content, onContentChange }: RichTextEditorProps) {
  const [text, setText] = useState(content?.state || '');

  useEffect(() => {
    if (content?.state) {
      setText(content.state);
    }
  }, [content]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onContentChange({
      type: 'Rich Text',
      state: newText
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Content Text"
        value={text}
        onChangeText={handleTextChange}
        multiline
        numberOfLines={8}
        style={styles.textArea}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textArea: {
    marginBottom: 16,
    minHeight: 200,
  },
}); 