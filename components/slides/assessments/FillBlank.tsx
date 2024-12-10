import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/StatusIcon";
import styles from "@/styles/styles";

type BlankItem = {
  original: string;
  filled: string;
};

function createAnswer(
  selectedValues: string[],
  showAnswer: boolean
): AssessmentAnswer {
  return {
    answer: selectedValues.map((value, i) => ({
      text: value,
      order: i + 1,
    })),

    revealed: showAnswer,
  };
}

export default function FillBlankAssessment({
  question,
  index,
  quizMode = false,
}: AssessmentProps) {
  const [blanks, setBlanks] = useState<BlankItem[]>([]);
  const [remainingOptions, setRemainingOptions] = useState<string[]>([]);
  const [isWrong, setIsWrong] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    setSubmittableState,
    setCorrectnessState,
    submittedAssessments,
    submitAssessment,
    completedSlides,
    checkSlideCompletion,
    submittableStates,
    currentSlideIndex,
    setAnswer,
  } = useCourseStore();

  const text = useMemo(() => question.text, [question.text]);
  const options = useMemo(
    () => question.options.map((option) => option.text),
    [question.options]
  );

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.assessment_id === question.id
  );
  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined;

  const [showAnswer, setShowAnswer] = useState(
    currentSubmission?.revealed ?? false
  );

  const extractedBlanks = useMemo(() => {
    const matches = text.match(/\[.*?\]/g) || [];
    return matches.map((match) => match.replace(/[\[\]]/g, ""));
  }, [text]);

  const blankOptions = useMemo(
    () => extractedBlanks.map((blank) => blank.replace(/\[|\]/g, "")),
    [extractedBlanks]
  );

  useEffect(() => {
    const blanksArray = extractedBlanks.map((blank) => ({
      original: blank,
      filled: "",
    }));
    setBlanks(blanksArray);
    setRemainingOptions([...options, ...blankOptions]);
  }, [extractedBlanks, options, blankOptions]);

  const checkCorrectness = useCallback(() => {
    return blanks.every(
      (blank) => blank.original.toLowerCase() === blank.filled.toLowerCase()
    );
  }, [blanks]);

  useEffect(() => {
    const correct = checkCorrectness();
    const answer = createAnswer(
      blanks.map((blank) => blank.filled),
      false
    );
    setAnswer(index, answer);
    setCorrectnessState(index, correct);
  }, [
    blanks,
    setCorrectnessState,
    setSubmittableState,
    index,
    checkCorrectness,
  ]);

  useEffect(() => {
    if (currentSubmission) {
      if (!currentSubmission.isCorrect) {
        setIsWrong(true);
        if (quizMode) {
          setShowAnswer(true);
        }
      }
      // Transform answer to correct format of blanks and remaining options
      // From answer get the current filled blanks
      // Get the remaining options from question and the extracted blanks

      const filledBlanks = currentSubmission.answer.map(
        (answer) => answer.text
      );

      const questionOptions = question.options.map((option) => option.text);
      const extractedOptions = extractedBlanks.map((blank) => blank);

      //   Combine question options and extracted options
      const remainingOptions = questionOptions.concat(extractedOptions);

      //   Fill the blanks with the filled blanks, remaining options with the options
      const newBlanks = extractedBlanks.map((blank, index) => ({
        original: blank,
        filled: filledBlanks[index],
      }));
      setBlanks(newBlanks);
      setRemainingOptions(remainingOptions.filter((opt) => !filledBlanks.includes(opt)));

      setShowFeedback(true);
    }
  }, [
    extractedBlanks,
    submittedAssessments,
    currentSubmission,
    quizMode,
    completedSlides,
    index,
    checkSlideCompletion,
  ]);

  const isActive = index === currentSlideIndex;

  const blocked =
    currentSubmission?.isCorrect || showAnswer || (quizMode && isWrong);

  const handleOptionPress = useCallback(
    (option: string) => {
      if (blocked) return;

      setBlanks((prevBlanks) => {
        const newBlanks = [...prevBlanks];
        const blankIndex = newBlanks.findIndex((blank) => blank.filled === "");

        if (blankIndex !== -1) {
          // If there is an empty blank, fill it with the option
          newBlanks[blankIndex].filled = option;
        } else {
          // If all blanks are filled, pop the last blank and fill it with the new option
          const lastBlank = newBlanks.pop();
          if (lastBlank) {
            newBlanks.push({ ...lastBlank, filled: option });
            setRemainingOptions((prevOptions) => [
              ...prevOptions,
              lastBlank.filled,
            ]);
          }
        }
        const isSubmittable = newBlanks.every((blank) => blank.filled !== "");
        if (submittableStates[index] !== isSubmittable) {
          setSubmittableState(index, isSubmittable);
        }

        return newBlanks;
      });

      setRemainingOptions((prevOptions) =>
        prevOptions.filter((opt) => opt !== option)
      );
      setIsWrong(false);
      setShowAnswer(false);
      setShowFeedback(false);
    },
    [
      blocked,
      setBlanks,
      setRemainingOptions,
      setIsWrong,
      setShowAnswer,
      setShowFeedback,
      setSubmittableState,
      submittableStates,
    ]
  );

  const handleBlankPress = useCallback(
    (blankIndex: number) => {
      if (blocked) return;
      if (blanks[blankIndex].filled === "") return;
      setBlanks((prevBlanks) => {
        const newBlanks = [...prevBlanks];
        if (newBlanks[blankIndex].filled) {
          setRemainingOptions((prevOptions) => [
            ...prevOptions,
            newBlanks[blankIndex].filled,
          ]);
          newBlanks[blankIndex].filled = "";
        }
        return newBlanks;
      });
      setSubmittableState(index, false);
      setIsWrong(false);
      setShowAnswer(false);
      setShowFeedback(false);
    },
    [
      blocked,
      setBlanks,
      setRemainingOptions,
      setIsWrong,
      setShowAnswer,
      setShowFeedback,
      blanks,
      setSubmittableState,
    ]
  );

  const resetStates = useCallback(() => {
    setBlanks((prevBlanks) =>
      prevBlanks.map((blank) => ({ ...blank, filled: "" }))
    );
    setRemainingOptions([...options, ...blankOptions]);
    setShowAnswer(false);
    setIsWrong(false);
    setShowFeedback(false);
  }, [options, blankOptions]);

  const handleTryAgain = useCallback(() => {
    if (!quizMode) {
      resetStates();
    }
  }, [quizMode, resetStates]);

  const handleRevealAnswer = useCallback(() => {
    if (!quizMode) {
      setBlanks((prevBlanks) =>
        prevBlanks.map((blank) => ({ ...blank, filled: blank.original }))
      );
      setRemainingOptions([]);
      setShowAnswer(true);
      setIsWrong(false);
      setShowFeedback(true);
      setCorrectnessState(index, true);
      const answer = createAnswer(extractedBlanks, true);
      setAnswer(index, answer);
      submitAssessment(question.id);
    }
  }, [quizMode, index, setCorrectnessState, submitAssessment, question.id]);

  const renderText = useMemo(() => {
    let result = [];
    let textParts = text.split(/\[.*?\]/);
    blanks.forEach((blank, index) => {
      result.push(<Text key={`text-${index}`}>{textParts[index]}</Text>);
      result.push(
        <Button
          key={`blank-${index}`}
          mode="outlined"
          onPress={() => handleBlankPress(index)}
          disabled={blocked}
          style={[
            localStyles.blankButton,
            showAnswer && styles.revealedOption,
            quizMode &&
              isWrong &&
              blank.original.toLowerCase() === blank.filled.toLowerCase() &&
              styles.correctOption,
            quizMode &&
              isWrong &&
              blank.original.toLowerCase() !== blank.filled.toLowerCase() &&
              styles.incorrectOption,
            blocked && styles.disabledOption,
          ]}
        >
          {blank.filled || "______"}
        </Button>
      );
    });
    result.push(
      <Text key={`text-${textParts.length - 1}`}>
        {textParts[textParts.length - 1]}
      </Text>
    );
    return result;
  }, [text, blanks, handleBlankPress, blocked, showAnswer, quizMode, isWrong]);

  const renderStatusIcon = useCallback(
    (blank: BlankItem) => {
      if (quizMode && isWrong) {
        return (
          <StatusIcon
            isCorrect={
              blank.original.toLowerCase() === blank.filled.toLowerCase()
            }
            isWrong={
              blank.original.toLowerCase() !== blank.filled.toLowerCase()
            }
            showAnswer={false}
          />
        );
      }

      if (showAnswer || currentSubmission?.isCorrect) {
        return (
          <StatusIcon
            isCorrect={
              blank.original.toLowerCase() === blank.filled.toLowerCase()
            }
            isWrong={false}
            showAnswer={showAnswer}
          />
        );
      }

      return null;
    },
    [quizMode, isWrong, showAnswer, currentSubmission]
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
      <View style={localStyles.textContainer}>{renderText}</View>
      <View style={localStyles.optionsContainer}>
        {remainingOptions.map((option, index) => (
          <Button
            key={index}
            mode="contained"
            onPress={() => handleOptionPress(option)}
            disabled={blocked}
            style={[localStyles.optionButton, blocked && styles.disabledOption]}
          >
            {option}
          </Button>
        ))}
      </View>
      {blanks.map((blank, index) => (
        <View key={index} style={styles.iconContainer}>
          {renderStatusIcon(blank)}
        </View>
      ))}
    </AssessmentWrapper>
  );
}

const localStyles = StyleSheet.create({
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 16,
  },
  blankButton: {
    minWidth: 100,
    marginHorizontal: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  optionButton: {
    margin: 4,
  },
});
