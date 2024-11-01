import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CustomMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onShowCaptions: () => void;
  onExplanation: () => void;
  onReportProblem: () => void;
}

const CustomNavMenu: React.FC<CustomMenuProps> = ({
  visible,
  onDismiss,
  onShowCaptions,
  onExplanation,
  onReportProblem,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.overlay}
      onPress={onDismiss}
      activeOpacity={1}
    >
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={onShowCaptions}>
          <MaterialCommunityIcons name="account" size={24} color="white" />
          <Text style={styles.menuText}>Show captions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={onExplanation}>
          <MaterialCommunityIcons name="account" size={24} color="white" />
          <Text style={styles.menuText}>Explanation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={onReportProblem}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="white" />
          <Text style={styles.menuText}>Report a problem</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    alignSelf: "center",
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#4a148c", // Deep purple color
    borderRadius: 12,
    paddingVertical: 12,
	gap: 16,
    paddingHorizontal: 12,
  },
  menuItem: {
    alignItems: "center",
  },
  menuText: {
    color: "white",
    marginTop: 4,
    fontSize: 12,
  },
});

export default CustomNavMenu;
