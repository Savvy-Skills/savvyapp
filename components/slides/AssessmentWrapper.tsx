import { useAudioStore } from "@/store/audioStore";
import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, Card } from "react-native-paper";
import { Platform } from "react-native";
import { useModuleStore } from "@/store/moduleStore";

interface AssessmentWrapperProps {
  children: React.ReactNode;
  onSubmit: () => boolean;
  question: QuestionInfo;
}

export default function AssessmentWrapper({
  question,
  children,
  onSubmit,
}: AssessmentWrapperProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { submittedAssessments } = useModuleStore();

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const currentSubmissionIndex = submittedAssessments.findIndex(
	(submission) => submission.question_id === question.id
  );
  const currentSubmission = submittedAssessments[currentSubmissionIndex];


  return (
    <Card style={localStyles.container}>
      {question.type != "Fill in the Blank" && (
        <Card.Title title={question.text} />
      )}
      {showExplanation ? (
        <View style={styles.explanationContainer}>
          <Text>{question.explanation}</Text>
        </View>
      ) : (
        <>{children}</>
      )}
      {currentSubmission && (
        <View
          style={[
            styles.feedbackContainer,
            currentSubmission.correct ? styles.correctFeedback : styles.incorrectFeedback,
          ]}
        >
          <Text style={styles.feedbackText}>
            {currentSubmission.correct ? "Correct!" : "Incorrect"}
          </Text>
        </View>
      )}
      <View style={styles.assessmentButtonContainer}>
        {currentSubmission && (
          <Button mode="outlined" onPress={toggleExplanation}>
            {showExplanation ? "Hide Explanation" : "Show Explanation"}
          </Button>
        )}
      </View>
    </Card>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 600,
    marginLeft: "auto",
    marginRight: "auto",
  },
});
