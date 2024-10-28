import React from "react"
import { View } from "react-native"
import { AssessmentSlide as AssessmentSlideType } from "@/types"
import NumericalAnswer from "./assessments/NumericalAnswer"
import SingleChoice from "./assessments/SingleChoice"
import MultipleChoice from "./assessments/MultipleChoice"
import ReorderAssessment from "./assessments/Reorder"
import FillBlankAssessment from "./assessments/FillBlank"
import MatchWordsAssessment from "./assessments/MatchWords"
import OpenEnded from "./assessments/OpenEnded"

type AssessmentProps = {
  slide: AssessmentSlideType
  index: number
}

function AssessmentComponent({ slide, index }: AssessmentProps) {
  switch (slide.question_info.type) {
    case "Numerical":
      return <NumericalAnswer question={slide.question_info} index={index} />
    case "Single Choice":
      return <SingleChoice question={slide.question_info} index={index} />
    case "Multiple Choice":
      return <MultipleChoice question={slide.question_info} index={index} />
    case "Order List":
      return <ReorderAssessment question={slide.question_info} index={index} />
    case "Fill in the Blank":
      return <FillBlankAssessment question={slide.question_info} index={index} />
    case "Match the Words":
      return <MatchWordsAssessment question={slide.question_info} index={index} />
    case "Open Ended":
      return <OpenEnded question={slide.question_info} index={index} />
    default:
      return <View />
  }
}

export default function AssessmentSlide({ slide, index }: AssessmentProps) {
  return (
    <View style={{ flexDirection: "row", padding: 16 }}>
      <AssessmentComponent slide={slide} index={index} />
    </View>
  )
}