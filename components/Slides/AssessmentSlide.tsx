import {
  Text,
  View,
  /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ StyleSheet,
} from "react-native";

import { AssessmentSlide as AssessmentSlideType } from "@/types";
import NumericalAnswer from "./Assessments/NumericalAnswer";
import SingleChoice from "./Assessments/SingleChoice";
import MultipleChoice from "./Assessments/MultipleChoice";
import ReorderAssessment from "./Assessments/Reorder";

type AssessmentProps = {
  slide: AssessmentSlideType;
};

export default function AssessmentSlide({ slide }: AssessmentProps) {
  switch (slide.question_info.type) {
    case "Numerical":
      return <NumericalAnswer question={slide.question_info} />;
    case "Single Choice":
      return <SingleChoice question={slide.question_info} />;
    case "Multiple Choice":
      return <MultipleChoice question={slide.question_info} />;
    case "Order List":
      return <ReorderAssessment question={slide.question_info} />;
	
    default:
      return (
        <View>
          <Text>Assessment</Text>
          <Text>{slide.question_info.type}</Text>
        </View>
      );
  }
}
