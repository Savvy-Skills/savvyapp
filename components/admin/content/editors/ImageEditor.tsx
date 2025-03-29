import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { ContentInfo } from '@/types/index';
import ImageUploader from '@/components/common/ImageUploader';

interface ImageEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function ImageEditor({ content, onContentChange }: ImageEditorProps) {
  const [imageUrl, setImageUrl] = useState(content?.url || '');
  const [altText, setAltText] = useState(content?.image?.description || '');

  useEffect(() => {
    if (content) {
      setImageUrl(content.url || '');
      setAltText(content.image?.description || '');
    }
  }, [content]);

  const handleImageSelected = (url: string) => {
    setImageUrl(url);
    updateContent(url, altText);
  };

  const handleAltTextChange = (text: string) => {
    setAltText(text);
    updateContent(imageUrl, text);
  };

  const updateContent = (url: string, description: string) => {
    onContentChange({
      type: 'Image',
      url: url,
      image: {
        url: url,
        description: description
      }
    });
  };

  return (
    <View style={styles.container}>
      <ImageUploader 
        imageUrl={imageUrl} 
        onImageSelected={handleImageSelected}
        label="Content Image" 
      />
      
      <TextInput
        label="Alt Text / Description"
        value={altText}
        onChangeText={handleAltTextChange}
        style={styles.input}
      />
      
      <Text variant="bodySmall" style={styles.helpText}>
        Alt text helps make your content accessible to users with visual impairments.
      </Text>
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
  helpText: {
    opacity: 0.6,
    marginBottom: 16,
  },
}); 