import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, Button, Card, Chip } from 'react-native-paper';
import { ContentInfo, DatasetInfo } from '@/types/index';
// import { fetchDatasets } from '@/services/datasetApi'; // You'll need to implement this API service

interface DatasetEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function DatasetEditor({ content, onContentChange }: DatasetEditorProps) {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState(content?.dataset_id || '');
  const [searchQuery, setSearchQuery] = useState('');

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
      // const fetchedDatasets = await fetchDatasets();
      // setDatasets(fetchedDatasets);
    } catch (error) {
      console.error('Error loading datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetSelect = (datasetId: string, datasetInfo: DatasetInfo) => {
    setSelectedDatasetId(datasetId);
    onContentChange({
      type: 'Dataset',
      dataset_id: datasetId,
      dataset_info: datasetInfo
    });
  };

  const filteredDatasets = datasets.filter(dataset => 
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dataset.metadata.description && 
     dataset.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);

  return (
    <View style={styles.container}>
      <TextInput
        label="Search Datasets"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        right={<TextInput.Icon icon="magnify" />}
      />
      
      {selectedDataset && (
        <Card style={styles.selectedDatasetCard}>
          <Card.Title 
            title="Selected Dataset" 
            subtitle={selectedDataset.name} 
            right={() => (
              <Button 
                icon="close" 
                onPress={() => handleDatasetSelect('', {} as DatasetInfo)} 
                mode="text"
              >
                Clear
              </Button>
            )} 
          />
          <Card.Content>
            <Text variant="bodyMedium">
              {selectedDataset.metadata.description || 'No description available'}
            </Text>
            <View style={styles.metadataContainer}>
              <Chip icon="table-row" style={styles.chip}>Rows: {selectedDataset.metadata.rows}</Chip>
              <Chip icon="table-column" style={styles.chip}>Columns: {selectedDataset.metadata.columns}</Chip>
              {selectedDataset.metadata.source && (
                <Chip icon="link" style={styles.chip}>Source: {selectedDataset.metadata.source}</Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      )}
      
      <Text variant="titleMedium" style={styles.sectionTitle}>Available Datasets</Text>
      
      {loading ? (
        <Text>Loading datasets...</Text>
      ) : (
        <ScrollView style={styles.datasetList}>
          {filteredDatasets.length > 0 ? (
            filteredDatasets.map((dataset) => (
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
                  subtitle={`${dataset.metadata.rows} rows × ${dataset.metadata.columns} columns`}
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
  searchInput: {
    marginBottom: 16,
  },
  selectedDatasetCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6200ee',
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
  noResults: {
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.6,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginTop: 8,
  },
  refreshButton: {
    marginTop: 8,
  },
}); 