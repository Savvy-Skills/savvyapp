import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ContentInfo } from '@/types/index';

interface TokenizeEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

const defaultText = "Replace this text in the input field to see how tokenization works. Text in the input field to see how tokenization works.";

export default function TokenizeEditor({ content, onContentChange }: TokenizeEditorProps) {
  const [text, setText] = useState(content?.state?.value || defaultText);

  useEffect(() => {
    if (content?.state?.value) {
      setText(content.state.value);
    }
  }, [content]);

  useEffect(() => {
    if (text.length > 0) {
      onContentChange({ 
        state: {
          value: text
        }
      });
    }
  }, [text]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onContentChange({ 
      state: {
        value: newText
      }
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Tokenize Text"
        value={text}
        onChangeText={handleTextChange}
        multiline
        style={styles.input}
        placeholder="Initial text to tokenize"
      />
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    marginTop: 8,
    marginBottom: 4,
  },
}); 