import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { Feather } from '@expo/vector-icons';

interface CustomCheckboxProps {
  label: string;
  status: "checked" | "unchecked";
  onPress: () => void;
  disabled?: boolean;
  disabledTouchable?: boolean;
  style?: any;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  status,
  onPress,
  disabled,
  disabledTouchable,
  style,
}) => {
  const { isDarkMode } = useThemeStore();

  return (
    <TouchableRipple onPress={onPress} disabled={disabled || disabledTouchable}>
      <View style={[styles.container, style]}>
        <View
          style={[
            styles.checkbox,
            status === "checked" && styles.checkboxChecked,
            disabled && styles.checkboxDisabled,
          ]}
        >
          {status === "checked" && (
            <Feather
              name="check"
              size={16}
              color={isDarkMode ? Colors.dark.assessment : Colors.assessment}
            />
          )}
        </View>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#a197f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#a197f9",
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelDisabled: {
    opacity: 0.5,
  },
});

export default CustomCheckbox;

