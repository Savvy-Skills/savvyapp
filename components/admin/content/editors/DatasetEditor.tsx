import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, Button, Card, Chip, IconButton, Menu, Divider, SegmentedButtons, Switch, HelperText } from 'react-native-paper';
import { ContentInfo, DatasetInfo } from '@/types/index';
import { getDatasets } from '@/services/adminApi';
import { TraceConfig as PlotlyTraceConfig } from '@/components/data/DataVisualizerPlotly';
import Dropdown from '@/components/common/Dropdown';
import DatasetList from '@/components/common/DatasetList';

interface TraceConfig extends Omit<PlotlyTraceConfig, 'type'> {
  id: string;
  x: string;
  y: string;
  z?: string;
  name: string;
  type: 'bar' | 'scatter' | 'choropleth';
  stack?: boolean;
  groupBy?: string;
  locationmode?: 'ISO-3' | 'USA-states' | 'country names' | 'geojson-id';
  fill?: string;
  mode?: 'number' | 'text' | 'delta' | 'gauge' | 'none' | 'lines' | 'markers' | 'lines+markers' | 'text+markers' | 'text+lines' | 'text+lines+markers' | 'number+delta' | 'gauge+number' | 'gauge+number+delta' | 'gauge+delta';
}

interface DatasetEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
  showTraces?: boolean;
}

