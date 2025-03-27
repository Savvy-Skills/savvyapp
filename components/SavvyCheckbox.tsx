import { Colors } from "@/constants/Colors";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { Feather } from '@expo/vector-icons';
import styles from "@/styles/styles";

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

  return (
    <TouchableRipple onPress={onPress} disabled={disabled || disabledTouchable}>
      <View style={[localStyles.container, style]}>
        <View
          style={[
            localStyles.checkbox,
            status === "checked" && localStyles.checkboxChecked,
            disabled && localStyles.checkboxDisabled,
          ]}
        >
          {status === "checked" && (
            <Feather
              name="check"
              size={16}
              color={Colors.assessment}
            />
          )}
        </View>
        <Text style={[styles.optionLabel, disabled && localStyles.labelDisabled]}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const localStyles = StyleSheet.create({
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
  labelDisabled: {
    opacity: 0.5,
  },
});

export default CustomCheckbox;

