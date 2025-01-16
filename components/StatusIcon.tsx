import React from "react";
import { View, StyleSheet } from "react-native";
import FilledIcon from "./FilledIcon";
import { Colors } from "@/constants/Colors";

interface StatusIconProps {
  isCorrect: boolean | null;
  isWrong: boolean;
  showAnswer: boolean;
  size?: number;
}

export default function StatusIcon({
  isCorrect,
  isWrong,
  showAnswer,
  size = 24,
}: StatusIconProps) {
  if (isCorrect && !showAnswer) {
    return (
      <FilledIcon
        source="check-circle"
        size={size}
        color={Colors.success}
        fillColor="white"
      />
    );
  } else if (isWrong) {
    return (
      <FilledIcon
        source="close-circle"
        size={size}
        color={Colors.error}
        fillColor="white"
      />
    );
  } else if (showAnswer) {
    return (
      <FilledIcon
        source="check-circle"
        size={size}
        color={Colors.revealed}
        fillColor="white"
      />
    );
  }
  return null;
}