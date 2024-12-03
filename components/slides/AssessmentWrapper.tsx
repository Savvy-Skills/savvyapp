import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Title, useTheme, Icon } from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import ThemedTitle from "../themed/ThemedTitle";
import FeedbackComponent from "../Feedback";

interface AssessmentWrapperProps {
  children: React.ReactNode;
  question: QuestionInfo;
  onTryAgain?: () => void;
  onRevealAnswer?: () => void;
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;
  quizMode: boolean;
}

export default function AssessmentWrapper({
  question,
  children: assessment,
  onTryAgain,
  onRevealAnswer,
  showFeedback,
  setShowFeedback,
  quizMode,
}: AssessmentWrapperProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const { submittedAssessments } = useCourseStore();
  const theme = useTheme();

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.question_id === question.id
  );
  const currentSubmission = submittedAssessments[currentSubmissionIndex];

  const handleTryAgain = () => {
    if (onTryAgain) onTryAgain();
    setShowFeedback(false);
    setRevealedAnswer(false);
  };

  const handleRevealAnswer = () => {
    if (onRevealAnswer) onRevealAnswer();
    setRevealedAnswer(true);
  };

  const untitledAssessments = ["Fill in the Blank", "True or False"];

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
            style={{ fontSize: 18, lineHeight: 27, fontWeight: 600 }}
          >
            {question.text}
          </ThemedTitle>
        )}
        {showExplanation ? (
          <View style={styles.explanationContainer}>
            <Text>{question.explanation}</Text>
          </View>
        ) : (
          <>{assessment}</>
        )}
      </View>
      {currentSubmission && showFeedback && (
        <FeedbackComponent
          correctness={currentSubmission.correct}
          revealed={revealedAnswer}
          onTryAgain={handleTryAgain}
          onRevealAnswer={handleRevealAnswer}
          onShowExplanation={toggleExplanation}
          showExplanation={showExplanation}
          quizMode={quizMode}
        />
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  wrapperContainer: {
    flex: 1,
    flexDirection: "column",
    maxWidth: 600,
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
