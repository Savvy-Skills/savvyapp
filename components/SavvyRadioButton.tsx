import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/themeStore";
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
	const {isDarkMode} = useThemeStore();
  return (
    <TouchableRipple onPress={onPress} disabled={disabled||disabledTouchable} >
      <View style={[styles.container, style]}>
        <View
          style={[
            styles.radio,
            status === "checked" && styles.radioChecked,
            disabled && styles.radioDisabled,
          ]}
        >
          {status === "checked" && <View style={[styles.radioInner, {backgroundColor: isDarkMode ? Colors.dark.assessment : Colors.assessment}]} />}
        </View>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
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
  label: {
    fontSize: 14,
	fontWeight: 500
  },
  labelDisabled: {
    opacity: 0.5,
  },
});

export default CustomRadioButton;
