import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Checkbox } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { QuestionInfo } from "@/types";
import { useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";
import CustomCheckbox from "@/components/SavvyCheckbox";
import { sub } from "@tensorflow/tfjs";

export type AssessmentProps = {
  question: QuestionInfo;
  index: number;
  quizMode: boolean;
};

export default function MultipleChoice({
  question,
  index,
  quizMode = false,
}: AssessmentProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
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

  const options = useMemo(
    () => question.options.map((option) => option.text),
    [question]
  );

  const correctAnswers = useMemo(
    () =>
      question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.text),
    [question]
  );

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.question_id === question.id
  );

  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined;

  useEffect(() => {
    if (selectedValues.length > 0) {
      let correct =
        selectedValues.length === correctAnswers.length &&
        selectedValues.every((val) => correctAnswers.includes(val));
      setCorrectnessState(index, correct);
    } else {
      setCorrectnessState(index, false);
    }
  }, [selectedValues, correctAnswers, setCorrectnessState]);

  useEffect(() => {
    if (currentSubmission) {
      if (quizMode) {
        if (!currentSubmission.correct) {
          setIsWrong(true);
        }
        if (!completedSlides[index]) {
          checkSlideCompletion();
        }
      }
      setShowFeedback(true);
    }
  }, [
    submittedAssessments,
    currentSubmission,
    quizMode,
    completedSlides,
    index,
    checkSlideCompletion,
  ]);

  const blocked =
    currentSubmission?.correct || showAnswer || (quizMode && isWrong);

  const getOptionStyles = (option: string) => {
    const baseStyles =
      question.subtype === "Image"
        ? [localStyles.imageOption]
        : [styles.option];

    if (showAnswer && correctAnswers.includes(option)) {
      if (!quizMode) {
        return [...baseStyles, styles.revealedOption];
      }
    }

    if (quizMode && isWrong) {
      if (correctAnswers.includes(option)) {
        return [...baseStyles, styles.correctOption];
      }
      if (selectedValues.includes(option)) {
        return [...baseStyles, styles.incorrectOption];
      }
      return [...baseStyles, styles.disabledOption];
    }

    if (selectedValues.includes(option)) {
      if (currentSubmission?.correct) {
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

  const handleChoiceSelection = (value: string) => {
    if (quizMode && (isWrong || currentSubmission?.correct)) {
      return;
    }
    setSelectedValues((prevSelectedValues) => {
      const newSelectedValues = prevSelectedValues.includes(value)
        ? prevSelectedValues.filter((item) => item !== value)
        : [...prevSelectedValues, value];
      setIsWrong(false);
      setShowAnswer(false);
      setShowFeedback(false);
      if (newSelectedValues.length === 0) {
        setSubmittableState(index, false);
      } else {
        setSubmittableState(index, true);
      }
      return newSelectedValues;
    });
  };

  const resetStates = () => {
    setSelectedValues([]);
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
      setSelectedValues(correctAnswers);
      setShowAnswer(true);
      setIsWrong(false);
      setShowFeedback(true);
      setCorrectnessState(index, true);
      submitAssessment(question.id);
    }
  };

  const renderStatusIcon = (option: string) => {
    if (quizMode && isWrong) {
      if (correctAnswers.includes(option)) {
        return (
          <StatusIcon isCorrect={true} isWrong={false} showAnswer={false} />
        );
      }
      if (selectedValues.includes(option)) {
        return (
          <StatusIcon isCorrect={false} isWrong={true} showAnswer={false} />
        );
      }
      return null;
    }

    if (selectedValues.includes(option)) {
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

  const renderImageOption = (option: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={localStyles.imageContainer}
      onPress={() => handleChoiceSelection(option)}
      disabled={blocked}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selectedValues.includes(option) }}
    >
      <View style={getOptionStyles(option)}>
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
      <CustomCheckbox
        label={option}
        status={selectedValues.includes(option) ? "checked" : "unchecked"}
        onPress={() => handleChoiceSelection(option)}
        disabled={blocked && !correctAnswers.includes(option)}
        style={getOptionStyles(option)}
        disabledTouchable={blocked}
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
    >
      {question.subtype === "Image" ? (
        <View style={localStyles.imageGrid}>
          {options.map((option, index) => renderImageOption(option, index))}
        </View>
      ) : (
        <View style={localStyles.options}>
          {options.map((option, index) => renderTextOption(option, index))}
        </View>
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
  options: {
	gap:4
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
