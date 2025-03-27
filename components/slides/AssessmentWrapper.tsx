import styles from "@/styles/styles";
import { LocalSlide, AssessmentInfo } from "@/types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import ThemedTitle from "../themed/ThemedTitle";
import RichText from "./RichTextComponent";

interface AssessmentWrapperProps {
	slide: LocalSlide;
	children: React.ReactNode;
	question: AssessmentInfo;
}

const untitledAssessments = ["Fill in the Blank", "True or False"];


export default function AssessmentWrapper({
	slide,
	question,
	children: assessment,
}: AssessmentWrapperProps) {

	const showExplanationComponent = slide.showExplanation;

	return (
		<View
			style={[
				styles.slideWidth,
				styles.centeredMaxWidth,
				styles.assessmentWrapper,
				{ backgroundColor: "transparent" }
			]}
		>
			{/* Show title except for untitled assessments */}
			{!untitledAssessments.includes(question.type) && (
				<ThemedTitle
					style={styles.assessmentTitle}
				>
					{question.text}
				</ThemedTitle>
			)}
			{showExplanationComponent ? (
				<View style={styles.explanationContainer}>
					<RichText text={question.explanation || ""} />
				</View>
			) : (
				<>{assessment}</>
			)}
		</View>
	);
}
