import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Divider, SegmentedButtons } from 'react-native-paper';
import DefinitionComponent from '@/components/react/definitioncontent/DefinitionComponent';

interface DefinitionEditorProps {
  value: string;
  onChange: (newText: string) => void;
  label?: string;
  placeholder?: string;
  numberOfLines?: number;
  height?: number | string;
  editorHeight?: number | string;
}

const THEMES = [
  { value: 'purple', label: 'Purple' },
  { value: 'modern-purple', label: 'Modern Purple' },
  { value: 'modern-cream', label: 'Modern Cream' },
  { value: 'cards-purple', label: 'Cards Purple' },
];

export default function DefinitionEditor({ 
  value, 
  onChange,
  label = "Definition Text",
  placeholder = "Enter definition text here...\nUse {{word}} to highlight important terms.",
  numberOfLines = 8,
  height,
  editorHeight
}: DefinitionEditorProps) {
  const [text, setText] = useState(value || '');
  const [theme, setTheme] = useState('purple');
  const [title, setTitle] = useState('');
  useEffect(() => {
    setText(value || '');
  }, [value]);
  useEffect(() => {
    setTitle(title || '');
  }, [title]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onChange(newText);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onChange(newTitle);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // Mock timestamped transcription for preview
  const mockTranscription = {
    segments: [{
      words: []
    }]
  };

  return (
    <View style={[styles.container, height ? { height: height as number } : {}]}>
      <View style={styles.themeSelector}>
        <Text variant="titleSmall" style={styles.sectionTitle}>Theme:</Text>
        <SegmentedButtons
          value={theme}
          onValueChange={handleThemeChange}
          buttons={THEMES}
        />
      </View>

	  <View style={styles.titleSelector}>
		<TextInput
			label="Title"
			value={title}
			onChangeText={handleTitleChange}
		/>
	  </View>
      
      <TextInput
        label={label}
        value={text}
        onChangeText={handleTextChange}
        multiline
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        style={[styles.textArea, editorHeight ? { height: editorHeight as number } : {}]}
      />
      
      <View style={styles.previewContainer}>
        <Text variant="titleSmall" style={styles.previewTitle}>Preview:</Text>
        <Divider style={styles.divider} />
        <View style={styles.previewContent}>
          <DefinitionComponent 
            definitionText={text} 
            timestampedTranscription={mockTranscription}
            theme={theme}
			title={title}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  titleSelector: {
    marginBottom: 16,
  },
  themeSelector: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  textArea: {
    marginBottom: 16,
    minHeight: 100,
  },
  previewContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  previewTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  previewContent: {
    minHeight: 150,
  },
}); 