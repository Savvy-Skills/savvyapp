import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, IconButton, Button } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { SamplePreviewProps } from "./types";
import { Image as ExpoImage } from "expo-image";

// Custom Image component with flipping capability
const FlippedImage = ({ source, style }: {
  source: { uri: string };
  style: any;
}) => (
  <ExpoImage 
    source={source.uri} 
    style={[style, { transform: [{ scaleX: -1 }] }]} 
    contentFit="cover"
  />
);

export function SamplePreview({ samples, onClearSample, onClearAll }: SamplePreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Sample Images</Text>
        <Button 
          mode="text" 
          textColor={Colors.error}
          onPress={onClearAll}
          compact
        >
          Clear All
        </Button>
      </View>
      
      <View style={styles.samplesContainer}>
        {samples.slice(-10).map((sample, idx) => (
          <View key={idx} style={styles.sampleWrapper}>
            <FlippedImage
              source={{ uri: sample }}
              style={styles.sampleImage}
            />
            <IconButton
              icon="close"
              size={16}
              style={styles.deleteButton}
              iconColor="white"
              onPress={() => onClearSample(idx)}
            />
          </View>
        ))}
        {samples.length > 10 && (
          <View style={styles.moreSamples}>
            <Text>+{samples.length - 10}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
  },
  samplesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  sampleWrapper: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  sampleImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
    padding: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 20,
    height: 20,
  },
  moreSamples: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
}); 