import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, Switch, SegmentedButtons, Divider, IconButton, Chip } from 'react-native-paper';
import { ContentInfo, DatasetInfo } from '@/types/index';
import ColorPicker from '@/components/common/ColorPicker';
import { getDatasets } from '@/services/adminApi';
import DatasetUploader from '@/components/common/DatasetUploader';

interface NeuronEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

interface AxisConfig {
  min: number;
  max: number;
  name: string;
  emoji: string;
  suffix: string;
  tickText?: string[];
  tickValues?: number[];
}

interface ClassConfig {
  color: string;
  value: string;
}

interface NeuronConfig {
  axes: {
    x: AxisConfig;
    y: AxisConfig;
  };
  locked: {
    bias: boolean;
    weight1: boolean;
    weight2: boolean;
  };
  classes: {
    neutral: ClassConfig;
    negative: ClassConfig;
    positive: ClassConfig;
  };
  initialValues: {
    bias: number;
    weight1: number;
    weight2: number;
  };
  useVerticalSlider: boolean;
}

// Default config to use when creating a new neuron visualization
const DEFAULT_CONFIG: NeuronConfig = {
  axes: {
    x: {
      min: 0,
      max: 100,
      name: "X-Axis",
      emoji: "📊",
      suffix: ""
    },
    y: {
      min: 0,
      max: 100,
      name: "Y-Axis",
      emoji: "📈",
      suffix: ""
    }
  },
  locked: {
    bias: false,
    weight1: false,
    weight2: false
  },
  classes: {
    neutral: {
      color: "#eeeeee",
      value: "Neutral"
    },
    negative: {
      color: "#a197f9",
      value: "Negative"
    },
    positive: {
      color: "#ffb850",
      value: "Positive"
    }
  },
  initialValues: {
    bias: 0,
    weight1: 0,
    weight2: 0
  },
  useVerticalSlider: true
};

