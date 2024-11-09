import React from "react";
import { View, StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

interface FilledIconProps {
  source: string;
  size: number;
  color: string;
  fillColor?: string;
}

export default function FilledIcon({
  source,
  size,
  color,
  fillColor = "white",
}: FilledIconProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: size * 0.75,
            height: size * 0.75,
            // Center the fill relative to the icon
            top: size * 0.125,
            left: size * 0.125,
          },
        ]}
      />
      <Icon source={source} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  fill: {
    position: "absolute",
    borderRadius: 50,
    zIndex: -1, // Ensure the fill stays behind the icon
  },
});
