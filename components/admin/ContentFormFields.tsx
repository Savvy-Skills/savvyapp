import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, SegmentedButtons } from 'react-native-paper';

type ContentType = 'Text' | 'Image' | 'Video';

interface ContentFormFieldsProps {
  contentType: ContentType;
  contentText: string;
  mediaUrl: string;
  onContentTypeChange: (type: ContentType) => void;
  onContentTextChange: (text: string) => void;
  onMediaUrlChange: (url: string) => void;
  onFormDataChange: (formData: any) => void;
}

export default function ContentFormFields({
  contentType,
  contentText,
  mediaUrl,
  onContentTypeChange,
  onContentTextChange,
  onMediaUrlChange,
  onFormDataChange
}: ContentFormFieldsProps) {
  
  useEffect(() => {
    // Update form data whenever any value changes
    const formData = {
      content_info: {
        type: contentType,
      },
      contents: contentType === 'Text' 
        ? [{ type: contentType, text: contentText }] 
        : [{ type: contentType, url: mediaUrl }]
    };
    
    onFormDataChange(formData);
  }, [contentType, contentText, mediaUrl]);

  return (
    <View style={styles.container}>
      <View style={styles.formSection}>
        <Text variant="titleMedium">Content Type</Text>
        <SegmentedButtons
          value={contentType}
          onValueChange={(value) => onContentTypeChange(value as ContentType)}
          buttons={[
            { value: 'Text', label: 'Text' },
            { value: 'Image', label: 'Image' },
            { value: 'Video', label: 'Video' }
          ]}
          style={styles.segmentedButton}
        />
      </View>

      {contentType === 'Text' ? (
        <TextInput
          label="Content Text"
          value={contentText}
          onChangeText={onContentTextChange}
          multiline
          numberOfLines={4}
          style={styles.input}
        />
      ) : (
        <TextInput
          label={contentType === 'Image' ? 'Image URL' : 'Video URL'}
          value={mediaUrl}
          onChangeText={onMediaUrlChange}
          style={styles.input}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  formSection: {
    marginVertical: 12,
  },
  segmentedButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
}); 