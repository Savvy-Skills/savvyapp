import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, Switch } from 'react-native-paper';
import { TrainConfig } from '@/types/neuralnetwork';

interface TrainingConfigEditorProps {
  trainingConfig: TrainConfig;
  onChange: (trainingConfig: TrainConfig) => void;
}

export default function TrainingConfigEditor({ trainingConfig, onChange }: TrainingConfigEditorProps) {
  // Deep copy to avoid direct state mutation
  const updateConfig = (path: string[], value: any) => {
    const newConfig = JSON.parse(JSON.stringify(trainingConfig));
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
      <Card.Title title="Training Parameters" />
      <Card.Content>
        <TextInput
          label="Epochs"
          value={trainingConfig.epochs.toString()}
          onChangeText={(value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num)) updateConfig(['epochs'], num);
          }}
          keyboardType="numeric"
          style={styles.input}
        />
        
        <TextInput
          label="Batch Size"
          value={trainingConfig.batchSize.toString()}
          onChangeText={(value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num)) updateConfig(['batchSize'], num);
          }}
          keyboardType="numeric"
          style={styles.input}
        />
        
        <TextInput
          label="Validation Split"
          value={trainingConfig.validationSplit.toString()}
          onChangeText={(value) => {
            const num = parseFloat(value);
            if (!isNaN(num) && num >= 0 && num <= 1) 
              updateConfig(['validationSplit'], num);
          }}
          keyboardType="decimal-pad"
          style={styles.input}
          right={<TextInput.Affix text="(0-1)" />}
        />
        
        <View style={styles.switchRow}>
          <Text>Shuffle Data</Text>
          <Switch
            value={trainingConfig.shuffle}
            onValueChange={(value) => updateConfig(['shuffle'], value)}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
}); 