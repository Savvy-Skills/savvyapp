import React, { useState } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/services/mediaAPI';

interface ImageUploaderProps {
  imageUrl: string;
  onImageSelected: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ imageUrl, onImageSelected, label = 'Image' }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState(imageUrl);
  
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    
    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });
    
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setLoading(true);
      try {
        // Upload the image
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const uploadedImage = await uploadImage(base64Image);
        
        // Update the image URL
        onImageSelected(uploadedImage.url);
        setManualUrl(uploadedImage.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleUrlChange = (text: string) => {
    setManualUrl(text);
  };
  
  const handleUrlSubmit = () => {
    onImageSelected(manualUrl);
  };
  
  return (
    <View style={styles.container}>
      <Text variant="labelLarge">{label}</Text>
      
      {imageUrl ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUrl }} style={styles.preview} />
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text>No image selected</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          label="Image URL"
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
        onPress={pickImage} 
        loading={loading}
        disabled={loading}
        icon="image"
        style={styles.button}
      >
        Select Image
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
    alignItems: 'center',
  },
  preview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginVertical: 8,
  },
  placeholderContainer: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    alignSelf: 'center',
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
}); 