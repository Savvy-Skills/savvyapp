import { NumericOperator } from "@/types";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";


interface OperatorRendererProps {
  operator: NumericOperator;
}

export default function OperatorRenderer({ operator }: OperatorRendererProps) {
  const getOperatorSymbol = (op: NumericOperator): string => {
    switch (op) {
      case "gt":
        return ">";
      case "gte":
        return "≥";
      case "lt":
        return "<";
      case "lte":
        return "≤";
      case "eq":
        return "=";
      case "neq":
        return "≠";
      default:
        return "=";
    }
  };

  return (
    <View style={styles.operatorContainer}>
      <Text style={styles.operator}>{getOperatorSymbol(operator)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  operatorContainer: {
    backgroundColor: "#ff7b09",
    borderRadius: 4,
    padding: 8,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  operator: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
