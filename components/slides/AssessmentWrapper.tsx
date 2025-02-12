import styles from "@/styles/styles";
import { LocalSlide, QuestionInfo } from "@/types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import ThemedTitle from "../themed/ThemedTitle";
import { useThemeStore } from "@/store/themeStore";
import { Colors } from "@/constants/Colors";

interface AssessmentWrapperProps {
	slide: LocalSlide;
	children: React.ReactNode;
	question: QuestionInfo;
}

const untitledAssessments = ["Fill in the Blank", "True or False"];


export default function AssessmentWrapper({
	slide,
	question,
	children: assessment,
}: AssessmentWrapperProps) {

	const showExplanationComponent = slide.showExplanation;
	const { backgroundAssessment } = useThemeStore();



	return (
		<View
			style={[
				styles.slideWidth,
				styles.centeredMaxWidth,
				styles.assessmentWrapper,
				{ backgroundColor: backgroundAssessment ? Colors.assessmentBackground : "transparent" }
			]}
		>
			{/* Show title except for untitled assessments */}
			{!untitledAssessments.includes(question.type) && (
				<ThemedTitle
					style={{
						fontSize: 24,
						lineHeight: 27,
						fontWeight: 600,
						textAlign: "center",
					}}
				>
					{question.text}
				</ThemedTitle>
			)}
			{showExplanationComponent ? (
				<View style={styles.explanationContainer}>
					<Text>{question.explanation}</Text>
				</View>
			) : (
				<>{assessment}</>
			)}
		</View>
	);
}
