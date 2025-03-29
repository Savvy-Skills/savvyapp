import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { ContentInfo } from '@/types/index';
import VideoUploader from '@/components/common/VideoUploader';

interface VideoEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function VideoEditor({ content, onContentChange }: VideoEditorProps) {
  const [videoUrl, setVideoUrl] = useState(content?.url || '');

  useEffect(() => {
    if (content) {
      setVideoUrl(content.url || '');
    }
  }, [content]);

  // Memoize the handler to prevent unnecessary re-renders
  const handleVideoSelected = useCallback((url: string) => {
    setVideoUrl(url);
    onContentChange({
      type: 'Video',
      url: url,
      // Preserve any other existing content properties
      ...(content?.title ? { title: content.title } : {})
    });
  }, [content, onContentChange]);

  return (
    <View style={styles.container}>
      <VideoUploader 
        videoUrl={videoUrl} 
        onVideoSelected={handleVideoSelected}
        label="Content Video" 
      />
      
      <Text variant="bodySmall" style={styles.helpText}>
        You can upload a video file or enter a YouTube URL.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  helpText: {
    opacity: 0.6,
    marginBottom: 16,
  },
}); 