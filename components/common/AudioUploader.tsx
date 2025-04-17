import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, ProgressBar } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { uploadAudio } from '@/services/mediaAPI';

interface AudioUploaderProps {
  audioUrl: string;
  onAudioSelected: (url: string) => void;
  label?: string;
}

export default function AudioUploader({ audioUrl, onAudioSelected, label = 'Audio' }: AudioUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Update manualUrl when audioUrl changes
  useEffect(() => {
    setManualUrl(audioUrl);
  }, [audioUrl]);
  
  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'audio/mpeg', 'audio/mp3', 'audio/wav'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      setLoading(true);
      setIsUploading(true);
      
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
      
      try {
        // Convert file to base64 and upload
        const fileUri = result.assets[0].uri;
        const response = await fetch(fileUri);
        const blob = await response.blob();
        
        // Convert blob to base64
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64data = reader.result as string;
              
              // Upload the audio
              const uploadedAudio = await uploadAudio(base64data);
              
              clearInterval(interval);
              setProgressInterval(null);
              setUploadProgress(1);
              
              // Update the audio URL
              onAudioSelected(uploadedAudio.url);
              setManualUrl(uploadedAudio.url);
              
              setTimeout(() => {
                setUploadProgress(0);
                setIsUploading(false);
                setLoading(false);
              }, 1000);
              
              resolve(uploadedAudio.url);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error uploading audio:', error);
        alert('Failed to upload audio. Please try again.');
        setUploadProgress(0);
        setIsUploading(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error picking audio:', error);
      alert('Failed to select audio. Please try again.');
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
  };
  
  const handleUrlChange = (text: string) => {
    setManualUrl(text);
  };
  
  const handleUrlSubmit = () => {
    onAudioSelected(manualUrl);
  };
  
  // Preview component
  const AudioPreview = () => {
    if (!audioUrl) return null;
    
    return (
      <audio 
        controls 
        style={styles.audioPlayer}
      >
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio tag.
      </audio>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text variant="labelLarge">{label}</Text>
      
      {audioUrl ? (
        <View style={styles.previewContainer}>
          <AudioPreview />
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text>No audio selected</Text>
        </View>
      )}
      
      {isUploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text>Uploading audio... {Math.round(uploadProgress * 100)}%</Text>
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
          label="Audio URL"
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
        onPress={pickAudio} 
        loading={loading}
        disabled={loading}
        icon="music"
        style={styles.button}
      >
        Select Audio
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  previewContainer: {
    marginVertical: 8,
    width: '100%',
  },
  placeholderContainer: {
    height: 60,
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
  audioPlayer: {
    width: '100%',
    borderRadius: 8,
  },
}); 