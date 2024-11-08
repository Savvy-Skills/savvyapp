import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Title, useTheme, Icon } from "react-native-paper";
import { useModuleStore } from "@/store/moduleStore";
import ThemedTitle from "../themed/ThemedTitle";
// import { Sparkles, AlertTriangle, Check } from "lucide-react"

interface AssessmentWrapperProps {
  children: React.ReactNode;
  question: QuestionInfo;
  onTryAgain?: () => void;
  onRevealAnswer?: () => void;
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;
}

function FeedbackComponent({
  correctness,
  revealed,
  onTryAgain,
  onRevealAnswer,
  onShowExplanation,
}: {
  correctness: boolean;
  revealed: boolean;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
  onShowExplanation: () => void;
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
          <Button mode="text" onPress={onShowExplanation} textColor="#666666">
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
          <Button mode="text" onPress={onShowExplanation} textColor="#3bc2f5">
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
      <View style={localStyles.buttonContainer}>
        <Button
          mode="contained"
          onPress={onTryAgain}
          buttonColor="#1a1523"
          textColor="white"
        >
          Try again
        </Button>
        <Button mode="text" onPress={onRevealAnswer} textColor="#ff861d">
          See answer
        </Button>
      </View>
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
}: AssessmentWrapperProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  // Remove this line:
  // const [showFeedback, setShowFeedback] = useState(true)
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const { submittedAssessments } = useModuleStore();
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

  return (
    <View
      style={[
        localStyles.wrapperContainer,
        { backgroundColor: theme.dark ? "#6c6878" : "#F4F1FE" },
      ]}
    >
      <View style={localStyles.container}>
        {question.type !== "Fill in the Blank" && (
          <ThemedTitle>{question.text}</ThemedTitle>
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
    padding: 16,
    paddingTop: 24,
  },
  feedbackContainer: {
    padding: 16,
    borderWidth: 1,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
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
