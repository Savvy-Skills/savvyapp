import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { QuestionInfo } from "@/types";

type blankArray = {
  original: string;
  filled: string;
};

export default function FillBlankAssessment({
  question,
}: {
  question: QuestionInfo;
}) {
  const [blanks, setBlanks] = useState<blankArray[]>([]);
  const [remainingOptions, setRemainingOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const text = useMemo(() => question.text, [question.text]);
  const options = useMemo(() => question.options.map((option) => option.text), [question.options]);

  const extractedBlanks = useMemo(() => text.match(/\[.*?\]/g) || [], [text]);
  const blankOptions = useMemo(() => extractedBlanks.map((blank) => blank.replace(/\[|\]/g, "")), [extractedBlanks]);

  useEffect(() => {
    const blanksArray = extractedBlanks.map((blank) => ({
      original: blank,
      filled: "",
    }));
    setBlanks(blanksArray);
    setRemainingOptions([...options, ...blankOptions]);
  }, [extractedBlanks, options, blankOptions]);

  const handleOptionPress = (option: string) => {
    if (isCorrect) return;

    const newBlanks = [...blanks];
    const blankIndex = newBlanks.findIndex((blank) => blank.filled === "");
    if (blankIndex !== -1) {
      newBlanks[blankIndex].filled = option;
      setBlanks(newBlanks);
      setRemainingOptions(remainingOptions.filter((opt) => opt !== option));
    }
  };

  const handleBlankPress = (index: number) => {
    if (isCorrect) return;

    const newBlanks = [...blanks];
    if (newBlanks[index].filled) {
      setRemainingOptions([...remainingOptions, newBlanks[index].filled]);
      newBlanks[index].filled = "";
      setBlanks(newBlanks);
    }
  };

  const handleSubmit = () => {
    const correct = blanks.every(
      (blank) => blank.filled === blank.original.replace(/\[|\]/g, "")
    );
    setIsCorrect(correct);
    return correct;
  };

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
          disabled={isCorrect}
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
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
      <View style={styles.textContainer}>{renderText()}</View>
      <View style={styles.optionsContainer}>
        {remainingOptions.map((option, index) => (
          <Button
            key={index}
            mode="contained"
            onPress={() => handleOptionPress(option)}
            disabled={isCorrect}
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