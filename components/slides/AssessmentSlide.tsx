import React, { lazy, Suspense, useEffect, useRef } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { AssessmentSlide as AssessmentSlideType } from "@/types";
import NumericalAnswer from "./assessments/NumericalAnswer";
import SingleChoice from "./assessments/SingleChoice";
import MultipleChoice from "./assessments/MultipleChoice";
import ReorderAssessment from "./assessments/Reorder";
import FillBlankAssessment from "./assessments/FillBlank";
import MatchWordsAssessment from "./assessments/MatchWords";
import OpenEnded from "./assessments/OpenEnded";
import { ScrollView } from "react-native-gesture-handler";
import { useCourseStore } from "@/store/courseStore";
import DragAndDropAssessment from "./assessments/DragDrop";
import DataTableContainer from "../DataTableContainer";
import TrueFalseQuestion from "./assessments/TrueFalse";

type AssessmentProps = {
  slide: AssessmentSlideType;
  index: number;
  quizMode: boolean;
};



function AssessmentComponent({ slide, index, quizMode }: AssessmentProps) {
  switch (slide.assessment_info.type) {
    case "Numerical":
      return (
        <NumericalAnswer
          question={slide.assessment_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Single Choice":
      return (
        <SingleChoice
          question={slide.assessment_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Multiple Choice":
      return (
        <MultipleChoice
          question={slide.assessment_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Order List":
      return (
        <ReorderAssessment
          question={slide.assessment_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Fill in the Blank":
      return (
        <FillBlankAssessment
          question={slide.assessment_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Match the Words":
      return (
        <MatchWordsAssessment
          question={slide.assessment_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Open Ended":
      return (
        <OpenEnded
          question={slide.assessment_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Drag and Drop":
      return (
        <DragAndDropAssessment
          question={slide.assessment_info}
          index={index}
          quizMode={quizMode}
        />
      );
	case "True or False":
		return (
			<TrueFalseQuestion
				question={slide.assessment_info}
				index={index}
				quizMode={quizMode}
			/>
		)
    default:
      return <View />;
  }
}

export default function AssessmentSlide({
  slide,
  index,
  quizMode,
}: AssessmentProps) {

	const {width} = useWindowDimensions();

  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, flexGrow: 1, justifyContent: "center", width: width }}
    >
      {slide.assessment_info.dataset && slide.assessment_info.dataset_info && (

        <DataTableContainer datasetInfo={slide.assessment_info.dataset_info} />

      )}
      <View style={{ flexDirection: "row" }}>
        <AssessmentComponent slide={slide} index={index} quizMode={quizMode} />
      </View>
    </ScrollView>
  );
}
