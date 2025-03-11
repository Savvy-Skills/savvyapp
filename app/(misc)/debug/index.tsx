import ScreenWrapper from "@/components/screens/ScreenWrapper";
import React, { useRef, useState } from "react";
import { Button, SegmentedButtons } from "react-native-paper";
import { ScrollView } from "react-native";
import Tokenizer from "@/components/Tokenizer";
import TokenizeComponent from "@/components/TokenizeComponent";
import DrawingBoxWeb from "@/components/react/DrawingBoxWeb";
import { Image } from "expo-image";
import { DrawingBoxHandle } from "@/components/react/DrawingBoxWeb";
import MNISTComponent from "@/components/MNISTComponent";

export default function DebugScreen() {
	const [selectedIndex, setSelectedIndex] = useState<"drawing" | "tokenizer" | "tokenize">("drawing");

	const handleValueChange = (value: string) => {
		setSelectedIndex(value as "drawing" | "tokenizer" | "tokenize");
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
						label: "Do your own Tokenization",
						value: "tokenize",
						icon: "vector-line",
						style: {
							borderRadius: 4,
						}
					},
					{
						label: "Drawing Box",
						value: "drawing",
						icon: "vector-line",
						style: {
							borderRadius: 4,
						}
					},
				]}
				theme={{ roundness: 0 }}
			/>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				{selectedIndex === "drawing" && (
					<MNISTComponent />
				)}
				{selectedIndex === "tokenizer" && <Tokenizer />}
				{selectedIndex === "tokenize" && <TokenizeComponent />}
			</ScrollView>

		</ScreenWrapper>
	);
}

