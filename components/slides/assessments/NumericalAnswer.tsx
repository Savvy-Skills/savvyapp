import React, { useEffect, useState } from "react";
import AssessmentWrapper from "../AssessmentWrapper";
import { TextInput } from "react-native-paper";
import { QuestionInfo } from "@/types";
import { useModuleStore } from "@/store/moduleStore";
import { AssessmentProps } from "./SingleChoice";



export default function NumericalAnswerAssessment({
  question,
  index,
}: AssessmentProps) {
  const [value, setValue] = useState("");
  const answer = parseFloat(question.options[0].text);
  const { setSubmittableState, correctnessStates, setCorrectnessState, submittedAssessments } = useModuleStore();

  const handleChange = (event: any) => {
    const { text } = event.nativeEvent;
    setValue(text.replace(/[^0-9.]/g, ""));
  };

  useEffect(() => {
    const isSubmittable = value.trim() !== "";
    setSubmittableState(index, isSubmittable);
    let correct: boolean;
    if (Array.isArray(answer)) {
      correct = answer.includes(parseFloat(value));
    } else {
      correct = Math.abs(parseFloat(value)) === answer;
    }
	setCorrectnessState(index, correct);
  }, [value, index, setSubmittableState]);

  const handleSubmit = () => {
    return correctnessStates[index] || false;
  };

  const currentSubmissionIndex = submittedAssessments.findIndex(
	(submission) => submission.question_id === question.id
  );

  const currentSubmission = currentSubmissionIndex !== -1 ? submittedAssessments[currentSubmissionIndex] : undefined;

  const blocked = currentSubmission ? currentSubmission.correct : false;


  return (
    <AssessmentWrapper question={question}>
      <TextInput value={value} onChange={handleChange} disabled={blocked} />
    </AssessmentWrapper>
  );
}
