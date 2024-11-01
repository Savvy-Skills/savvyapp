import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Title, useTheme } from "react-native-paper";
import { useModuleStore } from "@/store/moduleStore";

interface AssessmentWrapperProps {
  children: React.ReactNode;
  question: QuestionInfo;
}

export default function AssessmentWrapper({
  question,
  children,
}: AssessmentWrapperProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { submittedAssessments } = useModuleStore();
  const theme = useTheme();

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.question_id === question.id
  );
  const currentSubmission = submittedAssessments[currentSubmissionIndex];

  return (
    <View style={[localStyles.container, {backgroundColor: theme.dark ? "#6c6878" : "#F4F1FE"}]}>
      {question.type != "Fill in the Blank" && <Title>{question.text}</Title>}
      {showExplanation ? (
        <View style={styles.explanationContainer}>
          <Text>{question.explanation}</Text>
        </View>
      ) : (
        <>{children}</>
      )}
      {currentSubmission && (
        <View style={styles.assessmentButtonContainer}>
          <Button mode="outlined" onPress={toggleExplanation}>
            {showExplanation ? "Hide Explanation" : "Show Explanation"}
          </Button>
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    gap: 16,
    padding: 16,
	paddingTop: 24,
	maxWidth: 600,
  },
});
