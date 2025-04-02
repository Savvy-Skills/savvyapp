import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { LayerType } from "@/types/neuralnetwork";

const Pressable = ({ children, style, onPress, disabled = false }: {
  children: React.ReactNode;
  style: any;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <View 
    style={[style, disabled && styles.disabledTab]} 
    onTouchEnd={disabled ? undefined : onPress}
  >
    {children}
  </View>
);

export interface LayerTabsProps {
  selectedLayer: LayerType;
  onSelectLayer: (layer: LayerType) => void;
  canStartTraining: boolean;
}

export function LayerTabs({ selectedLayer, onSelectLayer, canStartTraining }: LayerTabsProps) {
  return (
    <View style={styles.tabs}>
      <Pressable
        style={[
          styles.tab,
          selectedLayer === "input" && styles.selectedTab
        ]}
        onPress={() => onSelectLayer("input")}
      >
        <Text style={[
          styles.tabText,
          selectedLayer === "input" && styles.selectedTabText
        ]}>Collect</Text>
      </Pressable>
      <Pressable
        style={[
          styles.tab,
          selectedLayer === "hidden" && styles.selectedTab
        ]}
        onPress={() => onSelectLayer("hidden")}
        disabled={!canStartTraining}
      >
        <Text style={[
          styles.tabText,
          selectedLayer === "hidden" && styles.selectedTabText,
          !canStartTraining && styles.disabledTabText
        ]}>Train</Text>
      </Pressable>
      <Pressable
        style={[
          styles.tab,
          selectedLayer === "output" && styles.selectedTab
        ]}
        onPress={() => onSelectLayer("output")}
        disabled={!canStartTraining}
      >
        <Text style={[
          styles.tabText,
          selectedLayer === "output" && styles.selectedTabText,
          !canStartTraining && styles.disabledTabText
        ]}>Predict</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  selectedTab: {
    backgroundColor: Colors.primary,
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabText: {
    fontWeight: "bold",
    color: "#333",
  },
  selectedTabText: {
    color: "white",
  },
  disabledTabText: {
    color: "#999",
  },
}); 