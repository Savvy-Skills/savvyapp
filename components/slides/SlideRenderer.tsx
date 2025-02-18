import React, { useEffect, useRef } from "react";
import { Platform, ScrollView, View } from "react-native";
import AssessmentSlide from "./AssessmentSlide";
import { ContentInfo, DatasetInfo, LocalSlide } from "../../types";
import ImageSlide from "./content/ImageSlide";
import RichTextSlide from "./content/RichTextSlide";
import DataTableContainer from "../data/DataTableContainer";
import styles from "@/styles/styles";
import VideoComponent from "../VideoComponent";
import NeuralNetworkVisualizer from "../neuralnetwork/SimpleNN";
import NeuralNetworkVisualizerWeb from "../neuralnetwork/SimpleNNWeb";

import { NNState } from "@/types/neuralnetwork";

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
			return <RichTextSlide text={content.state} />;
		case "Dataset":
			return <DataTableContainer datasetInfo={content.dataset_info ?? {} as DatasetInfo} traces={content.traces} index={index} />;
		case "Neural Network":
			if (Platform.OS === "web") {
				return <NeuralNetworkVisualizerWeb initialNNState={content.nnState ?? {} as NNState} dataset_info={content.dataset_info ?? {} as DatasetInfo} index={index} />;
			} else {
				return <NeuralNetworkVisualizer initialNNState={content.nnState ?? {} as NNState} dataset_info={content.dataset_info ?? {} as DatasetInfo} index={index} />;
			}
		default:
			return <View />;
	}
};

const SlideComponent = ({ slide, index, quizMode }: SlideProps) => {
	const sortedContents = slide.contents?.length > 0 ? slide.contents.slice().sort((a, b) => a.order - b.order) : [];
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
				return sortedContents.map((content, contentIndex) => (
					<View key={`${contentIndex}-${content.type}`} style={[[styles.slideWidth, styles.centeredMaxWidth], { gap: 16, paddingHorizontal: 8, flex: 1 }]}>
						<ContentComponent
							content={content}
							index={index}
							canComplete={contentIndex === sortedContents.length - 1}
						/>
					</View>
				));
			} else {
				return <ContentComponent content={sortedContents[0]} index={index} canComplete={true} />;
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

	const currentContents = slide?.contents && slide.contents.length > 0 ? slide.contents.slice().sort((a, b) => a.order - b.order) : [];
	const firstContent = currentContents[0]

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

	if ((slide.type === "Content" && currentContents.length === 1) && slide.contents[0].type !== "Neural Network") {
		return (
			<SlideComponent slide={slide} index={index} quizMode={quizMode} />
		);
	}

	const marginTop = (firstContent && firstContent.type === "Neural Network") ? 0 : "auto";

	return (
		<ScrollView
			contentContainerStyle={{
				width: "100%",
				flexGrow: 1,
				flex: Platform.OS === "web" ? 1 : undefined,
			}}
			ref={scrollRef}
		>
			<View style={{ marginBottom: "auto", marginTop: marginTop }}>
				<SlideComponent slide={slide} index={index} quizMode={quizMode} />
			</View>
		</ScrollView>
	);
}
