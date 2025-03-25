import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, Switch, SegmentedButtons, Button, IconButton, Divider } from 'react-native-paper';
import { DataPreparationConfig, FeatureConfig } from '@/types/neuralnetwork';

interface DataPreparationEditorProps {
  dataPreparationConfig: DataPreparationConfig;
  onChange: (dataPreparationConfig: DataPreparationConfig) => void;
}

export default function DataPreparationEditor({ dataPreparationConfig, onChange }: DataPreparationEditorProps) {
  // Deep copy to avoid direct state mutation
  const updateConfig = (path: string[], value: any) => {
    const newConfig = JSON.parse(JSON.stringify(dataPreparationConfig));
    let current = newConfig;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    const lastKey = path[path.length - 1];
    current[lastKey] = value;
    
    onChange(newConfig);
  };

  return (
    <ScrollView>
      <Card style={styles.card}>
        <Card.Title title="Data Preparation" />
        <Card.Content>
          <Text style={styles.sectionTitle}>Test/Train Split</Text>
          <TextInput
            label="Test Size"
            value={dataPreparationConfig.testSize.toString()}
            onChangeText={(value) => {
              const num = parseFloat(value);
              if (!isNaN(num) && num >= 0 && num <= 1) 
                updateConfig(['testSize'], num);
            }}
            keyboardType="decimal-pad"
            style={styles.input}
            right={<TextInput.Affix text="(0-1)" />}
          />
          
          <View style={styles.switchRow}>
            <Text>Stratify Split (for classification)</Text>
            <Switch
              value={dataPreparationConfig.stratify}
              onValueChange={(value) => updateConfig(['stratify'], value)}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Target Configuration</Text>
          <TextInput
            label="Target Field"
            value={dataPreparationConfig.targetConfig.field}
            onChangeText={(value) => updateConfig(['targetConfig', 'field'], value)}
            style={styles.input}
          />
          
          <Text style={styles.label}>Encoding Method</Text>
          <SegmentedButtons
            value={dataPreparationConfig.targetConfig.encoding}
            onValueChange={(value) => updateConfig(['targetConfig', 'encoding'], value)}
            buttons={[
              { value: 'none', label: 'None' },
              { value: 'label', label: 'Label' },
              { value: 'onehot', label: 'One-Hot' }
            ]}
            style={styles.segmentedButtons}
          />
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Feature Configuration</Text>
          {dataPreparationConfig.featureConfig.map((feature, index) => (
            <Card key={`feature-${index}`} style={styles.featureCard}>
              <Card.Content>
                <View style={styles.featureHeader}>
                  <Text style={styles.featureTitle}>Feature {index + 1}</Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => {
                      const newFeatures = [...dataPreparationConfig.featureConfig];
                      newFeatures.splice(index, 1);
                      updateConfig(['featureConfig'], newFeatures);
                    }}
                  />
                </View>
                
                <TextInput
                  label="Field Name"
                  value={feature.field}
                  onChangeText={(value) => {
                    const newFeatures = [...dataPreparationConfig.featureConfig];
                    newFeatures[index].field = value;
                    updateConfig(['featureConfig'], newFeatures);
                  }}
                  style={styles.input}
                />
                
                <Text style={styles.label}>Encoding</Text>
                <SegmentedButtons
                  value={feature.encoding}
                  onValueChange={(value) => {
                    const newFeatures = [...dataPreparationConfig.featureConfig];
                    newFeatures[index].encoding = value as 'none' | 'label' | 'onehot';
                    updateConfig(['featureConfig'], newFeatures);
                  }}
                  buttons={[
                    { value: 'none', label: 'None' },
                    { value: 'label', label: 'Label' },
                    { value: 'onehot', label: 'One-Hot' }
                  ]}
                  style={styles.segmentedButtons}
                />
                
                <Text style={styles.label}>Normalization</Text>
                <SegmentedButtons
                  value={feature.normalization}
                  onValueChange={(value) => {
                    const newFeatures = [...dataPreparationConfig.featureConfig];
                    newFeatures[index].normalization = value as 'none' | 'minmax' | 'standard';
                    updateConfig(['featureConfig'], newFeatures);
                  }}
                  buttons={[
                    { value: 'none', label: 'None' },
                    { value: 'minmax', label: 'Min-Max' },
                    { value: 'standard', label: 'Standard' }
                  ]}
                  style={styles.segmentedButtons}
                />
              </Card.Content>
            </Card>
          ))}
          
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => {
              const newFeature: FeatureConfig = {
                field: '',
                encoding: 'none',
                normalization: 'none'
              };
              const newFeatures = [...dataPreparationConfig.featureConfig, newFeature];
              updateConfig(['featureConfig'], newFeatures);
            }}
            style={styles.addButton}
          >
            Add Feature
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  featureCard: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontWeight: 'bold',
  },
  addButton: {
    marginVertical: 8,
  },
}); 