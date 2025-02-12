import React from "react";
import {
	View,
} from "react-native";
import { LocalSlide } from "@/types";
import NumericalAnswer from "./assessments/NumericalAnswer";
import SingleChoice from "./assessments/SingleChoice";
import MultipleChoice from "./assessments/MultipleChoice";
import ReorderAssessment from "./assessments/Reorder";
import FillBlankAssessment from "./assessments/FillBlank";
import MatchWordsAssessment from "./assessments/MatchWords";
import OpenEnded from "./assessments/OpenEnded";
import DragAndDropAssessment from "./assessments/DragDrop";
import TrueFalseQuestion from "./assessments/TrueFalse";

type AssessmentProps = {
	slide: LocalSlide;
	quizMode: boolean;
};

function AssessmentComponent({ slide, quizMode }: AssessmentProps) {
	switch (slide.assessment_info?.type) {
		case "Numerical":
			return (
				<NumericalAnswer
					slide={slide}
					question={slide.assessment_info}
					quizMode={quizMode}
				/>
			);
		case "Single Choice":
			return (
				<SingleChoice
					slide={slide}
					question={slide.assessment_info}
					quizMode={quizMode}
				/>
			);
		case "Multiple Choice":
			return (
				<MultipleChoice
					slide={slide}
					question={slide.assessment_info}
					quizMode={quizMode}
				/>
			);
		case "Order List":
			return (
				<ReorderAssessment
					slide={slide}
					question={slide.assessment_info}
					quizMode={quizMode}
				/>
			);
		case "Fill in the Blank":
			return (
				<FillBlankAssessment
					slide={slide}
					question={slide.assessment_info}
					quizMode={quizMode}
				/>
			);
		case "Match the Words":
				return (
					<MatchWordsAssessment
						slide={slide}
						question={slide.assessment_info}
						quizMode={quizMode}
					/>
				);
		case "Open Ended":
			return (
				<OpenEnded
					slide={slide}
					question={slide.assessment_info}
					quizMode={quizMode}
				/>
			);
		case "Drag and Drop":
			return (
				<DragAndDropAssessment
					slide={slide}
					question={slide.assessment_info}
					quizMode={quizMode}
				/>
			);
		case "True or False":
			return (
				<TrueFalseQuestion
					slide={slide}
					question={slide.assessment_info}
					quizMode={quizMode}
				/>
			);
		default:
			return <View />;
	}
}

export default function AssessmentSlide({
	slide,
	quizMode,
}: AssessmentProps) {

	return (
		<AssessmentComponent slide={slide} quizMode={quizMode} />
	);
}
