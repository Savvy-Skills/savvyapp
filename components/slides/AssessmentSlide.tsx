import React, { lazy, Suspense, useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import { AssessmentSlide as AssessmentSlideType } from "@/types";
import NumericalAnswer from "./assessments/NumericalAnswer";
import SingleChoice from "./assessments/SingleChoice";
import MultipleChoice from "./assessments/MultipleChoice";
import ReorderAssessment from "./assessments/Reorder";
import FillBlankAssessment from "./assessments/FillBlank";
import MatchWordsAssessment from "./assessments/MatchWords";
import OpenEnded from "./assessments/OpenEnded";
import DataTable from "../DataTable";
import { ScrollView } from "react-native-gesture-handler";
import { useCourseStore } from "@/store/courseStore";

type AssessmentProps = {
  slide: AssessmentSlideType;
  index: number;
};

let DataVisualizerPlotly = lazy(() => import("../DataVisualizerPlotly"));

function AssessmentComponent({ slide, index }: AssessmentProps) {
  switch (slide.question_info.type) {
    case "Numerical":
      return <NumericalAnswer question={slide.question_info} index={index} />;
    case "Single Choice":
      return <SingleChoice question={slide.question_info} index={index} quizMode={slide.quizMode}/>;
    case "Multiple Choice":
      return <MultipleChoice question={slide.question_info} index={index} />;
    case "Order List":
      return <ReorderAssessment question={slide.question_info} index={index} />;
    case "Fill in the Blank":
      return (
        <FillBlankAssessment question={slide.question_info} index={index} />
      );
    case "Match the Words":
      return (
        <MatchWordsAssessment question={slide.question_info} index={index} />
      );
    case "Open Ended":
      return <OpenEnded question={slide.question_info} index={index} />;
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

export default function AssessmentSlide({ slide, index }: AssessmentProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const { setScrollToEnd } = useCourseStore();

//   useEffect(() => {
//     if (scrollViewRef.current) {
//       setScrollToEnd(() =>
//         scrollViewRef.current?.scrollToEnd({ animated: false })
//       );
//     }
//   }, [setScrollToEnd]);

  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, flexGrow: 1, justifyContent: "center" }}
    >
      {slide.question_info.dataset && slide.question_info.dataset_info && (
        <DataTable datasetInfo={slide.question_info.dataset_info} />
      )}
      {index === 2 && Platform.OS === "web" && (
        <Suspense fallback={<View />}>
          <DataVisualizerPlotly
            dataset={dataform}
            traces={[
              { x: "x", y: "y", name: "First" },
              { x: "x", y: "z", name: "Second" },
              { x: "x", y: "v", name: "Third" },
              { x: "w", y: "w", name: "Fourth" },
            ]}
            title="Data Visualizer"
          />
        </Suspense>
      )}
      <View style={{ flexDirection: "row" }}>
        <AssessmentComponent slide={slide} index={index} />
      </View>
    </ScrollView>
  );
}
