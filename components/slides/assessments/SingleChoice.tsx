import React, { useEffect, useState } from "react";
import { RadioButton } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { QuestionInfo } from "@/types";
import { useModuleStore } from "@/store/moduleStore";

export type AssessmentProps = {
  question: QuestionInfo;
  index: number;
};

export default function SingleChoice({ question, index }: AssessmentProps) {
  const [selectedValue, setSelectedValue] = useState("");

  const {
    setSubmittableState,
    correctnessStates,
    setCorrectnessState,
    submittedAssessments,
  } = useModuleStore();

  const options = question.options.map((option) => option.text);
  const correctAnswer = question.options.find(
    (option) => option.isCorrect
  )?.text;

  useEffect(() => {
    if (selectedValue) {
      setSubmittableState(index, true);
      let correct: boolean = selectedValue === correctAnswer;
      setCorrectnessState(index, correct);
    }
  }, [selectedValue, index, setSubmittableState]);

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.question_id === question.id
  );

  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined;

  const blocked = currentSubmission ? currentSubmission.correct : false;

  return (
    <AssessmentWrapper question={question}>
      <RadioButton.Group
        onValueChange={(value) => setSelectedValue(value)}
        value={selectedValue}
      >
        {options.map((option, index) => (
          <RadioButton.Item
            key={index}
            label={option}
            value={option}
            disabled={blocked}
            style={{ flexDirection: "row-reverse", gap: 16 }}
          />
        ))}
      </RadioButton.Group>
    </AssessmentWrapper>
  );
}
