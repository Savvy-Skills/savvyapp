import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Title, useTheme, Icon } from "react-native-paper";
import { useModuleStore } from "@/store/moduleStore";
import ThemedTitle from "../themed/ThemedTitle";

interface AssessmentWrapperProps {
  children: React.ReactNode;
  question: QuestionInfo;
  onTryAgain?: () => void;
  onRevealAnswer?: () => void;
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;
  quizMode: boolean;
}

function FeedbackComponent({
  correctness,
  revealed,
  onTryAgain,
  onRevealAnswer,
  onShowExplanation,
  quizMode,
}: {
  correctness: boolean;
  revealed: boolean;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
  onShowExplanation: () => void;
  quizMode: boolean;
}) {
  if (revealed) {
    return (
      <View
        style={[localStyles.feedbackContainer, localStyles.revealedFeedback]}
      >
        <View style={localStyles.feedbackHeader}>
          <Icon source="check" size={20} color="#666666" />
          <Text style={[localStyles.feedbackTitle, localStyles.revealedTitle]}>
            Here's the correct answer
          </Text>
        </View>
        <View style={localStyles.buttonContainer}>
          <Button
            mode="text"
            onPress={onShowExplanation}
            textColor="#321A5F"
            buttonColor="#E5E3FF"
            labelStyle={{ fontWeight: 600 }}
          >
            See explanation
          </Button>
        </View>
      </View>
    );
  }

  if (correctness) {
    return (
      <View
        style={[localStyles.feedbackContainer, localStyles.correctFeedback]}
      >
        <View style={localStyles.feedbackHeader}>
          <Icon source="star" size={20} color="#3bc2f5" />
          <Text style={[localStyles.feedbackTitle, localStyles.correctTitle]}>
            Positive feedback
          </Text>
        </View>
        <View style={localStyles.buttonContainer}>
          <Button
            mode="text"
            onPress={onShowExplanation}
            textColor="#321A5F"
            buttonColor="#E5E3FF"
            labelStyle={{ fontWeight: 600 }}
          >
            See explanation
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[localStyles.feedbackContainer, localStyles.incorrectFeedback]}
    >
      <View style={localStyles.feedbackHeader}>
        <Icon source="alert" size={20} color="#ff861d" />
        <Text style={[localStyles.feedbackTitle, localStyles.incorrectTitle]}>
          Negative feedback text
        </Text>
      </View>
      {!quizMode && (
        <View style={localStyles.buttonContainer}>
          <Button
            mode="contained"
            onPress={onTryAgain}
            buttonColor="#321A5F"
            textColor="white"
            labelStyle={{ fontWeight: 600 }}
          >
            Try again
          </Button>
          <Button
            mode="text"
            onPress={onRevealAnswer}
            textColor="#321A5F"
            buttonColor="#E5E3FF"
            labelStyle={{ fontWeight: 600 }}
          >
            See answer
          </Button>
        </View>
      )}
    </View>
  );
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
  const { submittedAssessments, scrollToEnd } = useModuleStore();
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

  //   useEffect(() => {
  //     console.log("Current", { currentSubmission, showFeedback, scrollToEnd });
  //     if (currentSubmission && showFeedback && scrollToEnd) {
  //       console.log("Scrolling to end");
  //       scrollToEnd();
  //     }
  //   }, [currentSubmission, showFeedback, scrollToEnd]);

  return (
    <View
      style={[
        localStyles.wrapperContainer,
        { backgroundColor: theme.dark ? "#6c6878" : "#F4F1FE" },
      ]}
    >
      <View style={localStyles.container}>
        {question.type !== "Fill in the Blank" && (
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
  feedbackContainer: {
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    padding: 10,
  },
  correctFeedback: {
    backgroundColor: "#daedf5",
    borderColor: "#3bc2f5",
  },
  incorrectFeedback: {
    backgroundColor: "#ffe7cc",
    borderColor: "#ff861d",
  },
  revealedFeedback: {
    backgroundColor: "#f4f4f4",
    borderColor: "#e0e0e0",
  },
  correctTitle: {
    color: "#3bc2f5",
  },
  incorrectTitle: {
    color: "#ff861d",
  },
  revealedTitle: {
    color: "#666666",
  },
});
