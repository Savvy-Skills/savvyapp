import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Surface, Button, IconButton } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import styles from "@/styles/styles";
import { TrainSettingsProps } from "./types";

const Chip = ({ children, style, textStyle }: {
  children: React.ReactNode;
  style: any;
  textStyle: any;
}) => (
  <View style={[{ padding: 8, borderRadius: 16 }, style]}>
    <Text style={textStyle}>{children}</Text>
  </View>
);

export function TrainSettings({ 
  classes, 
  epochs, 
  setEpochs, 
  currentState, 
  modelId, 
  onStartTraining,
  isMobilenetLoaded,
  isLoadingMobilenet
}: TrainSettingsProps) {
  return (
    <Surface style={styles.detailsContainer}>
      <Text style={[styles.title]}>Train Your Model</Text>
      
      {isLoadingMobilenet && (
        <View style={localStyles.loadingMessage}>
          <Text>Loading MobileNet model...</Text>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      
      {!isLoadingMobilenet && (
        <>
          <View style={localStyles.trainingConfig}>
            <Text style={styles.subtitle}>Learning Cycles (Epochs):</Text>
            <View style={localStyles.epochsControl}>
              <IconButton
                icon="minus"
                mode="contained-tonal"
                size={24}
                style={localStyles.circleButton}
                onPress={() => setEpochs(Math.max(10, epochs - 10))}
                disabled={epochs <= 10}
              />
              <Text style={localStyles.epochsValue}>{epochs}</Text>
              <IconButton
                icon="plus"
                mode="contained-tonal"
                size={24}
                style={localStyles.circleButton}
                onPress={() => setEpochs(epochs + 10)}
              />
            </View>
          </View>
          
          <View style={localStyles.classPreview}>
            <Text style={styles.subtitle}>Classes:</Text>
            <View style={localStyles.classChips}>
              {classes.map((cls, index) => (
                <Chip
                  key={cls.id}
                  style={{ 
                    backgroundColor: index === 0 ? '#6c5ce7' : '#fd9644',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8
                  }}
                  textStyle={{ color: 'white', fontWeight: '500' }}
                >
                  {cls.name} ({cls.samples.length})
                </Chip>
              ))}
            </View>
          </View>
          
          <Button
            mode="contained"
            style={[localStyles.trainingButton, styles.savvyButton]}
            buttonColor={Colors.orange}
            textColor="white"
            loading={currentState[modelId]?.model?.training}
            disabled={!isMobilenetLoaded || classes.some(c => c.samples.length === 0)}
            onPress={onStartTraining}
          >
            {!isMobilenetLoaded 
              ? "MobileNet Not Loaded"
              : currentState[modelId]?.model?.training 
                ? `Training... (${currentState[modelId]?.training?.transcurredEpochs || 0}/${epochs} epochs)` 
                : currentState[modelId]?.model?.completed 
                  ? "Train Again" 
                  : "Start Training"}
          </Button>
          
        </>
      )}
    </Surface>
  );
}

const localStyles = StyleSheet.create({
  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  trainingConfig: {
  },
  epochsControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  circleButton: {
    margin: 0,
    backgroundColor: '#f0f0f0',
  },
  epochsValue: {
    fontSize: 24,
    fontWeight: "bold",
    width: 60,
    textAlign: "center",
  },
  classPreview: {
    marginBottom: 24,
  },
  classChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  trainingButton: {
    alignSelf: "flex-end",
  },
  trainingResults: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: 8,
    backgroundColor: `${Colors.success}10`,
  },
  loadingMessage: {
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
}); 