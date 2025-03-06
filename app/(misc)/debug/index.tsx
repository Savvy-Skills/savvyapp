import ScreenWrapper from "@/components/screens/ScreenWrapper";
import React, { useState } from "react";
import NeuronVisualization from "@/components/NeuronVisualization";
import { SegmentedButtons } from "react-native-paper";
import WordToVec from "@/components/WordToVec";
import { ScrollView } from "react-native";
import Tokenizer from "@/components/Tokenizer";

export default function DebugScreen() {
	const [selectedIndex, setSelectedIndex] = useState<"neuron" | "word2vec" | "tokenizer">("neuron");

	const handleValueChange = (value: string) => {
		setSelectedIndex(value as "neuron" | "word2vec" | "tokenizer");
	};

	return (
		<ScreenWrapper style={{ overflow: "hidden" }}>
			<SegmentedButtons
				style={{ borderRadius: 4 }}
				value={selectedIndex}
				onValueChange={(value) => handleValueChange(value)}
				buttons={[
					{
						label: "Tokenizer",
						value: "tokenizer",
						icon: "vector-line",
						style: {
							borderRadius: 4,
						}
					},
					{
						label: "Word to Vec",
						value: "word2vec",
						icon: "vector-line",
						style: {
							borderRadius: 4,
						}
					},
				]}
				theme={{ roundness: 0 }}
			/>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				{selectedIndex === "word2vec" && <WordToVec index={0} />}
				{selectedIndex === "tokenizer" && <Tokenizer />}
			</ScrollView>

		</ScreenWrapper>
	);
}

