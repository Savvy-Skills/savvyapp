import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card, IconButton } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '@/services/mediaAPI';

interface FileUploaderProps {
  onFileUploaded: (fileData: any) => void;
  acceptedFileTypes?: string[];
  label?: string;
}

export default function FileUploader({ 
  onFileUploaded, 
  acceptedFileTypes = ['*/*'],
  label = 'File' 
}: FileUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedFileTypes,
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      setLoading(true);
      setFileName(result.assets[0].name);
      
      try {
        // Handle file based on type
        const fileUri = result.assets[0].uri;
        const fileType = result.assets[0].mimeType;
        
        // For JSON files, read and parse directly
        if (fileType === 'application/json') {
          const response = await fetch(fileUri);
          const jsonText = await response.text();
          
          try {
            const jsonData = JSON.parse(jsonText);
            onFileUploaded(jsonData);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            alert('The selected file is not valid JSON. Please try again.');
            setFileName(null);
            setLoading(false);
            return;
          }
        }
        
        // For other file types, upload to server
        const response = await fetch(fileUri);
        const blob = await response.blob();
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            
            // Upload the file
            const uploadedFile = await uploadFile(base64data, result.assets[0].name);
            
            // Pass the URL or data back
            onFileUploaded(uploadedFile.url || uploadedFile.data);
            setLoading(false);
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            alert('Failed to upload file. Please try again.');
            setFileName(null);
            setLoading(false);
          }
        };
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Failed to process file. Please try again.');
        setFileName(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      alert('Failed to select file. Please try again.');
    }
  };
  
  return (
    <View style={styles.container}>
      {fileName ? (
        <Card style={styles.fileCard}>
          <Card.Content style={styles.fileContent}>
            <View style={styles.fileInfo}>
              <Text variant="labelLarge">Selected File:</Text>
              <Text>{fileName}</Text>
            </View>
            <IconButton
              icon="close" 
              onPress={() => setFileName(null)}
              style={styles.clearButton}
            />
          </Card.Content>
        </Card>
      ) : null}
      
      <Button 
        mode="outlined" 
        onPress={pickFile} 
        loading={loading}
        disabled={loading}
        icon="file-upload"
        style={styles.button}
      >
        {fileName ? 'Change File' : `Select ${label}`}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  fileCard: {
    marginVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  fileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  clearButton: {
    marginLeft: 8,
  },
}); 