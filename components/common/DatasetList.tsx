import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, Button, Card, Chip } from 'react-native-paper';
import { DatasetInfo } from '@/types/index';
import { getDatasets } from '@/services/adminApi';
import DatasetUploader from '@/components/common/DatasetUploader';

interface DatasetListProps {
  selectedDatasetId?: string;
  onDatasetSelect: (datasetId: string, datasetInfo: DatasetInfo) => void;
  showWordVecDatasets?: boolean;
}

export default function DatasetList({ 
  selectedDatasetId, 
  onDatasetSelect, 
  showWordVecDatasets = true 
}: DatasetListProps) {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const fetchedDatasets = await getDatasets({
        word_vec_only: false
      });
      setDatasets(fetchedDatasets);
    } catch (error) {
      console.error('Error loading datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetUploaded = (dataset: DatasetInfo) => {
    setDatasets(prev => [dataset, ...prev]);
    onDatasetSelect(dataset.id, dataset);
    setShowUploader(false);
  };

  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  const filteredDatasets = datasets.filter(dataset => {
    // Filter by search query
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dataset.metadata.description && 
       dataset.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by word_vec if needed
    const matchesType = showWordVecDatasets ? true : !dataset.word_vec;
    
    return matchesSearch && matchesType;
  });

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Available Datasets</Text>
        <Button 
          mode="outlined" 
          icon={showUploader ? "close" : "plus"}
          onPress={toggleUploader}
        >
          {showUploader ? "Cancel Upload" : "Upload New"}
        </Button>
      </View>
      
      {showUploader && (
        <Card style={styles.uploaderCard}>
          <Card.Content>
            <DatasetUploader onDatasetUploaded={handleDatasetUploaded} />
          </Card.Content>
        </Card>
      )}
      
      {loading ? (
        <Text>Loading datasets...</Text>
      ) : (
        <View style={styles.searchContainer}>
          <TextInput
            label="Search Datasets"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            right={<TextInput.Icon icon="magnify" />}
          />
          <ScrollView style={styles.datasetList}>
            {filteredDatasets.length > 0 ? (
              filteredDatasets.map((dataset) => (
                <Card 
                  key={dataset.id} 
                  style={[
                    styles.datasetCard,
                    selectedDatasetId === dataset.id && styles.selectedCard,
                    dataset.word_vec && styles.word2vecCard
                  ]}
                  onPress={() => onDatasetSelect(dataset.id, dataset)}
                >
                  <Card.Title 
                    title={dataset.name} 
                    subtitle={`${dataset.metadata.rows} rows × ${dataset.metadata.columns} columns`}
                    right={() => dataset.word_vec ? (
                      <Chip icon="vector-point" style={[styles.miniChip, styles.word2vecChip]}>Word2Vec</Chip>
                    ) : null}
                  />
                  {dataset.metadata.description && (
                    <Card.Content>
                      <Text variant="bodyMedium" numberOfLines={2} ellipsizeMode="tail">
                        {dataset.metadata.description}
                      </Text>
                    </Card.Content>
                  )}
                </Card>
              ))
            ) : (
              <Text style={styles.noResults}>No datasets found matching your search criteria.</Text>
            )}
          </ScrollView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    gap: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
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
    borderColor: '#6200ee',
  },
  word2vecCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  word2vecChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  miniChip: {
    height: 24,
    marginRight: 8,
  },
  noResults: {
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.6,
  },
  refreshButton: {
    marginTop: 8,
  },
  uploaderCard: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
}); 