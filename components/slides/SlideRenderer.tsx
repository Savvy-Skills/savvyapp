import React, { useEffect, useRef } from "react";
import { Platform, ScrollView, View } from "react-native";
import AssessmentSlide from "./AssessmentSlide";
import { ContentInfo, DatasetInfo, LocalSlide, NeuronConfig } from "../../types";
import ImageSlide from "./content/basics/ImageSlide";
import RichTextSlide from "./content/basics/RichTextSlide";
import DataTableContainer from "../data/DataTableContainer";
import styles from "@/styles/styles";
import VideoComponent from "./content/advanced/VideoComponent";
import NeuralNetworkVisualizer from "../neuralnetwork/SimpleNN";
import NeuralNetworkVisualizerWeb from "../neuralnetwork/SimpleNNWeb";

import { NNState } from "@/types/neuralnetwork";
import { useViewStore } from "@/store/viewStore";
import NeuronVisualization from "./content/advanced/NeuronVisualization";
import WordToVec from "./content/advanced/WordToVec";
import MNISTComponent from "./content/advanced/MNISTComponent";
import Tokenizer from "../Tokenizer";
import TokenizeComponent from "./content/advanced/TokenizeComponent";
import TeachableMachine from "../teachable-machine";
import PixelSimulator from "../react/PixelSimulator";
import ImageEncoding from "../imageencoding";
import AudioEncodingLesson from "../react/lessons/audioencoding/main/AudioEncodingLesson";
import DefinitionShowcase from "../react/definitioncontent/DefinitionShowcase";
import FaceMesh from "../react/facemesh/FaceMesh";
import GPTNextWordGame from "../react/gpt/NextWord";
import BertMaskedGame from "../react/bert/BertComponent";
import SpeechToText from "../react/stt/SpeechToText";

export interface SlideProps {
	slide: LocalSlide;
	index: number;
	quizMode: boolean;
}

interface ContentComponentProps {
	content: ContentInfo;
	index: number;
	canComplete: boolean;
}

const ContentComponent = ({ content, index, canComplete }: ContentComponentProps) => {
	switch (content.type) {
		case "Video":
			return <VideoComponent url={content.url} index={index} canComplete={canComplete} />;
		case "Image":
			return <ImageSlide url={content.url} index={index} />;
		case "Rich Text":
			return <RichTextSlide text={content.state?.value ?? ""} />;
		case "Definition":
			return <DefinitionShowcase content={content} />;
		case "Dataset":
			return <DataTableContainer datasetInfo={content.dataset_info ?? {} as DatasetInfo} traces={content.state.traces} index={index} />;
		case "Tool":
			switch (content.subtype) {
				case "Neural Network":
					if (Platform.OS === "web") {
						return <NeuralNetworkVisualizerWeb initialNNState={content.state.nnState ?? {} as NNState} dataset_info={content.dataset_info ?? {} as DatasetInfo} index={index} />;
					} else {
						return <NeuralNetworkVisualizer initialNNState={content.state.nnState ?? {} as NNState} dataset_info={content.dataset_info ?? {} as DatasetInfo} index={index} />;
					}
				case "Neuron":
					return <NeuronVisualization config={content.state.neuronConfig ?? {} as NeuronConfig} dataset_info={content.dataset_info ?? {} as DatasetInfo} />;
				case "Word2Vec":
					return <WordToVec dataset_info={content.dataset_info ?? {} as DatasetInfo} index={index} />;
				case "MNIST":
					return <MNISTComponent />;
				case "Tokenization":
					return <TokenizeComponent content={content} />;
				case "Auto Tokenization":
					return <Tokenizer content={content} />;
				case "Teachable Machine":
					return <TeachableMachine content={content} />;
				case "Face Detection":
					return <FaceMesh />;
				case "Next Word":
					return <GPTNextWordGame />;
				case "BERT":
					return <BertMaskedGame />;
				case "Speech to Text":
					return <SpeechToText />;
				default:
					return <View />;
			}
		case "Educational":
			switch (content.subtype) {
				case "Pixel Simulator":
					return <PixelSimulator content={content} />;
				case "Image Encoding":
					return <ImageEncoding content={content} />;
				case "Audio Encoding":
					return <AudioEncodingLesson content={content} />;
			}
		default:
			return <View />;
	}
};

const EXCLUDED_CONTENT_TYPES = ["Neural Network", "Neuron", "Word2Vec", "Dataset", "Teachable Machine", "Speech to Text", "Audio Encoding", "Image Encoding", "Pixel Simulator", "MNIST", "Educational"];

