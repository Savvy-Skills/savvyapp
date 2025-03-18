import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput, SegmentedButtons, Divider } from 'react-native-paper';
import { ContentInfo, ContentTypes } from '@/types/index';
import { createContent } from '@/services/adminApi';
import ContentEditor from '@/components/content/ContentEditor';

interface ContentFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (content: ContentInfo) => void;
  viewId?: number;
}

export default function ContentFormDialog({
  visible,
  onDismiss,
  onSave,
  viewId
}: ContentFormDialogProps) {
  const [contentType, setContentType] = useState<ContentTypes>('Rich Text');
  const [contentTitle, setContentTitle] = useState('');
  const [contentData, setContentData] = useState<Partial<ContentInfo>>({});
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setContentType('Rich Text');
    setContentTitle('');
    setContentData({});
    setLoading(false);
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  const handleContentChange = (updatedContent: Partial<ContentInfo>) => {
    setContentData(updatedContent);
  };

  const isFormValid = () => {
    if (!contentTitle) return false;
    
    switch (contentType) {
      case 'Rich Text':
        return !!contentData.state;
      case 'Image':
      case 'Video':
        return !!contentData.url;
      case 'Dataset':
        return !!contentData.dataset_id;
      // Add validation for other content types as needed
      default:
        return false;
    }
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare content data with title and type
      const fullContentData: Partial<ContentInfo> = {
        ...contentData,
        title: contentTitle,
        type: contentType,
      };

      // Create content via API
      const createdContent = await createContent(fullContentData);
      
      // Notify parent component
      onSave(createdContent);
      resetForm();
    } catch (error) {
      console.error('Failed to create content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>Create New Content</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <View style={styles.container}>
            <TextInput
              label="Content Title"
              value={contentTitle}
              onChangeText={setContentTitle}
              style={styles.input}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>Content Type</Text>
            <SegmentedButtons
              value={contentType}
              onValueChange={(value) => setContentType(value as ContentTypes)}
              buttons={[
                { value: 'Rich Text', label: 'Text' },
                { value: 'Image', label: 'Image' },
                { value: 'Video', label: 'Video' },
                { value: 'Dataset', label: 'Dataset' }
              ]}
              style={styles.segmentedButton}
            />

            <Divider style={styles.divider} />

            <ContentEditor 
              contentType={contentType}
              onContentChange={handleContentChange}
            />
          </View>
        </Dialog.ScrollArea>
        <Divider />
        <Dialog.Actions style={styles.dialogActions}>
          <Button 
            onPress={handleDismiss}
            mode="outlined"
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button 
            onPress={handleSave} 
            loading={loading} 
            disabled={loading || !isFormValid()}
            mode="contained"
            style={styles.saveButton}
          >
            Create
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 600,
    width: '100%',
    marginHorizontal: "auto",
  },
  dialogTitle: {
    paddingBottom: 8,
  },
  scrollArea: {
    maxHeight: 500,
  },
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 8, 
    marginBottom: 8,
  },
  segmentedButton: {
    marginVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  dialogActions: {
    padding: 16,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    minWidth: 100,
  },
}); 