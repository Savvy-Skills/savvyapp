import ScreenWrapper from "@/components/screens/ScreenWrapper";
import React, { useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { ScrollView } from "react-native";
import TeachableMachine from "./teachable-machine";
import ImageEncoding from "./imageencoding";
import PixelSimulator from "@/components/react/PixelSimulator";
import AudioVisualizer from "@/components/react/AudioVisualizer";
export default function DebugScreen() {
	const [selectedIndex, setSelectedIndex] = useState<"teachable-machine" | "image-encoding" | "image-encoding-simple" | "pixel-simulator" | "audio-visualizer">("teachable-machine");

	const handleValueChange = (value: string) => {
		setSelectedIndex(value as "teachable-machine" | "image-encoding" | "image-encoding-simple" | "pixel-simulator" | "audio-visualizer");
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
					{
						label: "Image Encoding (Simple)",
						value: "image-encoding-simple",
						icon: "image",
						style: { borderRadius: 4 },
					},
					{
						label: "Image Encoding",
						value: "image-encoding",
						icon: "image",
						style: { borderRadius: 4 },
					},
					{
						label: "Pixel Simulator",
						value: "pixel-simulator",
						icon: "image",
						style: { borderRadius: 4 },
					},
					{
						label: "Audio Visualizer",
						value: "audio-visualizer",
						icon: "image",
						style: { borderRadius: 4 },
					},

				]}
				theme={{ roundness: 0 }}
			/>
			<ScrollView contentContainerStyle={{ flexGrow: 1, maxWidth: 600, alignSelf: "center", width: "100%" }}>
				{selectedIndex === "teachable-machine" && <TeachableMachine />}
				{selectedIndex === "image-encoding-simple" && <ImageEncoding allowImageUpload={false} availableResolutions={[30, 50]} />}
				{selectedIndex === "image-encoding" && <ImageEncoding />}
				{selectedIndex === "pixel-simulator" && <PixelSimulator />}
				{selectedIndex === "audio-visualizer" && <AudioVisualizer />}
			</ScrollView>
		</ScreenWrapper>
	);
}

