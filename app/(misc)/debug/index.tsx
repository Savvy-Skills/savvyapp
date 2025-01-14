import DataTableContainer from "@/components/DataTableContainer";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
// import TfjsComponent from "@/components/TfjsComponent";
import TfjsRegression from "@/components/TFJSRegression";
import TopSheet, { TopSheetRefProps } from "@/components/TopSheet";
import { DatasetInfo } from "@/types";
import React, { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";
import { Button, Text } from "react-native-paper";

const datasetInfo: DatasetInfo = {
	id: "x",
	url: "https://2810845b43907691a6f6d3af548bea56.cdn.bubble.io/f1714014246056x716561261256521100/circular-dataset.json",
	name: "Circular Dataset",
	extension: "json",
	type: "Savvy",
	description: "A dataset with circular data",
	image_url: "https://picsum.photos/200/300",
	disabled: false,
	metadata: {
		"rows": 1000,
		"columns": 3
	},
	about: "A dataset with circular data",
}

export default function DebugScreen() {
  const ref = useRef<TopSheetRefProps>(null);
  const onPress = useCallback(() => {
    ref?.current?.scrollTo(100);
  }, []);
  return (
    <ScreenWrapper style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
		<DataTableContainer datasetInfo={datasetInfo} hideVisualizer={true} hideFilter={true} NN={true} />
        {/* <TfjsRegression></TfjsRegression> */}
        {/* <TfjsComponent></TfjsComponent> */}
      </ScrollView>
    </ScreenWrapper>
  );
}