const SlideComponent = ({ slide, index, quizMode }: SlideProps) => {
	const sortedContents = slide.contents && slide.contents.length > 0 ? slide.contents.slice().sort((a, b) => a.order - b.order) : [];
	switch (slide.type) {
		case "Assessment":
			return (
				<View style={[styles.slideWidth, styles.centeredMaxWidth, { gap: 16 }]}>
					{sortedContents.length > 0 && (
						sortedContents.map((content, contentIndex) => (
							<View key={`${contentIndex}-${content.type}`} style={{ gap: 16, paddingHorizontal: 8 }}>
								<ContentComponent content={content} index={index} canComplete={false} />
							</View>
						))
					)}
					<AssessmentSlide
						slide={slide}
						quizMode={quizMode}
					/>
				</View>
			);
		case "Activity":
			return <View />;
		// return <ActivitySlide slide={slide} index={index} />;
		case "Content":
			if (sortedContents.length > 1) {
				return sortedContents.map((content, contentIndex) => {
					const flex = content.type === "Educational" ? undefined : 1;
					return (
						<View key={`${contentIndex}-${content.type}`} style={[[styles.slideWidth, styles.centeredMaxWidth], {flex: flex, gap: 16 }]}>
							<ContentComponent
								content={content}
								index={index}
								canComplete={contentIndex === sortedContents.length - 1}
							/>
						</View>
					)
				}
				);
			} else {
				if (EXCLUDED_CONTENT_TYPES.includes(sortedContents[0].type) || EXCLUDED_CONTENT_TYPES.includes(sortedContents[0].subtype || "")) {
					return <View style={[styles.slideWidth, styles.centeredMaxWidth, { gap: 16 }]}>
						<ContentComponent content={sortedContents[0]} index={index} canComplete={true} />
					</View>
				} else if (sortedContents[0].type === "Definition") {
					return <View style={[styles.slideWidth, styles.centeredMaxWidth, { flex: 1 }]}>
						<DefinitionShowcase content={sortedContents[0]} />
					</View>
				} else {
					return <ContentComponent content={sortedContents[0]} index={index} canComplete={true} />;
				}
			}
		case "Custom":
			return <View />;
		default:
			return <View />;
	}
};

export default function SlideRenderer({
	slide,
	index,
	quizMode = false,
}: SlideProps) {

	const scrollRef = useRef<ScrollView>(null);

	const { trigger, resetTrigger } = useViewStore();

	const currentContents = slide?.contents && slide.contents.length > 0 ? slide.contents.slice().sort((a, b) => a.order - b.order) : [];
	const firstContent = currentContents[0]

	useEffect(() => {
		if (trigger) {
			switch (trigger) {
				case "scrollToEnd":
					scrollRef.current?.scrollToEnd();
					break;
				case "scrollToStart":
					scrollRef.current?.scrollTo({ y: 0, animated: true });
					break;
				default:
					break;
			}
			resetTrigger();
		}
	}, [trigger]);

	useEffect(() => {
		if (slide.type === "Assessment") {
			setTimeout(() => {
				scrollRef.current?.scrollToEnd();
			}, 100);
		}
	}, [index]);

	useEffect(() => {
		if (slide.submitted) {
			scrollRef.current?.scrollToEnd();
		}
	}, [slide.submitted]);

	if ((slide.type === "Content" && currentContents.length === 1) && !EXCLUDED_CONTENT_TYPES.includes(currentContents[0].type) && !currentContents[0].subtype && currentContents[0].type !== "Definition") {
		return (
			<SlideComponent slide={slide} index={index} quizMode={quizMode} />
		);
	}

	const marginTop = (firstContent && !["Neural Network", "Neuron", "Word2Vec"].includes(firstContent.type)) ? 0 : "auto";
	const flex = firstContent && firstContent.type === "Definition" ? 1 : undefined;


	return (
		<ScrollView
			contentContainerStyle={{
				width: Platform.OS === "web" ? "100vw" as any : "100%",
				flexGrow: 1,
				flex: Platform.OS === "web" ? 1 : undefined,
			}}
			ref={scrollRef}
		>
			<View style={{ marginBottom: "auto", marginTop: marginTop, gap: 16, flex: flex }}>
				<SlideComponent slide={slide} index={index} quizMode={quizMode} />
			</View>
		</ScrollView>
	);
}
