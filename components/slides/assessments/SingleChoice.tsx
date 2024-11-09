import React, { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { RadioButton } from "react-native-paper"
import AssessmentWrapper from "../AssessmentWrapper"
import { QuestionInfo } from "@/types"
import { useModuleStore } from "@/store/moduleStore"
import StatusIcon from "@/components/StatusIcon"
import styles from "@/styles/styles"

export type AssessmentProps = {
  question: QuestionInfo
  index: number
}

export default function SingleChoice({ question, index }: AssessmentProps) {
  const [selectedValue, setSelectedValue] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [isWrong, setIsWrong] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const { setSubmittableState, setCorrectnessState, submittedAssessments } =
    useModuleStore()

  const options = question.options.map((option) => option.text)
  const correctAnswer =
    question.options.find((option) => option.isCorrect)?.text || ""

  useEffect(() => {
    if (selectedValue) {
      setSubmittableState(index, true)
      let correct: boolean = selectedValue === correctAnswer
      setCorrectnessState(index, correct)
    }
  }, [
    selectedValue,
    index,
    setSubmittableState,
    correctAnswer,
    setCorrectnessState,
  ])

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.question_id === question.id
  )

  const currentSubmission =
    currentSubmissionIndex !== -1
      ? submittedAssessments[currentSubmissionIndex]
      : undefined

  useEffect(() => {
    if (currentSubmission) {
      if (!currentSubmission.correct) {
        setIsWrong(true)
      }
      setShowFeedback(true)
    }
  }, [submittedAssessments, currentSubmission])

  const blocked = currentSubmission?.correct || showAnswer

  const getOptionStyles = (option: string) => {
    if (option === selectedValue) {
      if (currentSubmission?.correct) {
        return [styles.option, styles.correctOption]
      } else if (isWrong) {
        return [styles.option, styles.incorrectOption]
      } else if (showAnswer) {
        return [styles.option, styles.revealedOption]
      }
      return [styles.option, styles.selectedOption]
    }
    return [styles.option]
  }

  const handleChoiceSelection = (value: string) => {
    setSelectedValue(value)
    setIsWrong(false)
    setShowAnswer(false)
    setShowFeedback(false)
  }

  const resetStates = () => {
    setSelectedValue("")
    setShowAnswer(false)
    setIsWrong(false)
    setShowFeedback(false)
  }

  const handleTryAgain = () => {
    resetStates()
  }

  const handleRevealAnswer = () => {
    setSelectedValue(correctAnswer)
    setShowAnswer(true)
    setIsWrong(false)
    setShowFeedback(true)
  }

  return (
    <AssessmentWrapper
      question={question}
      onTryAgain={handleTryAgain}
      onRevealAnswer={handleRevealAnswer}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
    >
      <RadioButton.Group
        onValueChange={handleChoiceSelection}
        value={selectedValue}
      >
        {options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <RadioButton.Item
              label={option}
              value={option}
              disabled={blocked}
              style={getOptionStyles(option)}
              uncheckedColor="#a197f9"
              color="#a197f9"
            />
            <View style={styles.iconContainer}>
              {option === selectedValue && (
                <StatusIcon
                  isCorrect={currentSubmission?.correct || false}
                  isWrong={isWrong}
                  showAnswer={showAnswer}
                />
              )}
            </View>
          </View>
        ))}
      </RadioButton.Group>
    </AssessmentWrapper>
  )
}
