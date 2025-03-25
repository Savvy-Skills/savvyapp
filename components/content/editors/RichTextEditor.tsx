import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ContentInfo } from '@/types/index';
import RichTextEditorComponent from '@/components/common/RichTextEditorComponent';

interface RichTextEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function RichTextEditor({ content, onContentChange }: RichTextEditorProps) {
  const [text, setText] = React.useState(content?.state || '');

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
      <RichTextEditorComponent
        value={text}
        onChange={handleTextChange}
        label="Content Text"
        placeholder="Enter your content here..."
        numberOfLines={8}
        enableColors={true}
        enableFontSize={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
}); 