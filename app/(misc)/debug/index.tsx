import ScreenWrapper from "@/components/screens/ScreenWrapper";
import React, { useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { ScrollView } from "react-native";
import TeachableMachine from "./teachable-machine";
import ImageEncoding from "./imageencoding";
import PixelSimulator from "@/components/react/PixelSimulator";
import AudioEncodingLesson from "@/components/react/lessons/audioencoding/main/AudioEncodingLesson";
import FaceMesh from "@/components/react/facemesh/FaceMesh";
import DefinitionShowcase from "@/components/react/definitioncontent/DefinitionShowcase";
import GPTNextWordGame from "@/components/react/gpt/NextWord";
import BertMaskedGame from "@/components/react/bert/BertComponent";
import SpeechToText from "@/components/react/stt/SpeechToText";
export default function DebugScreen() {
	const [selectedIndex, setSelectedIndex] = useState<"teachable-machine"
		| "image-encoding"
		| "image-encoding-simple"
		| "pixel-simulator"
		| "audio-encoding"
		| "face-mesh"
		| "definition"
		| "gpt-nextword"
		| "bert-masked-game"
		| "stt">("teachable-machine");

	const handleValueChange = (value: string) => {
		setSelectedIndex(value as "teachable-machine"
			| "image-encoding"
			| "image-encoding-simple"
			| "pixel-simulator"
			| "audio-encoding"
			| "face-mesh"
			| "definition"
			| "gpt-nextword"
			| "bert-masked-game"
			| "stt");
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
						label: "Audio Encoding",
						value: "audio-encoding",
						icon: "image",
						style: { borderRadius: 4 },
					},
					{
						label: "Face Mesh",
						value: "face-mesh",
						icon: "image",
						style: { borderRadius: 4 },
					},
					{
						label: "Definition",
						value: "definition",
						icon: "image",
						style: { borderRadius: 4 },
					},
					{
						label: "Next Word",
						value: "gpt-nextword",
						icon: "image",
						style: { borderRadius: 4 },
					},
					{
						label: "BERT",
						value: "bert-masked-game",
						icon: "image",
						style: { borderRadius: 4 },
					},
					{
						label: "STT",
						value: "stt",
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
				{selectedIndex === "audio-encoding" && <AudioEncodingLesson />}
				{selectedIndex === "face-mesh" && <FaceMesh />}
				{selectedIndex === "definition" && <DefinitionShowcase />}
				{selectedIndex === "gpt-nextword" && <GPTNextWordGame />}
				{selectedIndex === "bert-masked-game" && <BertMaskedGame />}
				{selectedIndex === "stt" && <SpeechToText />}
			</ScrollView>
		</ScreenWrapper>
	);
}