export default function DatasetEditor({ content, onContentChange, showTraces = false }: DatasetEditorProps) {
  // Define the conversion function at the top before using it
  const convertTraces = (traces: PlotlyTraceConfig[] | undefined): TraceConfig[] => {
    if (!traces) return [];
    return traces.map(trace => ({
      ...trace,
      id: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: trace.type as 'bar' | 'scatter' | 'choropleth'
    }));
  };

  // Add this conversion function for outputting traces
  const convertTracesToPlotly = (traces: TraceConfig[]): PlotlyTraceConfig[] => {
    return traces.map(({id, ...trace}) => ({
      ...trace,
      // Ensure type is compatible with PlotlyTraceConfig
      type: trace.type === 'choropleth' ? 'bar' : trace.type // Convert choropleth to bar as fallback
    }));
  };

  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState(content?.dataset_id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [traces, setTraces] = useState<TraceConfig[]>(convertTraces(content?.state?.traces || []));
  const [showTraceBuilder, setShowTraceBuilder] = useState(showTraces || false);
  const [editingTraceIndex, setEditingTraceIndex] = useState<number | null>(null);
  const [currentTrace, setCurrentTrace] = useState<TraceConfig>({
    id: '',
    x: '',
    y: '',
    name: '',
    type: 'bar'
  });

  useEffect(() => {
    loadDatasets();
  }, [datasets]);

  useEffect(() => {
    if (content?.dataset_id) {
      setSelectedDatasetId(content.dataset_id);
    }
    if (content?.state?.traces) {
      setTraces(convertTraces(content.state.traces));
    }
  }, [content]);

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
    // Reset traces when changing datasets
    setTraces([]);
    onContentChange({
      type: 'Dataset',
      dataset_id: datasetId,
      dataset_info: datasetInfo,
      state: {
        traces: []
      }
    });
  };

  // Get available columns from the selected dataset
  const getColumns = () => {
    const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
    if (!selectedDataset || !selectedDataset.metadata.columns_names) return [];
    
    // Convert columns to dropdown format
    return selectedDataset.metadata.columns_names.map(col => ({
      label: col,
      value: col
        }));
  };

  const handleAddTrace = () => {
    setCurrentTrace({
      id: Date.now().toString(),
      x: '',
      y: '',
      name: '',
      type: 'bar'
    });
    setEditingTraceIndex(null);
    setShowTraceBuilder(true);
  };

  const handleEditTrace = (index: number) => {
    setCurrentTrace(traces[index]);
    setEditingTraceIndex(index);
    setShowTraceBuilder(true);
  };

  const handleDeleteTrace = (index: number) => {
    const updatedTraces = [...traces];
    updatedTraces.splice(index, 1);
    setTraces(updatedTraces);
    updateContent(updatedTraces);
  };

  const saveTrace = () => {
    let updatedTraces: TraceConfig[];
    
    if (editingTraceIndex !== null) {
      updatedTraces = [...traces];
      updatedTraces[editingTraceIndex] = currentTrace;
    } else {
      updatedTraces = [...traces, currentTrace];
    }
    
    setTraces(updatedTraces);
    setShowTraceBuilder(false);
    updateContent(updatedTraces);
  };

  const updateContent = (updatedTraces: TraceConfig[]) => {
    onContentChange({
      state: {
        traces: convertTracesToPlotly(updatedTraces)
      }
    });
  };

  const filteredDatasets = datasets.filter(dataset => 
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dataset.metadata.description && 
     dataset.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);
  const columns = getColumns();

  // Function to render the trace builder UI
  const renderTraceBuilder = () => {
    return (
      <Card style={styles.traceBuilderCard}>
        <Card.Title 
          title={editingTraceIndex !== null ? "Edit Visualization Trace" : "Add Visualization Trace"} 
          right={(props) => (
            <IconButton {...props} icon="close" onPress={() => setShowTraceBuilder(false)} />
          )}
        />
        <Card.Content>
          <TextInput
            label="Trace Name"
            value={currentTrace.name}
            onChangeText={(text) => setCurrentTrace({...currentTrace, name: text})}
            style={styles.formInput}
          />
          
          <Text style={styles.label}>Chart Type</Text>
          <SegmentedButtons
            value={currentTrace.type}
            onValueChange={(value) => 
              setCurrentTrace({
                ...currentTrace, 
                type: value as TraceConfig['type'],
                // Reset properties that don't apply to the new type
                ...(value !== 'choropleth' ? { locationmode: undefined, z: undefined } : {}),
                ...(value !== 'scatter' ? { mode: undefined, fill: undefined } : {})
              })
            }
            buttons={[
              { value: 'bar', label: 'Bar' },
              { value: 'scatter', label: 'Scatter/Line' },
              { value: 'choropleth', label: 'Map' }
            ]}
            style={styles.segmentedButtons}
          />
          
          <View style={styles.columnSelectors}>
            <View style={styles.columnSelector}>
              <Dropdown 
                label="X Axis"
                value={currentTrace.x}
                options={columns}
                onChange={(value) => setCurrentTrace({...currentTrace, x: value})}
              />
            </View>
            
            {currentTrace.type !== 'choropleth' && (
              <View style={styles.columnSelector}>
                <Dropdown 
                  label="Y Axis"
                  value={currentTrace.y}
                  options={columns}
                  onChange={(value) => setCurrentTrace({...currentTrace, y: value})}
                />
              </View>
            )}
            
            {currentTrace.type === 'choropleth' && (
              <View style={styles.columnSelector}>
                <Dropdown 
                  label="Value (z)"
                  value={currentTrace.z || ''}
                  options={columns}
                  onChange={(value) => setCurrentTrace({...currentTrace, z: value})}
                />
              </View>
            )}
          </View>
          
          {/* Additional options based on chart type */}
          {currentTrace.type === 'bar' && (
            <View style={styles.optionRow}>
              <Text style={styles.label}>Stack Bars</Text>
              <Switch
                value={!!currentTrace.stack}
                onValueChange={(value) => setCurrentTrace({...currentTrace, stack: value})}
              />
            </View>
          )}
          
          {currentTrace.type === 'scatter' && (
            <>
              <Text style={styles.label}>Display Mode</Text>
              <SegmentedButtons
                value={currentTrace.mode || 'markers'}
                onValueChange={(value) => {
                  // Clear fill if switching to markers only
                  const updatedTrace = {
                    ...currentTrace, 
                    mode: value as TraceConfig['mode']
                  };
                  
                  // Reset fill if switching to markers-only mode
                  if (value === 'markers' && currentTrace.fill) {
                    updatedTrace.fill = undefined;
                  }
                  
                  setCurrentTrace(updatedTrace);
                }}
                buttons={[
                  { value: 'markers', label: 'Points' },
                  { value: 'lines', label: 'Lines' },
                  { value: 'lines+markers', label: 'Both' }
                ]}
                style={styles.segmentedButtons}
              />
              
              {(currentTrace.mode === 'lines' || currentTrace.mode === 'lines+markers') && (
                <View style={styles.optionRow}>
                  <Text style={styles.label}>Fill to Zero</Text>
                  <Switch
                    value={currentTrace.fill === 'tozeroy'}
                    onValueChange={(value) => 
                      setCurrentTrace({...currentTrace, fill: value ? 'tozeroy' : undefined})
                    }
                  />
                </View>
              )}
            </>
          )}
          
          {(currentTrace.type === 'bar' || currentTrace.type === 'scatter' || currentTrace.type === 'choropleth') && (
            <View style={styles.formInput}>
              <Text style={styles.label}>Group By</Text>
              <View style={styles.groupByContainer}>
                <Dropdown 
                  value={currentTrace.groupBy || ''}
                  options={columns}
                  onChange={(value: string) => setCurrentTrace({...currentTrace, groupBy: value})}
                  placeholder="Select column (optional)"
                  width="95%"
                />
                {currentTrace.groupBy && (
                  <IconButton 
                    icon="close" 
                    size={20} 
                    onPress={() => setCurrentTrace({...currentTrace, groupBy: undefined})}
                    style={styles.clearGroupByButton}
                  />
                )}
              </View>
              <HelperText type="info">Group data points by a categorical column</HelperText>
            </View>
          )}
          
          {currentTrace.type === 'choropleth' && (
            <View style={styles.formInput}>
              <Text style={styles.label}>Location Mode</Text>
              <SegmentedButtons
                value={currentTrace.locationmode || 'country names'}
                onValueChange={(value) => setCurrentTrace({
                  ...currentTrace, 
                  locationmode: value as TraceConfig['locationmode']
                })}
                buttons={[
                  { value: 'country names', label: 'Country Names' },
                  { value: 'ISO-3', label: 'ISO Codes' }
                ]}
                style={styles.segmentedButtons}
              />
            </View>
          )}
          
          <Button 
            mode="contained" 
            onPress={saveTrace}
            style={styles.saveButton}
            disabled={!currentTrace.x || (!currentTrace.y && currentTrace.type !== 'choropleth') || (!currentTrace.z && currentTrace.type === 'choropleth')}
          >
            Save Trace
          </Button>
        </Card.Content>
      </Card>
    );
  };

  // Function to render the list of configured traces
  const renderTraceList = () => {
    if (traces.length === 0) {
      return (
        <Text style={styles.noTraces}>No visualization traces configured yet.</Text>
      );
    }

    return (
      <ScrollView style={styles.traceList}>
        {traces.map((trace, index) => (
          <Card key={trace.id} style={styles.traceCard}>
            <Card.Title
              title={trace.name || `Trace ${index + 1}`}
              subtitle={getTraceDescription(trace)}
              right={(props) => (
                <View style={styles.traceActions}>
                  <IconButton {...props} icon="pencil" onPress={() => handleEditTrace(index)} />
                  <IconButton {...props} icon="delete" onPress={() => handleDeleteTrace(index)} />
                </View>
              )}
            />
          </Card>
        ))}
      </ScrollView>
    );
  };

  // Helper function to create a human-readable description of a trace
  const getTraceDescription = (trace: TraceConfig) => {
    let description = `${trace.type.charAt(0).toUpperCase() + trace.type.slice(1)} chart`;
    
    if (trace.type === 'bar') {
      description += trace.stack ? ' (stacked)' : '';
      description += ` of ${trace.y} vs ${trace.x}`;
    } else if (trace.type === 'scatter') {
      const modeText = trace.mode === 'lines' ? 'Line' : 
                       trace.mode === 'markers' ? 'Scatter' : 
                       trace.mode === 'lines+markers' ? 'Line+Scatter' : 'Scatter';
      description = `${modeText} chart of ${trace.y} vs ${trace.x}`;
      description += trace.fill ? ' (filled)' : '';
    } else if (trace.type === 'choropleth') {
      description = `Map showing ${trace.z} by ${trace.x}`;
    }
    
    if (trace.groupBy) {
      description += `, grouped by ${trace.groupBy}`;
    }
    
    return description;
  };

//   // Add this function to handle the newly uploaded dataset
//   const handleDatasetUploaded = (dataset: DatasetInfo) => {
//     // Add the new dataset to the list
//     setDatasets(prev => [dataset, ...prev]);
    
//     // Optionally select the newly uploaded dataset
//     handleDatasetSelect(dataset.id, dataset);
    
//     // Hide the uploader
//     setShowUploader(false);
//   };

  return (
    <View style={styles.container}>
      {selectedDataset && (
        <Card style={[
          styles.selectedDatasetCard,
          selectedDataset.word_vec && styles.word2vecCard
        ]}>
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
              {selectedDataset.word_vec && (
                <Chip icon="vector-point" style={[styles.chip, styles.word2vecChip]}>Word2Vec</Chip>
              )}
              <Chip icon="table-row" style={styles.chip}>Rows: {selectedDataset.metadata.rows}</Chip>
              <Chip icon="table-column" style={styles.chip}>Columns: {selectedDataset.metadata.columns}</Chip>
              {selectedDataset.metadata.source && (
                <Chip icon="link" style={styles.chip}>Source: {selectedDataset.metadata.source}</Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      )}
      
      {selectedDataset && !selectedDataset.word_vec && showTraces && (
        <>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Visualization Traces</Text>
            <Button 
              mode="outlined" 
              icon="plus" 
              onPress={handleAddTrace}
              disabled={!selectedDatasetId}
            >
              Add Trace
            </Button>
          </View>

          {showTraceBuilder ? renderTraceBuilder() : renderTraceList()}
        </>
      )}
      
      {!selectedDataset && (
        <DatasetList
          selectedDatasetId={selectedDatasetId}
          onDatasetSelect={handleDatasetSelect}
          showWordVecDatasets={true}
        />
      )}
    </View>
  )
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  traceBuilderCard: {
    marginBottom: 16,
  },
  formInput: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  traceList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  traceCard: {
    marginBottom: 8,
  },
  traceActions: {
    flexDirection: 'row',
  },
  noTraces: {
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.6,
  },
  columnSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  columnSelector: {
    flex: 1,
    marginRight: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 16,
  },
  groupByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearGroupByButton: {
    marginLeft: -8,
  },
});

// TRACES EXAMPLES:
// [
// 	{
// 	  "x": "Year",
// 	  "y": "Non-electric car sales",
// 	  "name": "Non-electric Cars Sold",
// 	  "type": "bar",
// 	  "stack": true
// 	},
// 	{
// 	  "x": "Year",
// 	  "y": "Electric cars sold",
// 	  "name": "Electric Cars Sold",
// 	  "type": "bar"
// 	},
// 	{
// 	  "x": "Entity",
// 	  "z": "Electric cars sold",
// 	  "name": "Electric Cars Sold",
// 	  "type": "choropleth",
// 	  "groupBy": "Entity",
// 	  "locationmode": "country names"
// 	},
//   {
// 	  "x": "sepal_length",
// 	  "y": "sepal_width",
// 	  "name": "Sepal Length vs Width",
// 	  "type": "scatter"
// 	},
//   {
// 	  "x": "Year",
// 	  "y": "Share",
// 	  "fill": "tozeroy",
// 	  "mode": "lines+markers",
// 	  "name": "Electric Cars Shares",
// 	  "type": "scatter",
// 	  "groupBy": "Entity"
// 	}
  
//   ]
  
  