import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { Text, Surface, IconButton, Button } from "react-native-paper";

type LayerType = "input" | "hidden" | "output" | null;

export default function NeuralNetworkVisualizer() {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>(null);

  const renderInputLayer = () => (
    <Surface
      style={[
        styles.layerContainer,
        styles.inputLayer,
        selectedLayer === "input"
          ? [styles.selectedLayer, styles.inputLayerSelected]
          : styles.unselectedLayer,
      ]}
    >
      <Text style={styles.layerTitle}>Input layer</Text>
      <View style={styles.inputNodesContainer}>
        {[1, 2].map((_, index) => (
          <View key={index} style={styles.inputNode}>
            <IconButton icon="numeric" size={24} iconColor="#fff" />
          </View>
        ))}
      </View>
      <Text style={styles.inputLabel}>[Input name]</Text>
    </Surface>
  );

  const renderHiddenLayer = () => (
    <Surface
      style={[
        styles.layerContainer,
        styles.hiddenLayer,
        selectedLayer === "hidden"
          ? [styles.selectedLayer, styles.hiddenLayerSelected]
          : styles.unselectedLayer,
      ]}
    >
      <Text style={styles.layerTitle}>Hidden layers</Text>
      <View style={styles.hiddenLayerCircle}>
        <Image
          source={require("@/assets/images/pngs/nn.png")}
          style={{ width: 100, height: 100 }}
        />
      </View>
      <Text style={styles.layerInfo}>[3] hidden layers</Text>
      <Text style={styles.layerInfo}>[5] neurons per layer</Text>
    </Surface>
  );

  const renderOutputLayer = () => (
    <Surface
      style={[
        styles.layerContainer,
        styles.outputLayer,
        selectedLayer === "output"
          ? [styles.selectedLayer, styles.outputLayerSelected]
          : styles.unselectedLayer,
      ]}
    >
      <Text style={styles.layerTitle}>Output layer</Text>
      <View style={styles.outputBox}>
        <Image
          source={require("@/assets/images/pngs/nn-output.png")}
          style={{ width: 60, height: 60 }}
        />
      </View>
      <Text style={styles.outputLabel}>[Output name]</Text>
    </Surface>
  );

  const renderLayerDetails = () => {
    if (!selectedLayer) return null;

    return (
      <Surface style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>
          {selectedLayer.charAt(0).toUpperCase() + selectedLayer.slice(1)} Layer
          Details
        </Text>
        {selectedLayer === "input" && (
          <Text>Input layer processes the raw features of your data</Text>
        )}
        {selectedLayer === "hidden" && (
          <Text>Hidden layers learn complex patterns and representations</Text>
        )}
        {selectedLayer === "output" && (
          <Text>Output layer produces the final predictions</Text>
        )}
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Neural Network Architecture</Text>
        <Surface style={styles.badge}>
          <Text style={styles.badgeText}>Regression</Text>
        </Surface>
      </View>

      <View style={styles.networkContainer}>
        <Pressable onPress={() => setSelectedLayer("input")}>
          {renderInputLayer()}
        </Pressable>

        <Pressable
          style={styles.hiddenLayerWrapper}
          onPress={() => setSelectedLayer("hidden")}
        >
          {renderHiddenLayer()}
        </Pressable>

        <Pressable onPress={() => setSelectedLayer("output")}>
          {renderOutputLayer()}
        </Pressable>
      </View>

      <Button
        mode="contained"
        style={styles.trainingButton}
        buttonColor="#ffa726"
      >
        Start training
      </Button>
      {renderLayerDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    maxWidth: 700,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#1976d2",
    fontSize: 12,
  },
  networkContainer: {
    flexDirection: "row",
    minHeight: 200,
  },
  layerContainer: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    height: "100%",
  },
  hiddenLayerWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  selectedLayer: {
    borderStyle: "solid",
    borderWidth: 2,
    elevation: 2,
  },
  unselectedLayer: {
    backgroundColor: "transparent",
  },
  layerTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  inputLayer: {
    width: "auto",
  },
  inputLayerSelected: {
    borderColor: "#2196f3",
  },
  hiddenLayer: {
    flexDirection: "column",
  },
  hiddenLayerSelected: {
    borderColor: "#4caf50",
  },
  outputLayer: {
    width: "auto",
  },
  outputLayerSelected: {
    borderColor: "#ffa726",
  },
  inputNodesContainer: {
    gap: 16,
  },
  inputNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196f3",
    justifyContent: "center",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  hiddenLayerCircle: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  neuronsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  neuron: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7c4dff",
  },
  layerInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  outputBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "rgba(255, 204, 128, 0.2)",
	borderColor: "#ffcc80",
	borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  outputLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  detailsContainer: {
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  trainingButton: {
    marginTop: 16,
    alignSelf: "flex-end",
    borderRadius: 4,
  },
});
