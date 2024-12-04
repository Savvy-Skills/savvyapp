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

let DataVisualizerPlotly = lazy(() => import("../DataVisualizerPlotly"));

function AssessmentComponent({ slide, index, quizMode }: AssessmentProps) {
  switch (slide.question_info.type) {
    case "Numerical":
      return (
        <NumericalAnswer
          question={slide.question_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Single Choice":
      return (
        <SingleChoice
          question={slide.question_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Multiple Choice":
      return (
        <MultipleChoice
          question={slide.question_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Order List":
      return (
        <ReorderAssessment
          question={slide.question_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Fill in the Blank":
      return (
        <FillBlankAssessment
          question={slide.question_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Match the Words":
      return (
        <MatchWordsAssessment
          question={slide.question_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Open Ended":
      return (
        <OpenEnded
          question={slide.question_info}
          index={index}
          quizMode={quizMode}
        />
      );
    case "Drag and Drop":
      return (
        <DragAndDropAssessment
          question={slide.question_info}
          index={index}
          quizMode={quizMode}
        />
      );
	case "True or False":
		return (
			<TrueFalseQuestion
				question={slide.question_info}
				index={index}
				quizMode={quizMode}
			/>
		)
    default:
      return <View />;
  }
}

const dataform = [
  {
    x: 1,
    y: 10,
    z: 16,
    v: 20,
    w: 5,
  },
  {
    x: 2,
    y: 15,
    z: 5,
    v: 10,
    w: 1,
  },
  {
    x: 3,
    y: 13,
    z: 11,
    v: 7,
    w: 4,
  },
  {
    x: 3,
    y: 13,
    z: 11,
    v: 15,
    w: 8,
  },
  {
    x: 4,
    y: 17,
    z: 9,
    v: 5,
    w: 2,
  },
];

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
      {slide.question_info.dataset && slide.question_info.dataset_info && (
        <DataTableContainer datasetInfo={slide.question_info.dataset_info} />
      )}
      {index === 3 && (
        <Suspense fallback={<View />}>
          <DataVisualizerPlotly
            dataset={dataform}
            traces={[{ x: "x", y: "y", name: "First", type: "bar" }]}
            title="Data Visualizer"
          />
        </Suspense>
      )}
      <View style={{ flexDirection: "row" }}>
        <AssessmentComponent slide={slide} index={index} quizMode={quizMode} />
      </View>
    </ScrollView>
  );
}
