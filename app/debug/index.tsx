import ReactComponent from "@/components/ReactComponent";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import TfjsComponent from "@/components/TfjsComponent";
import TfjsRegression from "@/components/TFJSRegression";
import React from "react";
import { ScrollView } from "react-native";

export default function DebugScreen() {
  return (
    <ScreenWrapper style={{ flex: 1 }}>
        {/* <TfjsRegression></TfjsRegression> */}
        {/* <TfjsComponent></TfjsComponent> */}
		<ReactComponent />
    </ScreenWrapper>
  );
}
