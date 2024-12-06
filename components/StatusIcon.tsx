import React from "react";
import { View, StyleSheet } from "react-native";
import FilledIcon from "./FilledIcon";

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
        color="#23b5ec"
        fillColor="white"
      />
    );
  } else if (isWrong) {
    return (
      <FilledIcon
        source="close-circle"
        size={size}
        color="#ff7b09"
        fillColor="white"
      />
    );
  } else if (showAnswer) {
    return (
      <FilledIcon
        source="check-circle"
        size={size}
        color="#9E9E9E"
        fillColor="white"
      />
    );
  }
  return null;
}