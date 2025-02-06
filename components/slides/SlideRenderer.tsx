import React, { useCallback, useEffect, useRef } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import AssessmentSlide from "./AssessmentSlide";
import ActivitySlide from "./ActivitySlide";
import { ContentInfo, DatasetInfo, Slide } from "../../types";
import { useCourseStore } from "@/store/courseStore";
import LastSlide from "./LastSlide";
import ImageSlide from "./content/ImageSlide";
import RichTextSlide from "./content/RichTextSlide";
import DataTableContainer from "../data/DataTableContainer";
import styles from "@/styles/styles";
import VideoComponent from "../VideoComponent";
import NeuralNetworkVisualizer from "../neuralnetwork/SimpleNN";
import { CopilotProvider, useCopilot } from "react-native-copilot";
import { NNState } from "@/types/neuralnetwork";
// import { Button } from "react-native-paper";

export interface SlideProps {
	slide: Slide;
	index: number;
	quizMode: boolean;
}

interface ContentComponentProps {
	content: ContentInfo;
	index: number;
	canComplete: boolean;
}

// const datasetInfo: DatasetInfo = {
// 	id: "x",
// 	url: "https://2810845b43907691a6f6d3af548bea56.cdn.bubble.io/f1714014246056x716561261256521100/circular-dataset.json",
// 	name: "Circular Dataset",
// 	extension: "json",
// 	type: "Savvy",
// 	description: "A dataset with circular data",
// 	image_url: "https://picsum.photos/200/300",
// 	disabled: false,
// 	metadata: {
// 		"rows": 1000,
// 		"columns": 3
// 	},
// 	about: "A dataset with circular data",
// }

const datasetInfo: DatasetInfo = {
	id: "x",
	url: "https://api.savvyskills.io/vault/JS-TssR_/xHThL0ZHBR8g1knlOw94-9--iJY/ol7Izw../carsDataFiltered.json",
	name: "Auto MPG",
	extension: "json",
	type: "Savvy",
	description: "A dataset with auto mpg data",
	image_url: "https://picsum.photos/200/300",
	disabled: false,
	metadata: {
		"rows": 398,
		"columns": 2
	},
	about: "A dataset with auto mpg data",
}

// const datasetInfo: DatasetInfo = {
// 	id: "x",
// 	url: "https://2810845b43907691a6f6d3af548bea56.cdn.bubble.io/f1721684075620x403131934444525440/drug200.csv",
// 	name: "Drug 200",
// 	extension: "csv",
// 	type: "Savvy",
// 	description: "A dataset with drug data",
// 	image_url: "https://picsum.photos/200/300",
// 	disabled: false,
// 	metadata: {
// 		"rows": 200,
// 		"columns": 6
// 	},
// 	about: "A dataset with drug data",
// }

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
			return <NeuralNetworkVisualizer initialNNState={content.nnState ?? {} as NNState} dataset_info={content.dataset_info ?? {} as DatasetInfo} index={index} />;
		default:
			return <View />;
	}
};

const SlideComponent = ({ slide, index, quizMode }: SlideProps) => {
	const sortedContents = slide.contents?.length > 0 ? slide.contents.sort((a, b) => a.order - b.order) : [];
	switch (slide.type) {
		case "Assessment":
			return (
				<View style={[styles.slideWidth, styles.centeredMaxWidth, { gap: 16, flex: 1 }]}>
					{sortedContents.length > 0 && (
						sortedContents.map((content, contentIndex) => (
							<View key={`${contentIndex}-${content.type}`} style={{ gap: 16, paddingHorizontal: 8 }}>
								<ContentComponent content={content} index={index} canComplete={false} />
							</View>
						))
					)}
					<AssessmentSlide
						slide={slide}
						index={index}
						quizMode={quizMode}
					/>
				</View>
			);
		case "Activity":
			return <ActivitySlide slide={slide} index={index} />;
		case "Content":
			if (sortedContents.length > 1) {
				return sortedContents.map((content, contentIndex) => (
					<View key={`${contentIndex}-${content.type}`} style={[[styles.slideWidth, styles.centeredMaxWidth], { gap: 16, paddingHorizontal: 8 }]}>
						<ContentComponent
							content={content}
							index={index}
							canComplete={contentIndex === sortedContents.length - 1}
						/>
					</View>
				));
			} else {
				return <ContentComponent content={sortedContents[0]} index={index} canComplete={false} />;
			}
		case "Custom":
			if (slide.subtype === "intro") {
				return <ImageSlide url={slide.image} index={index} />;
			} else if (slide.subtype === "outro") {
				return <LastSlide />;
			} else if (slide.subtype === "mid") {
				return <NeuralNetworkVisualizer dataset_info={datasetInfo} index={index} />
			}
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
	const {
		currentSlideIndex,
		setSubmittableState,
		checkSlideCompletion,
		submittableStates,
		scrollToEnd,
		completedSlides,
	} = useCourseStore();
	const { width } = useWindowDimensions();
	const isActive = currentSlideIndex === index;
	const scrollRef = useRef<ScrollView>(null);

	const currentContents = slide?.contents && slide.contents.length > 0 ? slide.contents.sort((a, b) => a.order - b.order) : [];
	const lastContent = currentContents[currentContents.length - 1]


	useEffect(() => {
		if (currentSlideIndex === index) {
			scrollRef.current?.scrollToEnd();
		}
	}, [scrollToEnd]);

	useEffect(() => {
		if (isActive && slide.type !== "Assessment") {

			if (submittableStates[currentSlideIndex]) {
				setSubmittableState(currentSlideIndex, false, "Slide Renderer");
			}
		}
	}, [currentSlideIndex, setSubmittableState]);

	useEffect(() => {
		if (isActive && !completedSlides[currentSlideIndex]) {
			if (
				(slide.type === "Content" && lastContent.type !== "Activity") ||
				slide.type === "Custom"
			) {
				checkSlideCompletion({ viewed: true });
			}
		}
	}, [currentSlideIndex]);



	if ((slide.type === "Content" && currentContents.length === 1) && slide.contents[0].type !== "Neural Network") {
		return (
			<SlideComponent slide={slide} index={index} quizMode={quizMode} />
		);
	}

	return (
		<ScrollView
			contentContainerStyle={{
				gap: 16,
				width: width,
				flex: 1,
			}}
			ref={scrollRef}
		>
			<View style={{ marginBottom: "auto", marginTop: slide.subtype === "mid" ? 0 : "auto" }}>
				<SlideComponent slide={slide} index={index} quizMode={quizMode} />
			</View>
		</ScrollView>
	);
}
