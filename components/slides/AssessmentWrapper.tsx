import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import ThemedTitle from "../themed/ThemedTitle";
import { useThemeStore } from "@/store/themeStore";
import { Colors } from "@/constants/Colors";

interface AssessmentWrapperProps {
	children: React.ReactNode;
	question: QuestionInfo;
	isActive: boolean;
}

export default function AssessmentWrapper({
	question,
	children: assessment,
	isActive,
}: AssessmentWrapperProps) {
	const [showExplanationComponent, setShowExplanationComponent] = useState(false);
	const {
		showExplanation,
		setShownExplanation,
		triggerShowExplanation
	} = useCourseStore();
	const { backgroundAssessment } = useThemeStore();


	const untitledAssessments = ["Fill in the Blank", "True or False"];

	useEffect(() => {
		if (isActive && showExplanation) {
			setShowExplanationComponent((state) => !state);
			triggerShowExplanation();
		}
	}, [showExplanation, isActive, triggerShowExplanation]);

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
