import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, Switch, SegmentedButtons, Button, IconButton, Divider } from 'react-native-paper';
import { Trace } from '@/types/neuralnetwork';

interface VisualizationConfigEditorProps {
  initialTraces: Trace[];
  predictionTraces: Trace[];
  onChange: (traces: { initialTraces: Trace[], predictionTraces: Trace[] }) => void;
}

export default function VisualizationConfigEditor({ 
  initialTraces, 
  predictionTraces, 
  onChange 
}: VisualizationConfigEditorProps) {
  
  const updateTraces = (type: 'initial' | 'prediction', newTraces: Trace[]) => {
    if (type === 'initial') {
      onChange({ initialTraces: newTraces, predictionTraces });
    } else {
      onChange({ initialTraces, predictionTraces: newTraces });
    }
  };

  const renderTraceEditor = (traces: Trace[], type: 'initial' | 'prediction') => {
    const title = type === 'initial' ? 'Initial Data Visualization' : 'Prediction Visualization';
    
    return (
      <Card style={styles.card}>
        <Card.Title title={title} />
        <Card.Content>
          {traces.map((trace, index) => (
            <Card key={`${type}-trace-${index}`} style={styles.traceCard}>
              <Card.Content>
                <View style={styles.traceHeader}>
                  <Text style={styles.traceTitle}>Trace {index + 1}</Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => {
                      const newTraces = [...traces];
                      newTraces.splice(index, 1);
                      updateTraces(type, newTraces);
                    }}
                  />
                </View>
                
                <View style={styles.row}>
                  <TextInput
                    label="X Field"
                    value={trace.x}
                    onChangeText={(value) => {
                      const newTraces = [...traces];
                      newTraces[index] = {...trace, x: value};
                      updateTraces(type, newTraces);
                    }}
                    style={styles.halfInput}
                  />
                  
                  <TextInput
                    label="Y Field"
                    value={trace.y}
                    onChangeText={(value) => {
                      const newTraces = [...traces];
                      newTraces[index] = {...trace, y: value};
                      updateTraces(type, newTraces);
                    }}
                    style={styles.halfInput}
                  />
                </View>
                
                <TextInput
                  label="Name"
                  value={trace.name}
                  onChangeText={(value) => {
                    const newTraces = [...traces];
                    newTraces[index] = {...trace, name: value};
                    updateTraces(type, newTraces);
                  }}
                  style={styles.input}
                />
                
                <Text style={styles.label}>Plot Type</Text>
                <SegmentedButtons
                  value={trace.type}
                  onValueChange={(value) => {
                    const newTraces = [...traces];
                    newTraces[index] = {...trace, type: value as 'scatter' | 'line' | 'bar'};
                    updateTraces(type, newTraces);
                  }}
                  buttons={[
                    { value: 'scatter', label: 'Scatter' },
                    { value: 'line', label: 'Line' },
                    { value: 'bar', label: 'Bar' }
                  ]}
                  style={styles.segmentedButtons}
                />
                
                {trace.groupBy && (
                  <TextInput
                    label="Group By Field"
                    value={trace.groupBy}
                    onChangeText={(value) => {
                      const newTraces = [...traces];
                      newTraces[index] = {...trace, groupBy: value};
                      updateTraces(type, newTraces);
                    }}
                    style={styles.input}
                  />
                )}
              </Card.Content>
            </Card>
          ))}
          
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => {
              const newTrace: Trace = {
                x: '',
                y: '',
                name: 'New Trace',
                type: 'scatter',
                groupBy: type === 'initial' ? 'label' : 'prediction'
              };
              updateTraces(type, [...traces, newTrace]);
            }}
            style={styles.addButton}
          >
            Add Trace
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView>
      {renderTraceEditor(initialTraces, 'initial')}
      {renderTraceEditor(predictionTraces, 'prediction')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  traceCard: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  traceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  traceTitle: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  addButton: {
    marginVertical: 8,
  },
}); 