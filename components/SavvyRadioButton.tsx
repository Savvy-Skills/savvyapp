import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/themeStore";
import styles from "@/styles/styles";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";

interface CustomRadioButtonProps {
  label: string;
  value: string;
  status: "checked" | "unchecked";
  onPress: () => void;
  disabled?: boolean;
  disabledTouchable?: boolean;
  style?: any;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  label,
  value,
  status,
  onPress,
  disabled,
  disabledTouchable,
  style,
}) => {
  return (
    <TouchableRipple onPress={onPress} disabled={disabled||disabledTouchable} >
      <View style={[localStyles.container, style]}>
        <View
          style={[
            localStyles.radio,
            status === "checked" && localStyles.radioChecked,
            disabled && localStyles.radioDisabled,
          ]}
        >
          {status === "checked" && <View style={[localStyles.radioInner, {backgroundColor: Colors.assessment}]} />}
        </View>
        <Text style={[styles.optionLabel, disabled && localStyles.labelDisabled]}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const localStyles = StyleSheet.create({
  container: {},
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#a197f9",
    alignItems: "center",
    justifyContent: "center",
  },
  radioChecked: {
    backgroundColor: "#a197f9",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioDisabled: {
    opacity: 0.5,
  },
  labelDisabled: {
    opacity: 0.5,
  },
});

export default CustomRadioButton;
