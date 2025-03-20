import React, { useState, memo, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, TextInput, ProgressBar, Card, Checkbox, HelperText, Chip } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { uploadDataset } from '@/services/mediaAPI';
import { DatasetInfo, Metadata } from '@/types';
import Papa from 'papaparse';

interface DatasetUploaderProps {
  onDatasetUploaded: (dataset: DatasetInfo) => void;
}

const DatasetUploader = memo(function DatasetUploader({ 
  onDatasetUploaded
}: DatasetUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileExtension, setFileExtension] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Metadata state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [isWordVec, setIsWordVec] = useState(false);
  const [metadata, setMetadata] = useState<Partial<Metadata>>({});
  const [hasFileError, setHasFileError] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState('');

  // Add a new state to store the file object
  const [fileObject, setFileObject] = useState<File | null>(null);

  const pickDatasetFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return;
      }
      
      // Reset errors
      setHasFileError(false);
      setFileErrorMessage('');
      
      const file = result.assets[0];
      setFileName(file.name);
      
      // Get file extension
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      setFileExtension(extension);
      
      // Store the file object for web
      if (Platform.OS === 'web') {
        // For web: get the actual File object
        // Clone the response first before consuming it
        const response = await fetch(file.uri);
        
        // Create two clones so we can use one for blob and one for text
        const responseForBlob = response.clone();
        const responseForText = response.clone();
        
        // Use one clone to get the file object
        const blob = await responseForBlob.blob();
        const fileObj = new File([blob], file.name, { type: file.mimeType });
        setFileObject(fileObj);
        
        // Use the other clone to extract metadata
        const text = await responseForText.text();
        setFileContent(text);
        
        try {
          await extractMetadata(text, extension);
        } catch (error) {
          console.warn('Could not automatically extract metadata', error);
        }
      } else {
        // For native: we'll use the URI in FormData later
        setFileObject(null); // Clear any previous file object
        
        // Read content for metadata extraction
        const content = await FileSystem.readAsStringAsync(file.uri);
        setFileContent(content);
        
        try {
          await extractMetadata(content, extension);
        } catch (error) {
          console.warn('Could not automatically extract metadata', error);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      setHasFileError(true);
      setFileErrorMessage('Failed to read the selected file. Please try again.');
    }
  };
  
  const extractMetadata = async (content: string, extension: string) => {
    let metadataObj: Partial<Metadata> = {};
    
    try {
      // For CSV files, use Papaparse to parse data
      if (extension === 'csv') {
        const parseResult = Papa.parse(content, {
          header: true,
          skipEmptyLines: true
        });
        
        if (parseResult.data && parseResult.data.length > 0) {
          const rows = parseResult.data.length;
          const columns_names = parseResult.meta.fields || [];
          const columns = columns_names.length;
          
          metadataObj = {
            rows,
            columns,
            columns_names
          };
        }
      }
      // For JSON files, attempt to parse
      else if (extension === 'json') {
        const jsonData = JSON.parse(content);
        
        if (Array.isArray(jsonData)) {
          const rows = jsonData.length;
          if (rows > 0 && typeof jsonData[0] === 'object') {
            const columns = Object.keys(jsonData[0]).length;
            const columns_names = Object.keys(jsonData[0]);
            
            metadataObj = {
              rows,
              columns,
              columns_names
            };
          }
        }
      }
      
      // Update metadata state
      setMetadata(metadataObj);
    } catch (error) {
      console.warn('Error extracting metadata:', error);
    }
  };
  
  const uploadDatasetFile = async () => {
    if ((!fileContent && !fileObject) || !name || !fileExtension) {
      setHasFileError(true);
      setFileErrorMessage('Please provide a file and dataset name before uploading');
      return;
    }
    
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
      
      // Prepare complete metadata
      const completeMetadata: Metadata = {
        description: description || undefined,
        source: source || undefined,
        rows: metadata.rows || 0,
        columns: metadata.columns || 0,
        columns_names: metadata.columns_names || []
      };
      
      // Create FormData
      const formData = new FormData();
      
      // Add the file
      if (Platform.OS === 'web' && fileObject) {
        // For web, use the File object
        formData.append('content', fileObject);
      } else if (Platform.OS !== 'web' && fileName) {
        // For native, create a file object from the URI
        // Note: This approach may need adjustments based on your Expo setup
        const fileUriParts = fileName.split('.');
        const fileType = fileUriParts[fileUriParts.length - 1];
        
        // @ts-ignore - FormData in React Native may have different typings
        formData.append('content', {
          uri: fileContent,
          name: fileName,
          type: `application/${fileType}`
        });
      }
      
      // Add other data
      formData.append('metadata', JSON.stringify(completeMetadata));
      formData.append('name', name);
      formData.append('extension', fileExtension);
      formData.append('word_vec', String(isWordVec));
      
      // Upload the dataset using FormData
      const uploadedDataset = await uploadDataset(
        formData
      );
      
      clearInterval(interval);
      setProgressInterval(null);
      setUploadProgress(1);
      
      // Call the callback with the uploaded dataset
      onDatasetUploaded(uploadedDataset);
      
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
        
        // Reset form after successful upload
        setFileName('');
        setFileContent(null);
        setFileObject(null);
        setName('');
        setDescription('');
        setSource('');
        setIsWordVec(false);
        setMetadata({});
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading dataset:', error);
      setHasFileError(true);
      setFileErrorMessage('Failed to upload dataset. Please try again.');
      setUploadProgress(0);
      setIsUploading(false);
    } finally {
      setLoading(false);
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
  
  return (
    <Card style={styles.container}>
      <Card.Title title="Upload New Dataset" />
      <Card.Content>
        <View style={styles.fileSection}>
          <Text variant="labelLarge">Dataset File</Text>
          
          {fileName ? (
            <View style={styles.fileInfoContainer}>
              <Chip icon="file-document-outline" style={styles.fileChip}>
                {fileName}
              </Chip>
              <Button 
                mode="text" 
                icon="close" 
                onPress={() => {
                  setFileName('');
                  setFileContent(null);
                  setFileExtension('');
                }}
                compact
              >
                Clear
              </Button>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text>No file selected</Text>
              <Text variant="bodySmall">Supported formats: CSV, JSON</Text>
            </View>
          )}
          
          {hasFileError && (
            <HelperText type="error" visible={hasFileError}>
              {fileErrorMessage}
            </HelperText>
          )}
          
          <Button 
            mode="outlined" 
            onPress={pickDatasetFile} 
            loading={loading}
            disabled={loading}
            icon="file-upload"
            style={styles.button}
          >
            Select File
          </Button>
        </View>
        
        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text>Uploading dataset... {Math.round(uploadProgress * 100)}%</Text>
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
        
        <View style={styles.metadataSection}>
          <Text variant="labelLarge" style={styles.sectionTitle}>Dataset Metadata</Text>
          
          <TextInput
            label="Dataset Name *"
            value={name}
            onChangeText={setName}
            style={styles.input}
            error={!name && hasFileError}
          />
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            numberOfLines={2}
          />
          
          <TextInput
            label="Source URL"
            value={source}
            onChangeText={setSource}
            style={styles.input}
          />
          
          {metadata.rows !== undefined && (
            <View style={styles.metadataInfo}>
              <Chip icon="table-row" style={styles.metadataChip}>Rows: {metadata.rows}</Chip>
              <Chip icon="table-column" style={styles.metadataChip}>Columns: {metadata.columns}</Chip>
            </View>
          )}
          
          {metadata.columns_names && metadata.columns_names.length > 0 && (
            <View style={styles.columnsContainer}>
              <Text variant="bodySmall">Columns:</Text>
              <View style={styles.columnChips}>
                {metadata.columns_names.slice(0, 5).map((column, index) => (
                  <Chip key={index} style={styles.columnChip}>{column}</Chip>
                ))}
                {metadata.columns_names.length > 5 && (
                  <Chip style={styles.columnChip}>+{metadata.columns_names.length - 5} more</Chip>
                )}
              </View>
            </View>
          )}
          
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={isWordVec ? 'checked' : 'unchecked'}
              onPress={() => setIsWordVec(!isWordVec)}
            />
            <Text style={styles.checkboxLabel} onPress={() => setIsWordVec(!isWordVec)}>
              This is a Word2Vec dataset
            </Text>
          </View>
          <HelperText type="info">
            Word2Vec datasets contain word embeddings that can be used for text analysis
          </HelperText>
        </View>
        
        <Button 
          mode="contained" 
          onPress={uploadDatasetFile} 
          loading={loading}
          disabled={loading || !fileContent || !name}
          icon="cloud-upload"
          style={styles.uploadButton}
        >
          Upload Dataset
        </Button>
      </Card.Content>
    </Card>
  );
});

export default DatasetUploader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  fileSection: {
    marginBottom: 16,
  },
  metadataSection: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  placeholderContainer: {
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  fileChip: {
    flexGrow: 1,
    marginRight: 8,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  uploadButton: {
    marginTop: 24,
  },
  progressContainer: {
    marginVertical: 16,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  metadataInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  metadataChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  columnsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  columnChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  columnChip: {
    marginRight: 4,
    marginBottom: 4,
  },
}); 