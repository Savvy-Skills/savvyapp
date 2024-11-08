import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { RadioButton, Button, Icon } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { QuestionInfo } from "@/types";
import { useModuleStore } from "@/store/moduleStore";

export type AssessmentProps = {
  question: QuestionInfo;
  index: number;
};

export default function SingleChoice({ question, index }: AssessmentProps) {
  const [selectedValue, setSelectedValue] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const { setSubmittableState, setCorrectnessState, submittedAssessments } =
    useModuleStore();

  const options = question.options.map((option) => option.text);
  const correctAnswer =
    question.options.find((option) => option.isCorrect)?.text || "";

  useEffect(() => {
    if (selectedValue) {
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
      }
      setShowFeedback(true);
    }
  }, [submittedAssessments, currentSubmission]);

  const blocked = currentSubmission?.correct || showAnswer;

  const getOptionStyles = (option: string) => {
    if (option === selectedValue) {
      if (currentSubmission?.correct) {
        return [styles.option, styles.correctOption];
      } else if (isWrong) {
        return [styles.option, styles.incorrectOption];
      } else if (showAnswer) {
        return [styles.option, styles.revealedOption];
      }
      return [styles.option, styles.selectedOption];
    }
    return [styles.option];
  };

  const handleChoiceSelection = (value: string) => {
    setSelectedValue(value);
    setIsWrong(false);
    setShowAnswer(false);
    setShowFeedback(false);
  };

  const renderIcon = (option: string) => {
    if (option === selectedValue) {
      if (currentSubmission?.correct) {
        return (
          <>
            <View style={styles.fillIcon} />
            <Icon source="check-circle" size={24} color="#23b5ec" />
          </>
        );
      } else if (isWrong) {
        return (
          <>
            <View style={styles.fillIcon} />
            <Icon source="close-circle" size={24} color="#ff7b09" />
          </>
        );
      } else if (showAnswer) {
        return (
          <>
            <View style={styles.fillIcon} />
            <Icon source="check-circle" size={24} color="#9E9E9E" />
          </>
        );
      }
    }
    return null;
  };

  const resetStates = () => {
    setSelectedValue("");
    setShowAnswer(false);
    setIsWrong(false);
    setShowFeedback(false);
  };

  const handleTryAgain = () => {
    resetStates();
  };

  const handleRevealAnswer = () => {
    setSelectedValue(correctAnswer);
    setShowAnswer(true);
    setIsWrong(false);
    setShowFeedback(true);
  };

  return (
    <AssessmentWrapper
      question={question}
      onTryAgain={handleTryAgain}
      onRevealAnswer={handleRevealAnswer}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
    >
      <RadioButton.Group
        onValueChange={handleChoiceSelection}
        value={selectedValue}
      >
        {options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <RadioButton.Item
              label={option}
              value={option}
              disabled={blocked}
              style={getOptionStyles(option)}
              uncheckedColor="#a197f9"
              color="#a197f9"
            />
            <View style={styles.iconContainer}>{renderIcon(option)}</View>
          </View>
        ))}
      </RadioButton.Group>

      {isWrong && !showAnswer && (
        <Button
          mode="text"
          onPress={handleRevealAnswer}
          style={styles.seeAnswerButton}
        >
          See Answer
        </Button>
      )}
    </AssessmentWrapper>
  );
}

const styles = StyleSheet.create({
  optionContainer: {
    flex: 1,
    marginVertical: 4,
    borderRadius: 4,
  },
  fillIcon: {
    position: "absolute",
    backgroundColor: "white",
    width: 15,
    height: 15,
    top: 4,
    right: 4,
    borderRadius: 50,
  },
  iconContainer: {
    position: "absolute",
    right: -10,
    top: -10,
  },
  option: {
    flexDirection: "row-reverse",
    gap: 16,
    borderRadius: 4,
    flex: 1,
  },
  selectedOption: {
    borderWidth: 1,
    borderColor: "#a197f9",
  },
  correctOption: {
    borderWidth: 1,
    borderColor: "#23b5ec",
    backgroundColor: "rgba(35, 181, 236, 0.1)",
  },
  incorrectOption: {
    borderWidth: 1,
    borderColor: "#ff7b09",
    backgroundColor: "rgba(255, 123, 9, 0.1)",
  },
  revealedOption: {
    borderWidth: 1,
    borderColor: "#9E9E9E",
    backgroundColor: "rgba(158, 158, 158, 0.1)",
  },
  seeAnswerButton: {
    marginTop: 16,
  },
});