export default function NeuronEditor({ content, onContentChange }: NeuronEditorProps) {
  // Initialize state with content or default values
  const [config, setConfig] = useState<NeuronConfig>(
    (content?.neuronConfig as NeuronConfig) || DEFAULT_CONFIG
  );
  const [activeTab, setActiveTab] = useState<'axes' | 'classes' | 'weights'>('axes');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Dataset related state
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState(content?.dataset_id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    if (content?.neuronConfig) {
      setConfig(content.neuronConfig as NeuronConfig);
    }
    if (content?.dataset_id) {
      setSelectedDatasetId(content.dataset_id);
    }
  }, [content]);

  useEffect(() => {
    loadDatasets();
  }, []);

  // Update content when config changes
  const updateConfig = useCallback((newConfig: NeuronConfig) => {
    setConfig(newConfig);
    onContentChange({
      type: 'Neuron',
      neuronConfig: newConfig,
      dataset_id: selectedDatasetId
    });
  }, [selectedDatasetId]);

  // Helper function to update specific parts of the config
  const updateConfigPartial = (path: string[], value: any) => {
    const newConfig = {...config};
    let current = newConfig;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i] as keyof typeof current] as any;
    }
    
    const lastKey = path[path.length - 1];
    current[lastKey as keyof typeof current] = value;
    
    updateConfig(newConfig);
  };

  // Dataset loading function
  const loadDatasets = async () => {
    setLoading(true);
    try {
      const fetchedDatasets = await getDatasets({word_vec_only: false});
      setDatasets(fetchedDatasets);
    } catch (error) {
      console.error('Error loading datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetSelect = (datasetId: string, datasetInfo: DatasetInfo) => {
    setSelectedDatasetId(datasetId);
    onContentChange({
      type: 'Neuron',
      neuronConfig: config,
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

  // Get the selected dataset object
  const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);

  // Filter datasets based on search query
  const filteredDatasets = datasets.filter(dataset => 
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dataset.metadata.description && 
     dataset.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderAxesTab = () => (
    <ScrollView>
      <Card style={styles.sectionCard}>
        <Card.Title title="X-Axis Configuration" />
        <Card.Content>
          <TextInput
            label="Name"
            value={config.axes.x.name}
            onChangeText={(value) => updateConfigPartial(['axes', 'x', 'name'], value)}
            style={styles.formInput}
          />
          
          <View style={styles.inputRow}>
            <TextInput
              label="Emoji"
              value={config.axes.x.emoji}
              onChangeText={(value) => updateConfigPartial(['axes', 'x', 'emoji'], value)}
              style={[styles.formInput, styles.emojiInput]}
            />
            <TextInput
              label="Suffix"
              value={config.axes.x.suffix}
              onChangeText={(value) => updateConfigPartial(['axes', 'x', 'suffix'], value)}
              style={[styles.formInput, styles.suffixInput]}
            />
          </View>
          
          <View style={styles.inputRow}>
            <TextInput
              label="Min Value"
              value={config.axes.x.min.toString()}
              onChangeText={(value) => {
                const num = parseFloat(value);
                if (!isNaN(num)) updateConfigPartial(['axes', 'x', 'min'], num);
              }}
              keyboardType="numeric"
              style={[styles.formInput, styles.halfInput]}
            />
            <TextInput
              label="Max Value"
              value={config.axes.x.max.toString()}
              onChangeText={(value) => {
                const num = parseFloat(value);
                if (!isNaN(num)) updateConfigPartial(['axes', 'x', 'max'], num);
              }}
              keyboardType="numeric"
              style={[styles.formInput, styles.halfInput]}
            />
          </View>
          
          {showAdvanced && (
            <View style={styles.advancedSection}>
              <Text style={styles.sectionLabel}>Advanced: Custom Tick Marks</Text>
              <Button 
                mode="outlined" 
                icon="plus"
                onPress={() => {
                  const xAxis = {...config.axes.x};
                  xAxis.tickValues = xAxis.tickValues || [0, 50, 100];
                  xAxis.tickText = xAxis.tickText || ["Min", "Mid", "Max"];
                  updateConfigPartial(['axes', 'x'], xAxis);
                }}
                style={styles.addButton}
              >
                Add Custom Ticks
              </Button>
              
              {config.axes.x.tickValues && (
                <View style={styles.ticksContainer}>
                  {config.axes.x.tickValues.map((value, index) => (
                    <View key={`x-tick-${index}`} style={styles.tickRow}>
                      <TextInput
                        label="Value"
                        value={value.toString()}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          if (!isNaN(num)) {
                            const newTickValues = [...config.axes.x.tickValues!];
                            newTickValues[index] = num;
                            updateConfigPartial(['axes', 'x', 'tickValues'], newTickValues);
                          }
                        }}
                        keyboardType="numeric"
                        style={styles.tickValueInput}
                      />
                      <TextInput
                        label="Label"
                        value={config.axes.x.tickText?.[index] || ''}
                        onChangeText={(text) => {
                          const newTickText = [...(config.axes.x.tickText || [])];
                          newTickText[index] = text;
                          updateConfigPartial(['axes', 'x', 'tickText'], newTickText);
                        }}
                        style={styles.tickTextInput}
                      />
                      <IconButton
                        icon="delete"
                        onPress={() => {
                          const newTickValues = [...config.axes.x.tickValues!];
                          const newTickText = [...(config.axes.x.tickText || [])];
                          newTickValues.splice(index, 1);
                          newTickText.splice(index, 1);
                          
                          updateConfigPartial(['axes', 'x', 'tickValues'], newTickValues.length ? newTickValues : undefined);
                          updateConfigPartial(['axes', 'x', 'tickText'], newTickText.length ? newTickText : undefined);
                        }}
                      />
                    </View>
                  ))}
                  
                  <Button 
                    mode="text" 
                    icon="plus"
                    onPress={() => {
                      const newTickValues = [...(config.axes.x.tickValues || []), 0];
                      const newTickText = [...(config.axes.x.tickText || []), ''];
                      updateConfigPartial(['axes', 'x', 'tickValues'], newTickValues);
                      updateConfigPartial(['axes', 'x', 'tickText'], newTickText);
                    }}
                    style={styles.addTickButton}
                  >
                    Add Tick
                  </Button>
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title title="Y-Axis Configuration" />
        <Card.Content>
          <TextInput
            label="Name"
            value={config.axes.y.name}
            onChangeText={(value) => updateConfigPartial(['axes', 'y', 'name'], value)}
            style={styles.formInput}
          />
          
          <View style={styles.inputRow}>
            <TextInput
              label="Emoji"
              value={config.axes.y.emoji}
              onChangeText={(value) => updateConfigPartial(['axes', 'y', 'emoji'], value)}
              style={[styles.formInput, styles.emojiInput]}
            />
            <TextInput
              label="Suffix"
              value={config.axes.y.suffix}
              onChangeText={(value) => updateConfigPartial(['axes', 'y', 'suffix'], value)}
              style={[styles.formInput, styles.suffixInput]}
            />
          </View>
          
          <View style={styles.inputRow}>
            <TextInput
              label="Min Value"
              value={config.axes.y.min.toString()}
              onChangeText={(value) => {
                const num = parseFloat(value);
                if (!isNaN(num)) updateConfigPartial(['axes', 'y', 'min'], num);
              }}
              keyboardType="numeric"
              style={[styles.formInput, styles.halfInput]}
            />
            <TextInput
              label="Max Value"
              value={config.axes.y.max.toString()}
              onChangeText={(value) => {
                const num = parseFloat(value);
                if (!isNaN(num)) updateConfigPartial(['axes', 'y', 'max'], num);
              }}
              keyboardType="numeric"
              style={[styles.formInput, styles.halfInput]}
            />
          </View>
          
          {showAdvanced && (
            <View style={styles.advancedSection}>
              <Text style={styles.sectionLabel}>Advanced: Custom Tick Marks</Text>
              <Button 
                mode="outlined" 
                icon="plus"
                onPress={() => {
                  const yAxis = {...config.axes.y};
                  yAxis.tickValues = yAxis.tickValues || [0, 50, 100];
                  yAxis.tickText = yAxis.tickText || ["Min", "Mid", "Max"];
                  updateConfigPartial(['axes', 'y'], yAxis);
                }}
                style={styles.addButton}
              >
                Add Custom Ticks
              </Button>
              
              {config.axes.y.tickValues && (
                <View style={styles.ticksContainer}>
                  {config.axes.y.tickValues.map((value, index) => (
                    <View key={`y-tick-${index}`} style={styles.tickRow}>
                      <TextInput
                        label="Value"
                        value={value.toString()}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          if (!isNaN(num)) {
                            const newTickValues = [...config.axes.y.tickValues!];
                            newTickValues[index] = num;
                            updateConfigPartial(['axes', 'y', 'tickValues'], newTickValues);
                          }
                        }}
                        keyboardType="numeric"
                        style={styles.tickValueInput}
                      />
                      <TextInput
                        label="Label"
                        value={config.axes.y.tickText?.[index] || ''}
                        onChangeText={(text) => {
                          const newTickText = [...(config.axes.y.tickText || [])];
                          newTickText[index] = text;
                          updateConfigPartial(['axes', 'y', 'tickText'], newTickText);
                        }}
                        style={styles.tickTextInput}
                      />
                      <IconButton
                        icon="delete"
                        onPress={() => {
                          const newTickValues = [...config.axes.y.tickValues!];
                          const newTickText = [...(config.axes.y.tickText || [])];
                          newTickValues.splice(index, 1);
                          newTickText.splice(index, 1);
                          
                          updateConfigPartial(['axes', 'y', 'tickValues'], newTickValues.length ? newTickValues : undefined);
                          updateConfigPartial(['axes', 'y', 'tickText'], newTickText.length ? newTickText : undefined);
                        }}
                      />
                    </View>
                  ))}
                  
                  <Button 
                    mode="text" 
                    icon="plus"
                    onPress={() => {
                      const newTickValues = [...(config.axes.y.tickValues || []), 0];
                      const newTickText = [...(config.axes.y.tickText || []), ''];
                      updateConfigPartial(['axes', 'y', 'tickValues'], newTickValues);
                      updateConfigPartial(['axes', 'y', 'tickText'], newTickText);
                    }}
                    style={styles.addTickButton}
                  >
                    Add Tick
                  </Button>
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderClassesTab = () => (
    <ScrollView>
      <Card style={styles.sectionCard}>
        <Card.Title title="Positive Class" />
        <Card.Content>
          <View style={styles.classConfig}>
            <TextInput
              label="Label"
              value={config.classes.positive.value}
              onChangeText={(value) => updateConfigPartial(['classes', 'positive', 'value'], value)}
              style={[styles.formInput, styles.classInput]}
            />
            <View style={styles.colorPickerContainer}>
              <Text style={styles.colorLabel}>Color:</Text>
              <ColorPicker
                color={config.classes.positive.color}
                onColorChange={(color: string) => updateConfigPartial(['classes', 'positive', 'color'], color)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title title="Negative Class" />
        <Card.Content>
          <View style={styles.classConfig}>
            <TextInput
              label="Label"
              value={config.classes.negative.value}
              onChangeText={(value) => updateConfigPartial(['classes', 'negative', 'value'], value)}
              style={[styles.formInput, styles.classInput]}
            />
            <View style={styles.colorPickerContainer}>
              <Text style={styles.colorLabel}>Color:</Text>
              <ColorPicker
                color={config.classes.negative.color}
                onColorChange={(color: string) => updateConfigPartial(['classes', 'negative', 'color'], color)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title title="Neutral Class" />
        <Card.Content>
          <View style={styles.classConfig}>
            <TextInput
              label="Label"
              value={config.classes.neutral.value}
              onChangeText={(value) => updateConfigPartial(['classes', 'neutral', 'value'], value)}
              style={[styles.formInput, styles.classInput]}
            />
            <View style={styles.colorPickerContainer}>
              <Text style={styles.colorLabel}>Color:</Text>
              <ColorPicker
                color={config.classes.neutral.color}
                onColorChange={(color: string) => updateConfigPartial(['classes', 'neutral', 'color'], color)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderWeightsTab = () => (
    <ScrollView>
      <Card style={styles.sectionCard}>
        <Card.Title title="Initial Values" />
        <Card.Content>
          <View style={styles.inputRow}>
            <TextInput
              label="Bias"
              value={config.initialValues.bias.toString()}
              onChangeText={(value) => {
                const num = parseFloat(value);
                if (!isNaN(num)) updateConfigPartial(['initialValues', 'bias'], num);
              }}
              keyboardType="numeric"
              style={[styles.formInput, styles.thirdInput]}
            />
            <TextInput
              label="Weight 1"
              value={config.initialValues.weight1.toString()}
              onChangeText={(value) => {
                const num = parseFloat(value);
                if (!isNaN(num)) updateConfigPartial(['initialValues', 'weight1'], num);
              }}
              keyboardType="numeric"
              style={[styles.formInput, styles.thirdInput]}
            />
            <TextInput
              label="Weight 2"
              value={config.initialValues.weight2.toString()}
              onChangeText={(value) => {
                const num = parseFloat(value);
                if (!isNaN(num)) updateConfigPartial(['initialValues', 'weight2'], num);
              }}
              keyboardType="numeric"
              style={[styles.formInput, styles.thirdInput]}
            />
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title title="Lock Parameters" subtitle="Prevent users from changing these values" />
        <Card.Content>
          <View style={styles.switchRow}>
            <Text>Lock Bias</Text>
            <Switch
              value={config.locked.bias}
              onValueChange={(value) => updateConfigPartial(['locked', 'bias'], value)}
            />
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.switchRow}>
            <Text>Lock Weight 1</Text>
            <Switch
              value={config.locked.weight1}
              onValueChange={(value) => updateConfigPartial(['locked', 'weight1'], value)}
            />
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.switchRow}>
            <Text>Lock Weight 2</Text>
            <Switch
              value={config.locked.weight2}
              onValueChange={(value) => updateConfigPartial(['locked', 'weight2'], value)}
            />
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Title title="UI Options" />
        <Card.Content>
          <View style={styles.switchRow}>
            <Text>Use Vertical Slider</Text>
            <Switch
              value={config.useVerticalSlider}
              onValueChange={(value) => updateConfigPartial(['useVerticalSlider'], value)}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {selectedDataset ? (
        // Show neuron editor UI when a dataset is selected
        <>
          <Card style={styles.headerCard}>
            <Card.Title title="Neuron Visualization Editor" />
            <Card.Content>
              <Text variant="bodyMedium">
                Configure the parameters for your interactive neuron visualization.
              </Text>
              
              <View style={styles.datasetInfoSection}>
                <Text variant="titleSmall" style={styles.datasetTitle}>Using dataset: {selectedDataset.name}</Text>
                <Button 
                  mode="text"
                  icon="close-circle"
                  onPress={() => handleDatasetSelect('', {} as DatasetInfo)}
                >
                  Change Dataset
                </Button>
              </View>
              
              <View style={styles.controlsRow}>
                <Button
                  mode="outlined"
                  onPress={() => setConfig(DEFAULT_CONFIG)}
                  icon="refresh"
                  style={styles.resetButton}
                >
                  Reset to Default
                </Button>
                
                <View style={styles.advancedToggle}>
                  <Text>Advanced Options</Text>
                  <Switch
                    value={showAdvanced}
                    onValueChange={setShowAdvanced}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'axes' | 'classes' | 'weights')}
            buttons={[
              { value: 'axes', label: 'Axes', icon: 'axis-arrow' },
              { value: 'classes', label: 'Classes', icon: 'palette' },
              { value: 'weights', label: 'Weights', icon: 'tune' }
            ]}
            style={styles.tabButtons}
          />
          
          {activeTab === 'axes' && renderAxesTab()}
          {activeTab === 'classes' && renderClassesTab()}
          {activeTab === 'weights' && renderWeightsTab()}
        </>
      ) : (
        // Show dataset selection UI when no dataset is selected
        <>
          <Card style={styles.headerCard}>
            <Card.Title title="Select a Dataset for Neuron Visualization" />
            <Card.Content>
              <Text variant="bodyMedium">
                First, you need to select a dataset for your visualization. 
                The neuron will be configured to work with the chosen dataset.
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Available Datasets</Text>
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
                      onPress={() => handleDatasetSelect(dataset.id, dataset)}
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
  sectionCard: {
    marginBottom: 16,
  },
  formInput: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
  },
  emojiInput: {
    flex: 1,
    maxWidth: 100,
  },
  suffixInput: {
    flex: 3,
  },
  tabButtons: {
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  resetButton: {
    marginRight: 8,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  classConfig: {
    marginBottom: 8,
  },
  classInput: {
    marginBottom: 8,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorLabel: {
    marginRight: 16,
  },
  advancedSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  addButton: {
    marginBottom: 16,
  },
  ticksContainer: {
    marginTop: 8,
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tickValueInput: {
    flex: 1,
    marginRight: 8,
  },
  tickTextInput: {
    flex: 2,
    marginRight: 8,
  },
  addTickButton: {
    marginTop: 8,
  },
  searchContainer: {
    gap: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  datasetInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  datasetTitle: {
    flex: 1,
  },
});


// NeuronConfigsExamples:
// {
//   "axes": {
//     "x": {
//       "max": 100,
//       "min": 0,
//       "name": "Workload",
//       "emoji": "🗃️",
//       "suffix": "%",
//       "tickText": [
//         "Free",
//         "Some Work",
//         "Busy"
//       ],
//       "tickValues": [
//         0,
//         50,
//         100
//       ]
//     },
//     "y": {
//       "max": 100,
//       "min": 0,
//       "name": "Sunshine",
//       "emoji": "🌞",
//       "suffix": "%",
//       "tickText": [
//         "It's dark",
//         "Light",
//         "Sunny"
//       ],
//       "tickValues": [
//         0,
//         50,
//         100
//       ]
//     }
//   },
//   "locked": {
//     "bias": false,
//     "weight1": false,
//     "weight2": false
//   },
//   "classes": {
//     "neutral": {
//       "color": "#eeeeee",
//       "value": "Undecided"
//     },
//     "negative": {
//       "color": "#a197f9",
//       "value": "Not Going!"
//     },
//     "positive": {
//       "color": "#ffb850",
//       "value": "Going Out!"
//     }
//   },
//   "initialValues": {
//     "bias": 0,
//     "weight1": -0.5,
//     "weight2": 0.5
//   },
//   "useVerticalSlider": true
// }

// {
// 	"axes": {
// 	  "x": {
// 		"max": 100,
// 		"min": 0,
// 		"name": "Workload",
// 		"emoji": "🗃️",
// 		"suffix": "%"
// 	  },
// 	  "y": {
// 		"max": 100,
// 		"min": 0,
// 		"name": "Sunshine",
// 		"emoji": "🌞",
// 		"suffix": "%"
// 	  }
// 	},
// 	"locked": {
// 	  "bias": true,
// 	  "weight1": true,
// 	  "weight2": false
// 	},
// 	"classes": {
// 	  "neutral": {
// 		"color": "#eeeeee",
// 		"value": "Undecided"
// 	  },
// 	  "negative": {
// 		"color": "#a197f9",
// 		"value": "Not Going!"
// 	  },
// 	  "positive": {
// 		"color": "#ffb850",
// 		"value": "Going Out!"
// 	  }
// 	},
// 	"initialValues": {
// 	  "bias": 0,
// 	  "weight1": -1,
// 	  "weight2": 1
// 	},
// 	"useVerticalSlider": false
//   }