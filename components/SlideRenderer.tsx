import React from "react";
import { View } from "react-native";
import AssessmentSlide from "./AssessmentSlide";
import ContentSlide from "./ContentSlide";
import ActivitySlide from "./ActivitySlide";
import { Slide } from "../types";

export interface SlideProps { 
	slide: Slide;
}

export default function SlideRenderer({ slide }: SlideProps) {
  switch (slide.type) {
    case "Assessment":
      return <AssessmentSlide slide={slide} />;
    case "Content":
      return <ContentSlide slide={slide} />;
    case "Activity":
      return <ActivitySlide slide={slide} />;
    default:
      return <View />;
  }
}
