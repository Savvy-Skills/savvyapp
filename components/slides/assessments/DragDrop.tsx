import React, { useState, useCallback, useRef, useEffect } from "react";
import { QuestionInfo } from "@/types";
import { useCourseStore } from "@/store/courseStore";
import AssessmentWrapper from "../AssessmentWrapper";
import DragAndDrop from "@/components/DragAndDrop";

export type DragAndDropAssessmentProps = {
  question: QuestionInfo;
  index: number;
  quizMode?: boolean;
};

export default function DragAndDropAssessment({
  question,
  index,
  quizMode = false,
}: DragAndDropAssessmentProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const tryAgain = useRef(false);

  const { setCorrectnessState, submitAssessment, submittedAssessments } =
    useCourseStore();

  const items = question.options.map((option) => ({
    text: option.text,
    match: option.match,
  }));

  const currentSubmission = submittedAssessments.find(
    (submission) => submission.question_id === question.id
  );

  useEffect(() => {
    if (currentSubmission) {
      setIsSubmitted(true);
      if (!currentSubmission.correct) {
        setIsWrong(true);
        if (quizMode) {
          setShowAnswer(true);
        }
      }
      setShowFeedback(true);
    }
  }, [currentSubmission, quizMode, setShowFeedback, submittedAssessments]);

  const handleTryAgain = useCallback(() => {
    if (!quizMode) {
      setIsSubmitted(false);
      setShowAnswer(false);
      setIsWrong(false);
      setShowFeedback(false);
      tryAgain.current = !tryAgain.current;
    }
  }, [quizMode]);

  const handleRevealAnswer = useCallback(() => {
    if (!quizMode) {
      setShowAnswer(true);
      setIsWrong(false);
      setShowFeedback(true);
      setCorrectnessState(index, true);
      submitAssessment(question.id);
    }
  }, [quizMode, index, setCorrectnessState, submitAssessment, question.id]);

  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>(() => {
    const zones = [...new Set(items.map(item => item.match))]
    return zones.reduce((acc, zone) => ({ ...acc, [zone]: [] }), {})
  })

  return (
    <AssessmentWrapper
      question={question}
      onTryAgain={handleTryAgain}
      onRevealAnswer={handleRevealAnswer}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
      quizMode={quizMode}
    >
      <DragAndDrop
        items={items}
        index={index}
        quizMode={quizMode}
        questionId={question.id}
        isSubmitted={isSubmitted}
        showAnswer={showAnswer}
        tryAgain={tryAgain.current}
        isCorrect={currentSubmission ? currentSubmission.correct : false}
      />
    </AssessmentWrapper>
  );
}
