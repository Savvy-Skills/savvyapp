import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { QuestionInfo } from "@/types";
import { useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import AssessmentWrapper from "../AssessmentWrapper";
import { Colors } from "@/constants/Colors";

export type TrueFalseQuestionProps = {
  question: QuestionInfo;
  index: number;
  quizMode: boolean;
};

export default function TrueFalseQuestion({
  question,
  index,
  quizMode = false,
}: TrueFalseQuestionProps) {
  const theme = useTheme();
  const [selectedValue, setSelectedValue] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    setSubmittableState,
    setCorrectnessState,
    submittedAssessments,
    submitAssessment,
    completedSlides,
    checkSlideCompletion,
  } = useCourseStore();

  const correctAnswer =
    question.options.find((option) => option.isCorrect)?.text === "True";

  useEffect(() => {
    if (selectedValue !== null) {
      setSubmittableState(index, true);
      let correct: boolean = selectedValue === correctAnswer;
      setCorrectnessState(index, correct);
    }
  }, [
    selectedValue,
    index,
    setSubmittableState,
    correctAnswer,
    setCorrectnessState,
  ]);

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.question_id === question.id
  );

  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined;

  useEffect(() => {
    if (currentSubmission) {
      if (!currentSubmission.correct) {
        setIsWrong(true);
        if (quizMode) {
          setShowAnswer(true);
        }
      }
      if (!completedSlides[index]) {
        checkSlideCompletion();
      }
      setShowFeedback(true);
    }
  }, [submittedAssessments, currentSubmission, quizMode]);

  const blocked =
    currentSubmission?.correct || showAnswer || (quizMode && isWrong);

  const getButtonStyle = (value: boolean) => {
    const baseStyle = [styles.button];

    if (showAnswer && value === correctAnswer) {
      return [...baseStyle, styles.correctButton];
    }
    if (quizMode && isWrong) {
      if (value === correctAnswer) {
        return [...baseStyle, styles.correctButton];
      }
      if (value === selectedValue) {
        return [...baseStyle, styles.incorrectButton];
      }
      return [...baseStyle, styles.disabledButton];
    }
    if (value === selectedValue) {
      if (currentSubmission?.correct) {
        return [...baseStyle, styles.correctButton];
      } else if (isWrong) {
        return [...baseStyle, styles.incorrectButton];
      } else if (showAnswer) {
        return [...baseStyle, styles.revealedButton];
      }
      return [...baseStyle, styles.selectedButton];
    }
    return [...baseStyle, styles.defaultButton];
  };

  const handleChoiceSelection = (value: boolean) => {
    if (quizMode && (isWrong || currentSubmission?.correct)) {
      return;
    }
    if (value !== selectedValue) {
      setSelectedValue(value);
      setIsWrong(false);
      setShowAnswer(false);
      setShowFeedback(false);
    }
  };

  const resetStates = () => {
    setSelectedValue(null);
    setShowAnswer(false);
    setIsWrong(false);
    setShowFeedback(false);
  };

  const handleTryAgain = () => {
    if (!quizMode) {
      resetStates();
    }
  };

  const handleRevealAnswer = () => {
    if (!quizMode) {
      setSelectedValue(correctAnswer);
      setShowAnswer(true);
      setIsWrong(false);
      setShowFeedback(true);
      setCorrectnessState(index, true);
      submitAssessment(question.id);
    }
  };

  const renderStatusIcon = (value: boolean) => {
    if (quizMode && isWrong) {
      if (value === correctAnswer) {
        return (
          <StatusIcon isCorrect={true} isWrong={false} showAnswer={false} />
        );
      }
      if (value === selectedValue) {
        return (
          <StatusIcon isCorrect={false} isWrong={true} showAnswer={false} />
        );
      }
      return null;
    }

    if (value === selectedValue) {
      return (
        <StatusIcon
          isCorrect={currentSubmission?.correct || false}
          isWrong={isWrong}
          showAnswer={showAnswer}
        />
      );
    }
    return null;
  };

  return (
    <AssessmentWrapper
      question={question}
      onTryAgain={quizMode ? undefined : handleTryAgain}
      onRevealAnswer={quizMode ? undefined : handleRevealAnswer}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
      quizMode={quizMode}
    >
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => handleChoiceSelection(true)}
            disabled={blocked && !correctAnswer}
            style={getButtonStyle(true)}
            labelStyle={styles.buttonLabel}
			contentStyle={{ paddingVertical: 8 }}
          >
            True
            {selectedValue === true && renderStatusIcon(true)}
          </Button>
          <View style={{ alignSelf: "center" }}>
            <Icon
              source="chevron-double-up"
              size={24}
              color={Colors.light.primary}
            />
          </View>
          <Text style={styles.questionText}>{question.text}</Text>
          <View style={{ alignSelf: "center" }}>
            <Icon
              source="chevron-double-down"
              size={24}
              color={Colors.light.primary}
            />
          </View>
          <Button
            mode="contained"
            onPress={() => handleChoiceSelection(false)}
            disabled={blocked && correctAnswer}
            style={getButtonStyle(false)}
            labelStyle={styles.buttonLabel}
			contentStyle={{ paddingVertical: 8 }}

          >
            False
            {selectedValue === false && renderStatusIcon(false)}
          </Button>
        </View>
      </View>
    </AssessmentWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(237, 235, 254, 0.3)", // Light purple background
    borderRadius: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2D3748",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 32,
    padding: 8,
  },
  button: {
    justifyContent: "center",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
  },
  defaultButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedButton: {
    backgroundColor: "#a197f9",
    borderColor: "#a197f9",
  },
  correctButton: {
    backgroundColor: "#daedf5",
    borderColor: "#3bc2f5",
    borderWidth: 1,
  },
  incorrectButton: {
    backgroundColor: "#FC8181",
    borderColor: "#FC8181",
    borderWidth: 1,
  },
  revealedButton: {
    backgroundColor: "#F6E05E",
    borderColor: "#F6E05E",
  },
  disabledButton: {
    backgroundColor: "#EDF2F7",
    borderColor: "#E2E8F0",
    opacity: 0.7,
  },
});
