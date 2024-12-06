import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { List, IconButton } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { useCourseStore } from "@/store/courseStore";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";

export default function ReorderAssessment({
  question,
  index,
  quizMode = false,
}: AssessmentProps) {
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
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

  const correctOrder = useMemo(
    () =>
      question.options
        .sort((a, b) => a.correctOrder - b.correctOrder)
        .map((option) => option.text),
    [question]
  );

  useEffect(() => {
    const items = question.options
      .map((option) => option.text)
      .sort(() => Math.random() - 0.5);
    setCurrentOrder(items);
    setSubmittableState(index, true);
  }, [question, index, setSubmittableState]);

  useEffect(() => {
    const correct =
      JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
    setCorrectnessState(index, correct);
  }, [currentOrder, correctOrder, index, setCorrectnessState]);

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.assessment_id === question.id
  );

  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined;

  useEffect(() => {
    if (currentSubmission) {
      if (!currentSubmission.isCorrect) {
        setIsWrong(true);
        if (quizMode) {
          setShowAnswer(true);
        }
      }
      if (quizMode && !completedSlides[index]) {
        checkSlideCompletion();
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
    currentSubmission?.isCorrect || showAnswer || (quizMode && isWrong);

  const moveItem = useCallback(
    (itemIndex: number, direction: string) => {
      if (blocked) return;

      const newOrder = [...currentOrder];
      const item = newOrder[itemIndex];
      const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
      newOrder.splice(itemIndex, 1);
      newOrder.splice(newIndex, 0, item);
      setCurrentOrder(newOrder);
      setSubmittableState(index, true, "Reorder component");
      setIsWrong(false);
      setShowAnswer(false);
      setShowFeedback(false);
    },
    [
      blocked,
      currentOrder,
      setCurrentOrder,
      setIsWrong,
      setShowAnswer,
      setShowFeedback,
      setSubmittableState,
    ]
  );

  const resetStates = useCallback(() => {
    const items = question.options
      .map((option) => option.text)
      .sort(() => Math.random() - 0.5);
    setCurrentOrder(items);
    setShowAnswer(false);
    setIsWrong(false);
    setShowFeedback(false);
  }, [
    question.options,
    setCurrentOrder,
    setShowAnswer,
    setIsWrong,
    setShowFeedback,
  ]);

  const handleTryAgain = useCallback(() => {
    if (!quizMode) {
      resetStates();
    }
  }, [quizMode, resetStates]);

  const handleRevealAnswer = useCallback(() => {
    if (!quizMode) {
      setCurrentOrder(correctOrder);
      setShowAnswer(true);
      setIsWrong(false);
      setShowFeedback(true);
      setCorrectnessState(index, true);
      submitAssessment(question.id);
    }
  }, [
    quizMode,
    correctOrder,
    setCurrentOrder,
    setShowAnswer,
    setIsWrong,
    setShowFeedback,
    setCorrectnessState,
    index,
    question.id,
    submitAssessment,
  ]);

  const renderStatusIcon = (item: string, itemIndex: number) => {
    if (quizMode && isWrong) {
      if (correctOrder[itemIndex] === item) {
        return (
          <StatusIcon isCorrect={true} isWrong={false} showAnswer={false} />
        );
      }
      return <StatusIcon isCorrect={false} isWrong={true} showAnswer={false} />;
    }

    if (showAnswer || currentSubmission?.isCorrect) {
      return (
        <StatusIcon
          isCorrect={correctOrder[itemIndex] === item}
          isWrong={false}
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
      <List.Section>
        {currentOrder.map((item, index) => (
          <View key={index} style={styles.optionContainer}>
            <List.Item
              title={item}
              left={() => (
                <View style={localStyles.buttonContainer}>
                  <IconButton
                    icon="arrow-up"
                    onPress={() => moveItem(index, "up")}
                    disabled={index === 0 || blocked}
                  />
                  <IconButton
                    icon="arrow-down"
                    onPress={() => moveItem(index, "down")}
                    disabled={index === currentOrder.length - 1 || blocked}
                  />
                </View>
              )}
              style={[
                styles.option,
                showAnswer &&
                  correctOrder[index] === item &&
                  styles.correctOption,
                quizMode &&
                  isWrong &&
                  correctOrder[index] === item &&
                  styles.correctOption,
                quizMode &&
                  isWrong &&
                  correctOrder[index] !== item &&
                  styles.incorrectOption,
                blocked && styles.disabledOption,
              ]}
            />
            <View style={[styles.iconContainer, { top: quizMode ? -10 : 20 }]}>
              {renderStatusIcon(item, index)}
            </View>
          </View>
        ))}
      </List.Section>
    </AssessmentWrapper>
  );
}

const localStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
