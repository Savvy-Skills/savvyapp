import React, { useState, useCallback, useRef, useEffect } from "react";
import { QuestionInfo } from "@/types";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import AssessmentWrapper from "../AssessmentWrapper";
import DragAndDrop from "@/components/react/DragAndDrop";
import { Platform, useWindowDimensions } from "react-native";

export type DragAndDropAssessmentProps = {
  question: QuestionInfo;
  index: number;
  quizMode?: boolean;
};

function createAnswer(
  droppedItems: Record<string, string[]>,
  showAnswer: boolean
): AssessmentAnswer {
  return {
    //  Answer should be a list of all the items, the zone they're in should be the match value
    answer: Object.entries(droppedItems)
      .map(([zone, items]) => {
        return items.map((item) => ({
          text: item,
          match: zone,
        }));
      })
      .flat(),
    revealed: showAnswer,
  };
}

export default function DragAndDropAssessment({
  question,
  index,
  quizMode = false,
}: DragAndDropAssessmentProps) {
  const [isWrong, setIsWrong] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const tryAgain = useRef(false);
  const { width } = useWindowDimensions();

  const {
    setCorrectnessState,
    submitAssessment,
    submittedAssessments,
    currentSlideIndex,
    setAnswer,
  } = useCourseStore();

  const isActive = index === currentSlideIndex;

  const items = question.options.map((option) => ({
    text: option.text,
    match: option.match,
  }));

  const currentSubmission = submittedAssessments.find(
    (submission) => submission.assessment_id === question.id
  );

  const [showAnswer, setShowAnswer] = useState(
    currentSubmission?.isCorrect ?? false
  );

  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>(
    () => {
      return (() => {
        const zones = [...new Set(items.map((item) => item.match))];
        return zones.reduce((acc, zone) => ({ ...acc, [zone]: [] }), {});
      })();
    }
  );

  //   Make correct zones, which should be a droppedItems object with all items in the correct zone
  const correctZones = items.reduce<Record<string, string[]>>((acc, item) => {
    return {
      ...acc,
      [item.match]: [...(acc[item.match] || []), item.text],
    };
  }, {});

  useEffect(() => {
    if (currentSubmission) {
      setIsSubmitted(true);
      if (!currentSubmission.isCorrect) {
        setIsWrong(true);
        if (quizMode) {
          setShowAnswer(true);
        }
      }
      //   Transform the dropped items to the correct format of [zone]: [items]
      const droppedItems = currentSubmission.answer.reduce<
        Record<string, string[]>
      >((acc, item) => {
        if (item.match && !acc[item.match]) {
          acc[item.match] = [];
        }
        if (item.match) {
          acc[item.match].push(item.text);
        }
        return acc;
      }, {});
      setDroppedItems(droppedItems);
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
      const correctDroppedItems = items.reduce((acc, item) => {
        if (!acc[item.match]) {
          acc[item.match] = [];
        }
        acc[item.match].push(item.text);
        return acc;
      }, {} as Record<string, string[]>);
      const answer = createAnswer(correctDroppedItems, true);
      setAnswer(index, answer);
      submitAssessment(question.id);
    }
  }, [quizMode, index, setCorrectnessState, submitAssessment, question.id]);

  const handleDrop = useCallback(
    (droppedItems: Record<string, string[]>) => {
      setDroppedItems(droppedItems);
      setShowFeedback(false);
      setIsWrong(false);
      setIsSubmitted(false);
    },
    [setShowFeedback, setIsWrong]
  );

  const isMobile = Platform.OS !== "web" || width < 768;

  return (
    <AssessmentWrapper
      question={question}
      onTryAgain={handleTryAgain}
      onRevealAnswer={handleRevealAnswer}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
      quizMode={quizMode}
      isActive={isActive}
      isCorrect={currentSubmission ? currentSubmission.isCorrect : false}
      answerRevealed={showAnswer}
    >
      <DragAndDrop
        items={items}
        index={index}
        quizMode={quizMode}
        questionId={question.id}
        isSubmitted={isSubmitted}
        showAnswer={showAnswer}
        tryAgain={tryAgain.current}
        isCorrect={currentSubmission ? currentSubmission.isCorrect : false}
        droppedItems={droppedItems}
        setDroppedItems={handleDrop}
        isMobile={isMobile}
      />
    </AssessmentWrapper>
  );
}
