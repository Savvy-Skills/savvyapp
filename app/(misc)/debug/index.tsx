import ScreenWrapper from "@/components/screens/ScreenWrapper";
import React, { useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { ScrollView } from "react-native";
import SavvyAgentGame from "@/components/react/game/SavvyAgent";

export default function DebugScreen() {
	const [selectedIndex, setSelectedIndex] = useState<"savvy-agent">("savvy-agent");

	const handleValueChange = (value: string) => {
		setSelectedIndex(value as "savvy-agent");
	};


	return (
		<ScreenWrapper style={{ overflow: "hidden" }}>
			<SegmentedButtons
				style={{ borderRadius: 4 }}
				value={selectedIndex}
				onValueChange={(value) => handleValueChange(value)}
				buttons={[
					{
						label: "Savvy Agent",
						value: "savvy-agent",
						icon: "vector-line",
						style: { borderRadius: 4 },
					},

				]}
				theme={{ roundness: 0 }}
			/>
			<ScrollView contentContainerStyle={{ flexGrow: 1, maxWidth: 600, alignSelf: "center", width: "100%" }}>
				{selectedIndex === "savvy-agent" && <SavvyAgentGame />}
			</ScrollView>
		</ScreenWrapper>
	);
}

