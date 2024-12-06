import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import styles from "@/styles/styles";
import { Icon } from "react-native-paper";

interface CustomMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onShowTopSheet: () => void;
  showModal: () => void;
}

const CustomNavMenu: React.FC<CustomMenuProps> = ({
  visible,
  onDismiss,
  onShowTopSheet,
  showModal,
}) => {
  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        style={localStyles.overlay}
        onPress={onDismiss}
        activeOpacity={1}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.centeredItems}
            onPress={() => {
              onShowTopSheet();
              onDismiss();
            }}
          >
            <Icon source="format-list-numbered" size={24} color="white" />
            <Text style={localStyles.menuText}>Slide List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.centeredItems}
            onPress={() => {
              showModal();
              onDismiss();
            }}
          >
            <Icon source="send" size={24} color="white" />
            <Text style={localStyles.menuText}>Message us</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  );
};

const localStyles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    alignSelf: "center",
  },
  menuText: {
    color: "white",
    marginTop: 4,
    fontSize: 12,
  },
});

export default CustomNavMenu;
