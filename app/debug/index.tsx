import ScreenWrapper from "@/components/screens/ScreenWrapper";
import NeuralNetworkVisualizer from "@/components/SimpleNN";
import TfjsComponent from "@/components/TfjsComponent";
import TfjsRegression from "@/components/TFJSRegression";
import TopSheet, { TopSheetRefProps } from "@/components/TopSheet";
import React, { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function DebugScreen() {
  const ref = useRef<TopSheetRefProps>(null);
  const onPress = useCallback(() => {
    ref?.current?.scrollTo(100);
  }, []);
  return (
    <ScreenWrapper style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <NeuralNetworkVisualizer />
        <TfjsRegression></TfjsRegression>
        {/* <TfjsComponent></TfjsComponent> */}
      </ScrollView>
    </ScreenWrapper>
  );
}
