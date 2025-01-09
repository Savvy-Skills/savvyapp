import React, { useCallback, useEffect, useRef } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import AssessmentSlide from "./AssessmentSlide";
import ActivitySlide from "./ActivitySlide";
import { ContentInfo, DatasetInfo, Slide } from "../../types";
import { useCourseStore } from "@/store/courseStore";
import LastSlide from "./LastSlide";
import VideoSlide from "./content/VideoSlide";
import ImageSlide from "./content/ImageSlide";
import RichTextSlide from "./content/RichTextSlide";
import DataTableContainer from "../DataTableContainer";
import styles from "@/styles/styles";

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

const ContentComponent = ({ content, index, canComplete }: ContentComponentProps) => {
	switch (content.type) {
		case "Video":
			return <VideoSlide url={content.url} index={index} canComplete={canComplete} />;
		case "Image":
			return <ImageSlide url={content.url} index={index} />;
		case "Rich Text":
			return <RichTextSlide text={content.state} />;
		case "Dataset":
			return <DataTableContainer datasetInfo={content.dataset_info ?? {} as DatasetInfo} />;
		default:
			return <View />;
	}
};

const SlideComponent = ({ slide, index, quizMode }: SlideProps) => {
	const sortedContents = slide.contents.sort((a, b) => a.order - b.order);
	switch (slide.type) {
		case "Assessment":
			return (
				<View style={[styles.slideWidth, styles.centeredMaxWidth, { flexGrow: 1, flex: 1 }]}>
					{sortedContents.length > 0 && (
						sortedContents.map((content, contentIndex) => (
							<View key={`${contentIndex}-${content.type}`}>
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

			return sortedContents.map((content, contentIndex) => (
				<View key={`${contentIndex}-${content.type}`} style={{flexGrow: 1, flex: 1, justifyContent: "center"}}>
					<ContentComponent
						content={content}
						index={index}
						canComplete={contentIndex === sortedContents.length - 1}
					/>
				</View>
			));
		case "Custom":
			if (slide.subtype === "intro") {
				return <ImageSlide url={slide.image} index={index} />;
			} else if (slide.subtype === "outro") {
				return <LastSlide />;
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
	const lastContent = currentContents[currentContents.length-1]


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
				(slide.type === "Content" &&  lastContent.type !== "Video") ||
				slide.type === "Custom"
			) {
				checkSlideCompletion({ viewed: true });
			}
		}
	}, [currentSlideIndex]);

	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
				flexGrow: 1,
				justifyContent: "center",
				gap: 16,
				width: width,
			}}
			ref={scrollRef}
		>
			<SlideComponent slide={slide} index={index} quizMode={quizMode} />
		</ScrollView>
	);
}
