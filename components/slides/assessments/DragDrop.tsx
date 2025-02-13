import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { QuestionInfo } from "@/types";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import AssessmentWrapper from "../AssessmentWrapper";
import DragAndDrop from "@/components/react/DragAndDrop";
import { Platform, useWindowDimensions } from "react-native";
import { useViewStore } from "@/store/viewStore";
import { LocalSlide } from "@/types";

export type DragAndDropAssessmentProps = {
	slide: LocalSlide;
	question: QuestionInfo;
	quizMode?: boolean;
};

export default function DragAndDropAssessment({
	slide,
	question,
	quizMode = false,
}: DragAndDropAssessmentProps) {
	const { width } = useWindowDimensions();

	const isMobileWeb = Platform.OS === "web" && width < 768;

	return (
		<AssessmentWrapper
			slide={slide}
			question={question}
		>
			<DragAndDrop
				quizMode={quizMode}
				isMobileWeb={isMobileWeb}
				slide={slide}
			/>
		</AssessmentWrapper>
	);
}
