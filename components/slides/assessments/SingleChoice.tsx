import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { RadioButton, Text } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { Answer, QuestionInfo } from "@/types";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";
import CustomRadioButton from "@/components/SavvyRadioButton";

export type AssessmentProps = {
  question: QuestionInfo;
  index: number;
  quizMode: boolean;
};

const getOptionStyles = (
  option: string,
  question: QuestionInfo,
  showAnswer: boolean,
  quizMode: boolean,
  isWrong: boolean,
  selectedValue: string,
  isCorrect: boolean
) => {
  const correctAnswer =
    question.options.find((option) => option.isCorrect)?.text || "";

  const baseStyles =
    question.subtype === "Image" ? [localStyles.imageOption] : [styles.option];

  if (showAnswer && option === correctAnswer) {
    if (!quizMode) {
      return [...baseStyles, styles.revealedOption];
    }
  }

  if (quizMode && isWrong) {
    if (option === correctAnswer) {
      return [...baseStyles, styles.correctOption];
    }
    if (option === selectedValue) {
      return [...baseStyles, styles.incorrectOption];
    }
    return [...baseStyles, styles.disabledOption];
  }

  if (option === selectedValue) {
    if (isCorrect) {
      return [...baseStyles, styles.correctOption];
    } else if (isWrong) {
      return [...baseStyles, styles.incorrectOption];
    } else if (showAnswer) {
      return [...baseStyles, styles.revealedOption];
    }
    if (question.subtype === "Image") {
      return [...baseStyles, localStyles.selectedImage];
    }
    return [...baseStyles, styles.selectedOption];
  }
  return baseStyles;
};

function createAnswer(
  selectedValues: string[],
  showAnswer: boolean
): AssessmentAnswer {
  return {
    answer: [
      {
        text: selectedValues[0],
      },
    ],
    revealed: showAnswer,
  };
}

export default function SingleChoice({
  question,
  index,
  quizMode = false,
}: AssessmentProps) {
  const [selectedValue, setSelectedValue] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    setSubmittableState,
    setCorrectnessState,
    submittedAssessments,
    submitAssessment,
    currentSlideIndex,
    setAnswer,
  } = useCourseStore();

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.assessment_id === question.id
  );

  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined;

  const [showAnswer, setShowAnswer] = useState(
    currentSubmission ? currentSubmission.revealed : false
  );

  const options = question.options.map((option) => option.text);
  const correctAnswer =
    question.options.find((option) => option.isCorrect)?.text || "";

  const isActive = index === currentSlideIndex;

  useEffect(() => {
    if (selectedValue) {
      setSubmittableState(index, true);
      let correct: boolean = selectedValue === correctAnswer;
      setCorrectnessState(index, correct);
      const answer = createAnswer([selectedValue], false);
      setAnswer(index, answer);
    }
  }, [
    selectedValue,
    index,
    setSubmittableState,
    correctAnswer,
    setCorrectnessState,
  ]);

  useEffect(() => {
    if (currentSubmission) {
		console.log("Sigle choice")
      if (!currentSubmission.isCorrect) {
        setIsWrong(true);
        if (quizMode) {
          setShowAnswer(true);
        }
      }
      setSelectedValue(currentSubmission.answer[0].text);
      setShowFeedback(true);
    }
  }, [currentSubmission, quizMode]);

  const blocked =
    currentSubmission?.isCorrect || showAnswer || (quizMode && isWrong);

  const isCorrect = currentSubmission ? currentSubmission.isCorrect : false;

  const handleChoiceSelection = (value: string) => {
    if (quizMode && (isWrong || currentSubmission?.isCorrect)) {
      return;
    }
    // Prevent reselection of the same option
    if (value !== selectedValue) {
      setSelectedValue(value);
      setIsWrong(false);
      setShowAnswer(false);
      setShowFeedback(false);
    }
  };

  const resetStates = () => {
    setSelectedValue("");
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
      const answer = createAnswer([correctAnswer], true);
      setAnswer(index, answer);
      submitAssessment(question.id);
    }
  };

  const renderStatusIcon = (option: string) => {
    if (quizMode && isWrong) {
      if (option === correctAnswer) {
        return (
          <StatusIcon isCorrect={true} isWrong={false} showAnswer={false} />
        );
      }
      if (option === selectedValue) {
        return (
          <StatusIcon isCorrect={false} isWrong={true} showAnswer={false} />
        );
      }
      return null;
    }

    if (option === selectedValue) {
      return (
        <StatusIcon
          isCorrect={currentSubmission?.isCorrect || false}
          isWrong={isWrong}
          showAnswer={showAnswer}
        />
      );
    }
    return null;
  };

  const renderImageOption = (option: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={localStyles.imageContainer}
      onPress={() => handleChoiceSelection(option)}
      disabled={blocked}
      accessibilityRole="radio"
      accessibilityState={{ checked: selectedValue === option }}
    >
      <View
        style={getOptionStyles(
          option,
          question,
          showAnswer,
          quizMode,
          isWrong,
          selectedValue,
          isCorrect
        )}
      >
        <Image
          source={{ uri: option }}
          style={localStyles.image}
          resizeMode="contain"
        />
        <View style={localStyles.imageIconContainer}>
          {renderStatusIcon(option)}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTextOption = (option: string, index: number) => (
    <View key={index} style={styles.optionContainer}>
      <CustomRadioButton
        label={option}
        value={option}
        status={selectedValue === option ? "checked" : "unchecked"}
        onPress={() => handleChoiceSelection(option)}
        disabled={blocked && option !== correctAnswer}
        style={getOptionStyles(
          option,
          question,
          showAnswer,
          quizMode,
          isWrong,
          selectedValue,
          isCorrect
        )}
        disabledTouchable={selectedValue === option || blocked}
      />
      <View style={styles.iconContainer}>{renderStatusIcon(option)}</View>
    </View>
  );

  return (
    <AssessmentWrapper
      question={question}
      onTryAgain={quizMode ? undefined : handleTryAgain}
      onRevealAnswer={quizMode ? undefined : handleRevealAnswer}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
      quizMode={quizMode}
      isActive={isActive}
      isCorrect={currentSubmission ? currentSubmission.isCorrect : false}
      answerRevealed={showAnswer}
    >
      {question.subtype === "Image" ? (
        <View style={localStyles.imageGrid}>
          {options.map((option, index) => renderImageOption(option, index))}
        </View>
      ) : (
        <RadioButton.Group
          onValueChange={handleChoiceSelection}
          value={selectedValue}
        >
          {options.map((option, index) => renderTextOption(option, index))}
        </RadioButton.Group>
      )}
    </AssessmentWrapper>
  );
}

const localStyles = StyleSheet.create({
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  imageContainer: {
    width: "45%",
    aspectRatio: 1,
  },
  imageOption: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#cccccc",
    overflow: "hidden",
    position: "relative",
    padding: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  selectedImage: {
    borderWidth: 3,
    backgroundColor: "rgba(108, 92, 231, 0.1)",
    borderColor: "#a197f9",
  },
  imageIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
});
