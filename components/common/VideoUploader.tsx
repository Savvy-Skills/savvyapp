import React, { useState, memo, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, TextInput, ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { uploadVideo } from '@/services/mediaAPI';

interface VideoUploaderProps {
  videoUrl: string;
  onVideoSelected: (url: string) => void;
  label?: string;
}

// Using memo to prevent unnecessary re-renders
const VideoUploader = memo(function VideoUploader({ 
  videoUrl, 
  onVideoSelected, 
  label = 'Video' 
}: VideoUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Update manualUrl only when videoUrl changes
  useEffect(() => {
    setManualUrl(videoUrl);
  }, [videoUrl]);
  
  const pickVideo = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return;
    }
    
    // Launch video picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });
    
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setLoading(true);
      setIsUploading(true);
      
      try {
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = prev + 0.1;
            if (newProgress >= 0.9) {
              clearInterval(interval);
              return 0.9;
            }
            return newProgress;
          });
        }, 300);
        
        setProgressInterval(interval);
        
        // Upload the video
        const base64Video = `data:video/mp4;base64,${result.assets[0].base64}`;
        const uploadedVideo = await uploadVideo(base64Video);
        
        clearInterval(interval);
        setProgressInterval(null);
        setUploadProgress(1);
        
        // Update the video URL
        onVideoSelected(uploadedVideo.url);
        setManualUrl(uploadedVideo.url);
        
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Failed to upload video. Please try again.');
        setUploadProgress(0);
        setIsUploading(false);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const cancelUpload = () => {
    // Clear the progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    // Reset states
    setUploadProgress(0);
    setIsUploading(false);
    setLoading(false);
    
    // Note: This doesn't actually cancel the network request
    // To fully implement this, the uploadVideo function in mediaAPI
    // would need to support cancellation (e.g., using AbortController)
  };
  
  const handleUrlChange = (text: string) => {
    setManualUrl(text);
  };
  
  const handleUrlSubmit = () => {
    onVideoSelected(manualUrl);
  };
  
  // Function to extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Preview component
  const VideoPreview = () => {
    if (!videoUrl) return null;
    
    const videoId = extractVideoId(videoUrl);
    
    if (videoId) {
      return (
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={styles.iframe}
        />
      );
    } else if (videoUrl.endsWith('.mp4') || videoUrl.includes('/video/')) {
      // Render native video player for uploaded videos
      return (
        <video 
          width="100%" 
          height="200" 
          controls 
          style={styles.videoPlayer}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    
    return <Text>Invalid video URL</Text>;
  };
  
  return (
    <View style={styles.container}>
      <Text variant="labelLarge">{label}</Text>
      
      {videoUrl ? (
        <View style={styles.previewContainer}>
          <VideoPreview />
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text>No video selected</Text>
        </View>
      )}
      
      {isUploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text>Uploading video... {Math.round(uploadProgress * 100)}%</Text>
            <Button 
              mode="text" 
              compact 
              onPress={cancelUpload}
              icon="close-circle"
              labelStyle={styles.cancelButtonLabel}
            >
              Cancel
            </Button>
          </View>
          <ProgressBar progress={uploadProgress} style={styles.progressBar} />
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          label="Video URL"
          value={manualUrl}
          onChangeText={handleUrlChange}
          style={styles.input}
          onSubmitEditing={handleUrlSubmit}
          right={
            <TextInput.Icon
              icon="check"
              onPress={handleUrlSubmit}
              disabled={!manualUrl}
            />
          }
        />
      </View>
      
      <Button 
        mode="outlined" 
        onPress={pickVideo} 
        loading={loading}
        disabled={loading}
        icon="video"
        style={styles.button}
      >
        Select Video
      </Button>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if the videoUrl actually changed
  return prevProps.videoUrl === nextProps.videoUrl;
});

export default VideoUploader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  previewContainer: {
    marginVertical: 8,
    width: '100%',
  },
  placeholderContainer: {
    height: 200,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  inputContainer: {
    marginVertical: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cancelButtonLabel: {
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  iframe: {
    borderRadius: 8,
  },
  videoPlayer: {
    borderRadius: 8,
    width: '100%',
  },
}); 