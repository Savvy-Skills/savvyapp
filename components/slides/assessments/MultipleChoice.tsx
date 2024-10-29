import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Checkbox } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { QuestionInfo } from "@/types";
import { includes } from "@/utils/utilfunctions";
import { useModuleStore } from "@/store/moduleStore";

export default function MultipleChoice({
  question,
  index,
}: {
  question: QuestionInfo;
  index: number;
}) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const {
    setSubmittableState,
    correctnessStates,
    setCorrectnessState,
    submittedAssessments,
  } = useModuleStore();

  const correctAnswers = question.options
    .filter((option) => option.isCorrect)
    .map((option) => option.text);
  const options = question.options.map((option) => option.text);

  const handleChange = (value: string) => {
    const newSelectedValues = includes(selectedValues, value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    setSelectedValues(newSelectedValues);
  };

  useEffect(() => {
    if (selectedValues.length !== 0) {
      setSubmittableState(index, true);
      let correct: boolean =
        selectedValues.length === correctAnswers.length &&
        selectedValues.every((val) => correctAnswers.includes(val));
      setCorrectnessState(index, correct);
    } else {
      setSubmittableState(index, false);
      setCorrectnessState(index, false);
    }
  }, [selectedValues, index, setSubmittableState]);

  const handleSubmit = () => {
    return correctnessStates[index] || false;
  };

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.question_id === question.id
  );

  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined;

  const blocked = currentSubmission ? currentSubmission.correct : false;

  return (
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
      {options.map((option, index) => (
        <Checkbox.Item
          key={index}
          label={option}
          status={selectedValues.includes(option) ? "checked" : "unchecked"}
          onPress={() => handleChange(option)}
          disabled={blocked}
        />
      ))}
    </AssessmentWrapper>
  );
}
