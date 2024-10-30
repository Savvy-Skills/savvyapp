import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { useModuleStore } from "@/store/moduleStore";
import { AssessmentProps } from "./SingleChoice";

type blankArray = {
  original: string;
  filled: string;
};

export default function FillBlankAssessment({
  question,
  index,
}: AssessmentProps) {
  const [blanks, setBlanks] = useState<blankArray[]>([]);
  const [remainingOptions, setRemainingOptions] = useState<string[]>([]);
  const {
    setSubmittableState,
    correctnessStates,
    setCorrectnessState,
    submittedAssessments,
  } = useModuleStore();

  const text = useMemo(() => question.text, [question.text]);
  const options = useMemo(
    () => question.options.map((option) => option.text),
    [question.options]
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
    const isSubmittable = blanks.every((blank) => blank.filled !== "");
    if (isSubmittable) {
      setSubmittableState(index, isSubmittable);
      const correct = blanks.every(
        (blank) => blank.original.toLowerCase() === blank.filled.toLowerCase()
      );
      setCorrectnessState(index, correct);
      console.log("Slide is submittable", blanks);
    } else {
      setSubmittableState(index, false);
      setCorrectnessState(index, false);
    }
  }, [blanks, setCorrectnessState, setSubmittableState]);

  useEffect(() => {
    const blanksArray = extractedBlanks.map((blank) => ({
      original: blank,
      filled: "",
    }));
    setBlanks(blanksArray);
    setRemainingOptions([...options, ...blankOptions]);
  }, [extractedBlanks, options, blankOptions]);

  const handleOptionPress = (option: string) => {
    const newBlanks = [...blanks];
    const blankIndex = newBlanks.findIndex((blank) => blank.filled === "");
    if (blankIndex !== -1) {
      newBlanks[blankIndex].filled = option;
      setBlanks(newBlanks);
      setRemainingOptions(remainingOptions.filter((opt) => opt !== option));
    }
  };

  const handleBlankPress = (index: number) => {
    const newBlanks = [...blanks];
    if (newBlanks[index].filled) {
      setRemainingOptions([...remainingOptions, newBlanks[index].filled]);
      newBlanks[index].filled = "";
      setBlanks(newBlanks);
    }
  };

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.question_id === question.id
  );
  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined;
  const blocked = currentSubmission ? currentSubmission.correct : false;

  const renderText = () => {
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
          style={styles.blankButton}
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
  };

  return (
    <AssessmentWrapper question={question}>
      <View style={styles.textContainer}>{renderText()}</View>
      <View style={styles.optionsContainer}>
        {remainingOptions.map((option, index) => (
          <Button
            key={index}
            mode="contained"
            onPress={() => handleOptionPress(option)}
            disabled={blocked}
            style={styles.optionButton}
          >
            {option}
          </Button>
        ))}
      </View>
    </AssessmentWrapper>
  );
}

const styles = StyleSheet.create({
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
