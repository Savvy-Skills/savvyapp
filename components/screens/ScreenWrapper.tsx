import React from "react";
import { ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenWrapper({ children, style }: ScreenWrapperProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[{ backgroundColor: theme.colors.background, flex: 1 }, style]}>
      {children}
    </SafeAreaView>
  );
}