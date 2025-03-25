import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, SegmentedButtons, Button, IconButton } from 'react-native-paper';
import { ModelConfig } from '@/types/neuralnetwork';

interface ModelConfigEditorProps {
  modelConfig: ModelConfig;
  onChange: (modelConfig: ModelConfig) => void;
}

export default function ModelConfigEditor({ modelConfig, onChange }: ModelConfigEditorProps) {
  // Deep copy to avoid direct state mutation
  const updateConfig = (path: string[], value: any) => {
    const newConfig = JSON.parse(JSON.stringify(modelConfig));
    let current = newConfig;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    const lastKey = path[path.length - 1];
    current[lastKey] = value;
    
    onChange(newConfig);
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="Model Architecture" />
      <Card.Content>
        {/* Problem Type */}
        <Text style={styles.sectionTitle}>Problem Type</Text>
        <SegmentedButtons
          value={modelConfig.problemType}
          onValueChange={(value) => updateConfig(['problemType'], value)}
          buttons={[
            { value: 'classification', label: 'Classification' },
            { value: 'regression', label: 'Regression' }
          ]}
          style={styles.segmentedButtons}
        />
        
        {/* Input & Output Size */}
        <View style={styles.row}>
          <TextInput
            label="Input Features"
            value={modelConfig.inputSize.toString()}
            onChangeText={(value) => {
              const num = parseInt(value, 10);
              if (!isNaN(num)) updateConfig(['inputSize'], num);
            }}
            keyboardType="numeric"
            style={styles.halfInput}
          />
          
          <TextInput
            label="Output Size"
            value={modelConfig.lastLayerSize.toString()}
            onChangeText={(value) => {
              const num = parseInt(value, 10);
              if (!isNaN(num)) updateConfig(['lastLayerSize'], num);
            }}
            keyboardType="numeric"
            style={styles.halfInput}
          />
        </View>
        
        {/* Hidden Layers */}
        <Text style={styles.sectionTitle}>Hidden Layers</Text>
        {modelConfig.neuronsPerLayer.map((neurons, index) => (
          <View key={`layer-${index}`} style={styles.layerRow}>
            <Text style={styles.layerText}>Layer {index + 1}</Text>
            <TextInput
              label="Neurons"
              value={neurons.toString()}
              onChangeText={(value) => {
                const num = parseInt(value, 10);
                if (!isNaN(num)) {
                  const newLayers = [...modelConfig.neuronsPerLayer];
                  newLayers[index] = num;
                  updateConfig(['neuronsPerLayer'], newLayers);
                }
              }}
              keyboardType="numeric"
              style={styles.neuronsInput}
            />
            <IconButton
              icon="delete"
              onPress={() => {
                const newLayers = [...modelConfig.neuronsPerLayer];
                newLayers.splice(index, 1);
                updateConfig(['neuronsPerLayer'], newLayers);
              }}
            />
          </View>
        ))}
        
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => {
            const newLayers = [...modelConfig.neuronsPerLayer];
            newLayers.push(4); // Default to 4 neurons
            updateConfig(['neuronsPerLayer'], newLayers);
          }}
          style={styles.addButton}
        >
          Add Layer
        </Button>
        
        {/* Activation Function */}
        <Text style={styles.sectionTitle}>Activation Function</Text>
        <SegmentedButtons
          value={modelConfig.activationFunction}
          onValueChange={(value) => updateConfig(['activationFunction'], value)}
          buttons={[
            { value: 'relu', label: 'ReLU' },
            { value: 'sigmoid', label: 'Sigmoid' },
            { value: 'tanh', label: 'Tanh' }
          ]}
          style={styles.segmentedButtons}
        />
        
        {/* Compile Options */}
        <Text style={styles.sectionTitle}>Compile Options</Text>
        <View style={styles.row}>
          <SegmentedButtons
            value={modelConfig.compileOptions.optimizer}
            onValueChange={(value) => updateConfig(['compileOptions', 'optimizer'], value)}
            buttons={[
              { value: 'adam', label: 'Adam' },
              { value: 'sgd', label: 'SGD' }
            ]}
            style={styles.segmentedButtons}
          />
        </View>
        
        <TextInput
          label="Learning Rate"
          value={modelConfig.compileOptions.learningRate.toString()}
          onChangeText={(value) => {
            const num = parseFloat(value);
            if (!isNaN(num)) updateConfig(['compileOptions', 'learningRate'], num);
          }}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        
        <SegmentedButtons
          value={modelConfig.compileOptions.lossFunction}
          onValueChange={(value) => updateConfig(['compileOptions', 'lossFunction'], value)}
          buttons={[
            ...(modelConfig.problemType === 'classification' ? [
              { value: 'binaryCrossentropy', label: 'Binary Cross Entropy' },
              { value: 'categoricalCrossentropy', label: 'Categorical Cross Entropy' }
            ] : [
              { value: 'meanSquaredError', label: 'MSE' },
              { value: 'meanAbsoluteError', label: 'MAE' }
            ])
          ]}
          style={styles.segmentedButtons}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  layerText: {
    width: 80,
  },
  neuronsInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    marginVertical: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
}); 