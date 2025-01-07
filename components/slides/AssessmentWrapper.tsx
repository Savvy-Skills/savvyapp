import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Title, useTheme, Icon, Portal } from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import ThemedTitle from "../themed/ThemedTitle";
import FeedbackComponent from "../Feedback";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";

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
	} = useCourseStore();

	const theme = useTheme();

	const untitledAssessments = ["Fill in the Blank", "True or False"];

	useEffect(() => {
		if (isActive) {
			setShowExplanationComponent((state) => !state);
		}
	}, [showExplanation]);

	return (
		<View
			style={[
				localStyles.wrapperContainer,
				{ backgroundColor: theme.dark ? "#6c6878" : "#F4F1FE" },
			]}
		>
			<View style={localStyles.container}>
				{/* Show title except for untitled assessments */}
				{!untitledAssessments.includes(question.type) && (
					<ThemedTitle
						style={{
							fontSize: 18,
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
		</View>
	);
}

const localStyles = StyleSheet.create({
	wrapperContainer: {
		flex: 1,
		flexDirection: "column",
		maxWidth: SLIDE_MAX_WIDTH,
		marginHorizontal: "auto",
		gap: 16,
	},
	container: {
		flex: 1,
		gap: 16,
		padding: 30,
		paddingTop: 16,
	},
});
