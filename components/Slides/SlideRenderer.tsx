import React from "react";
import { View } from "react-native";
import AssessmentSlide from "./AssessmentSlide";
import ActivitySlide from "./ActivitySlide";
import { Slide } from "../../types";
import VideoComponent from "./VideoComponent";
import styles from "@/styles/styles";
import { useModuleStore } from "@/store/moduleStore";

export interface SlideProps {
  slide: Slide;
  isActive: boolean;
  nextSlide: () => void;
}

const SlideComponent = ({ slide, isActive, nextSlide }: SlideProps) => {
  switch (slide.type) {
	case "Assessment":
	  return <AssessmentSlide slide={slide} />;
	case "Activity":
	  return <ActivitySlide slide={slide} />;
	case "Content":
	  if (slide.content_info.type === "Video") {
		return <VideoComponent url={slide.content_info.url} isActive={isActive} onVideoEnd={nextSlide} />;
	  }
	  return <View />;
	default:
	  return <View />;
  }
}

export default function SlideRenderer({ slide, isActive }: SlideProps) {
	const { nextSlide } = useModuleStore();
  return (
	<View style={styles.customContainer}>
	  <SlideComponent slide={slide} isActive={isActive} nextSlide={nextSlide} />
	</View>
  );
}
