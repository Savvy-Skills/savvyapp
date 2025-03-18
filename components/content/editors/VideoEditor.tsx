import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Button } from 'react-native-paper';
import { ContentInfo } from '@/types/index';

interface VideoEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function VideoEditor({ content, onContentChange }: VideoEditorProps) {
  const [videoUrl, setVideoUrl] = useState(content?.url || '');
  const [videoTitle, setVideoTitle] = useState(content?.title || '');

  useEffect(() => {
    if (content) {
      setVideoUrl(content.url || '');
      setVideoTitle(content.title || '');
    }
  }, [content]);

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    updateContent(url, videoTitle);
  };

  const handleTitleChange = (title: string) => {
    setVideoTitle(title);
    updateContent(videoUrl, title);
  };

  const updateContent = (url: string, title: string) => {
    onContentChange({
      type: 'Video',
      url: url,
      title: title
    });
  };

  // Function to extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Preview component
  const VideoPreview = () => {
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) return null;
    
    return (
      <View style={styles.previewContainer}>
        <Text variant="labelMedium" style={styles.previewLabel}>Preview:</Text>
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={styles.iframe}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Video Title"
        value={videoTitle}
        onChangeText={handleTitleChange}
        style={styles.input}
      />
      
      <TextInput
        label="Video URL"
        value={videoUrl}
        onChangeText={handleUrlChange}
        style={styles.input}
        placeholder="Enter YouTube URL"
      />
      
      <Text variant="bodySmall" style={styles.helpText}>
        Currently supports YouTube videos. Enter the full URL from the browser or sharing link.
      </Text>
      
      {videoUrl && <VideoPreview />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  helpText: {
    opacity: 0.6,
    marginBottom: 16,
  },
  previewContainer: {
    marginTop: 16,
    marginBottom: 16,
    width: '100%',
  },
  previewLabel: {
    marginBottom: 8,
  },
  iframe: {
    borderRadius: 8,
    // Note: iframe styling may need to be handled differently depending on your React Native setup
  },
}); 