import React, { useState } from "react";
import { View } from "react-native";
import { Checkbox } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { QuestionInfo } from "@/types";
import { includes } from "@/utils/utilfunctions";


export default function MultipleChoice({
  question,
}: {
  question: QuestionInfo;
}) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const correctAnswers = question.options
    .filter((option) => option.isCorrect)
    .map((option) => option.text);
  const options = question.options.map((option) => option.text);

  const handleChange = (value: string) => {
    if (!isCorrect) {
      const newSelectedValues = includes(selectedValues, value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelectedValues);
    }
  };


  const handleSubmit = () => {
    const correct =
      selectedValues.length === correctAnswers.length &&
      selectedValues.every((val) => correctAnswers.includes(val));
    setIsCorrect(correct);
    return correct;
  };

  return (
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
      {options.map((option, index) => (
        <Checkbox.Item
          key={index}
          label={option}
          status={selectedValues.includes(option) ? "checked" : "unchecked"}
          onPress={() => handleChange(option)}
          disabled={isCorrect}
        />
      ))}
    </AssessmentWrapper>
  );
}
