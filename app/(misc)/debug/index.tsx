import ScreenWrapper from "@/components/screens/ScreenWrapper";
import React, { useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { ScrollView } from "react-native";
import TeachableMachine from "./teachable-machine";


export default function DebugScreen() {
	const [selectedIndex, setSelectedIndex] = useState<"teachable-machine">("teachable-machine");

	const handleValueChange = (value: string) => {
		setSelectedIndex(value as "teachable-machine");
	};

	return (
		<ScreenWrapper style={{ overflow: "hidden" }}>
			<SegmentedButtons
				style={{ borderRadius: 4 }}
				value={selectedIndex}
				onValueChange={(value) => handleValueChange(value)}
				buttons={[
					{
						label: "Teachable Machine",
						value: "teachable-machine",
						icon: "vector-line",
						style: { borderRadius: 4 },
					},
				]}
				theme={{ roundness: 0 }}
			/>
			<ScrollView contentContainerStyle={{ flexGrow: 1, maxWidth: 600, alignSelf: "center", width: "100%" }}>
				{selectedIndex === "teachable-machine" && <TeachableMachine />}
			</ScrollView>

		</ScreenWrapper>
	);
}

