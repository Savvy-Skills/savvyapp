import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, Button, Card, Chip } from 'react-native-paper';
import { ContentInfo, DatasetInfo } from '@/types/index';
import { getDatasets } from '@/services/adminApi';
import { useDataFetch } from '@/hooks/useDataFetch';
import DatasetUploader from '@/components/common/DatasetUploader';

interface Word2VecEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function Word2VecEditor({ content, onContentChange }: Word2VecEditorProps) {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState(content?.dataset_id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  // Find the selected dataset object
  const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);
  
  // Use the useDataFetch hook to get the data for the selected dataset
  const { data, isLoading: dataLoading, error: dataError } = useDataFetch({
    source: selectedDataset?.url || '',
    isCSV: selectedDataset?.url?.endsWith('.csv') || false,
  });

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (content?.dataset_id) {
      setSelectedDatasetId(content.dataset_id);
    }
  }, [content]);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      // Only get Word2Vec datasets
      const fetchedDatasets = await getDatasets({ word_vec_only: true });
      setDatasets(fetchedDatasets);
    } catch (error) {
      console.error('Error loading Word2Vec datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetSelect = (datasetId: string, datasetInfo: DatasetInfo) => {
    setSelectedDatasetId(datasetId);
    updateContent(datasetId, datasetInfo);
  };

  // Function to update the content
  const updateContent = (
    datasetId: string = selectedDatasetId,
    datasetInfo: DatasetInfo | undefined = selectedDataset
  ) => {
    onContentChange({
      type: 'Word2Vec',
      dataset_id: datasetId,
      dataset_info: datasetInfo
    });
  };

  // Add this function to handle the newly uploaded dataset
  const handleDatasetUploaded = (dataset: DatasetInfo) => {
    // Add the new dataset to the list
    setDatasets(prev => [dataset, ...prev]);
    
    // Select the newly uploaded dataset
    handleDatasetSelect(dataset.id, dataset);
    
    // Hide the uploader
    setShowUploader(false);
  };

  // Filter datasets based on search query
  const filteredDatasets = datasets.filter(dataset => 
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dataset.metadata.description && 
     dataset.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {selectedDataset ? (
        // Show Word2Vec dataset preview when a dataset is selected
        <>
          <Card style={styles.selectedDatasetCard}>
            <Card.Title 
              title="Selected Word2Vec Dataset" 
              subtitle={selectedDataset.name} 
              right={() => (
                <Button 
                  icon="close" 
                  onPress={() => handleDatasetSelect('', {} as DatasetInfo)} 
                  mode="text"
                >
                  Change
                </Button>
              )} 
            />
            <Card.Content>
              <Text variant="bodyMedium">
                {selectedDataset.metadata.description || 'No description available'}
              </Text>
              <Text variant="bodyMedium" style={styles.datasetSize}>
                Dataset size: {selectedDataset.metadata.rows} words
              </Text>
              
              {dataLoading ? (
                <Text style={styles.loadingText}>Loading dataset data...</Text>
              ) : dataError ? (
                <Text style={styles.errorText}>Error loading data: {dataError}</Text>
              ) : (
                <View style={styles.previewContainer}>
                  {data && data.length > 0 && (
                    <Card style={styles.previewCard}>
                      <Card.Title title="Dataset Preview" />
                      <Card.Content>
                        <Text style={styles.previewTitle}>First 5 words in dataset:</Text>
                        <View style={styles.wordsList}>
                          {data.slice(0, 5).map((item, index) => {
                            const word = Object.values(item)[0];
                            return (
                              <Chip 
                                key={index} 
                                style={styles.wordChip}
                              >
                                {word}
                              </Chip>
                            );
                          })}
                        </View>
                      </Card.Content>
                    </Card>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        </>
      ) : (
        // Show dataset selection UI when no dataset is selected
        <>
          <Card style={styles.headerCard}>
            <Card.Title title="Select a Word2Vec Dataset" />
            <Card.Content>
              <Text variant="bodyMedium">
                Choose a Word2Vec dataset for your word guessing game.
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Available Word2Vec Datasets</Text>
            <Button 
              mode="outlined" 
              icon="plus" 
              onPress={() => setShowUploader(true)}
            >
              Upload New
            </Button>
          </View>
          
          {showUploader && (
            <DatasetUploader onDatasetUploaded={handleDatasetUploaded} />
          )}
          
          {loading ? (
            <Text>Loading Word2Vec datasets...</Text>
          ) : (
            <View style={styles.searchContainer}>
              <TextInput
                label="Search Datasets"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                right={<TextInput.Icon icon="magnify" />}
              />
              
              {filteredDatasets.length === 0 ? (
                <Text style={styles.noResults}>
                  No Word2Vec datasets found. Please upload a Word2Vec dataset to continue.
                </Text>
              ) : (
                <ScrollView style={styles.datasetList}>
                  {filteredDatasets.map((dataset) => (
                    <Card 
                      key={dataset.id} 
                      style={[
                        styles.datasetCard,
                        selectedDatasetId === dataset.id && styles.selectedCard
                      ]}
                      onPress={() => handleDatasetSelect(dataset.id, dataset)}
                    >
                      <Card.Title 
                        title={dataset.name} 
                        subtitle={`${dataset.metadata.rows} words`}
                        right={() => (
                          <Chip icon="vector-point" style={styles.word2vecChip}>Word2Vec</Chip>
                        )}
                      />
                      {dataset.metadata.description && (
                        <Card.Content>
                          <Text variant="bodyMedium" numberOfLines={2} ellipsizeMode="tail">
                            {dataset.metadata.description}
                          </Text>
                        </Card.Content>
                      )}
                    </Card>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          <Button 
            mode="outlined" 
            icon="refresh" 
            onPress={loadDatasets} 
            style={styles.refreshButton}
            loading={loading}
          >
            Refresh List
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerCard: {
    marginBottom: 16,
  },
  selectedDatasetCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  previewContainer: {
    marginTop: 16,
  },
  previewCard: {
    marginBottom: 16,
  },
  datasetSize: {
    marginTop: 8,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  datasetList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  datasetCard: {
    marginBottom: 8,
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  word2vecChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginRight: 8,
  },
  refreshButton: {
    marginTop: 8,
  },
  noResults: {
    textAlign: 'center',
    marginVertical: 32,
    opacity: 0.7,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 16,
    marginBottom: 16,
  },
  previewTitle: {
    fontWeight: '500',
    marginBottom: 8,
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  wordChip: {
    margin: 4,
  },
}); 