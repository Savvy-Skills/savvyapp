import React, { useEffect } from "react";
import { View } from "react-native";
import AssessmentSlide from "./AssessmentSlide";
import ActivitySlide from "./ActivitySlide";
import { Slide } from "../../types";
import styles from "@/styles/styles";
import { useCourseStore } from "@/store/courseStore";
import LastSlide from "./LastSlide";
import VideoSlide from "./content/VideoSlide";
import ImageSlide from "./content/ImageSlide";

export interface SlideProps {
  slide: Slide;
  index: number;
  quizMode?: boolean;
}

const SlideComponent = ({
  slide,
  index,
  quizMode,
}: {
  slide: Slide;
  isActive: boolean;
  index: number;
  quizMode: boolean;
}) => {
  switch (slide.type) {
    case "Assessment":
      return (
        <AssessmentSlide slide={slide} index={index} quizMode={quizMode} />
      );
    case "Activity":
      return <ActivitySlide slide={slide} index={index} />;
    case "Content":
      if (slide.content_info.type === "Video") {
        return <VideoSlide url={slide.content_info.url} index={index} />;
      } else if (slide.content_info.type === "Image") {
        return <ImageSlide url={slide.content_info.url} index={index} />;
      }
      return <View />;

    case "Custom":
      if (slide.subtype === "first") {
        return <ImageSlide url={slide.image} index={index} />;
      } else if (slide.subtype === "last") {
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
    setShowIncorrect,
  } = useCourseStore();
  const isActive = currentSlideIndex === index;

  useEffect(() => {
    if (isActive && slide.type !== "Assessment") {
      setShowIncorrect(false);

      if (submittableStates[currentSlideIndex]) {
        setSubmittableState(currentSlideIndex, false, "Slide Renderer");
      }
    }
  }, [currentSlideIndex, setSubmittableState]);

  useEffect(() => {
    if (isActive) {
      if (
        (slide.type === "Content" && slide.content_info.type !== "Video") ||
        slide.type === "Custom"
      ) {
        checkSlideCompletion({ viewed: true });
      }
    }
  }, [currentSlideIndex]);

  return (
    <SlideComponent
      slide={slide}
      isActive={isActive}
      index={index}
      quizMode={quizMode}
    />
  );
}
