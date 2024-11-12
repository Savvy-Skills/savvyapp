import React, { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { RadioButton } from "react-native-paper"
import AssessmentWrapper from "../AssessmentWrapper"
import { QuestionInfo } from "@/types"
import { useModuleStore } from "@/store/moduleStore"
import StatusIcon from "@/components/StatusIcon"
import styles from "@/styles/styles"
import CustomRadioButton from "@/components/SavvyRadioButton"

export type AssessmentProps = {
  question: QuestionInfo
  index: number
  quizMode?: boolean
}

export default function SingleChoice({ question, index, quizMode = false }: AssessmentProps) {
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
        if (quizMode) {
          setShowAnswer(true)
        }
      }
      setShowFeedback(true)
    }
  }, [submittedAssessments, currentSubmission, quizMode])

  const blocked = currentSubmission?.correct || showAnswer || (quizMode && isWrong)

  const getOptionStyles = (option: string) => {
    if (quizMode && isWrong) {
      if (option === correctAnswer) {
        return [styles.option, styles.correctOption]
      }
      if (option === selectedValue) {
        return [styles.option, styles.incorrectOption]
      }
      return [styles.option, styles.disabledOption]
    }

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
    if (quizMode && (isWrong || currentSubmission?.correct)) {
      return
    }
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
    if (!quizMode) {
      resetStates()
    }
  }

  const handleRevealAnswer = () => {
    if (!quizMode) {
      setSelectedValue(correctAnswer)
      setShowAnswer(true)
      setIsWrong(false)
      setShowFeedback(true)
    }
  }

  const renderStatusIcon = (option: string) => {
    if (quizMode && isWrong) {
      if (option === correctAnswer) {
        return <StatusIcon isCorrect={true} isWrong={false} showAnswer={false} />
      }
      if (option === selectedValue) {
        return <StatusIcon isCorrect={false} isWrong={true} showAnswer={false} />
      }
      return null
    }

    if (option === selectedValue) {
      return (
        <StatusIcon
          isCorrect={currentSubmission?.correct || false}
          isWrong={isWrong}
          showAnswer={showAnswer}
        />
      )
    }
    return null
  }

  return (
    <AssessmentWrapper
      question={question}
      onTryAgain={quizMode ? undefined : handleTryAgain}
      onRevealAnswer={quizMode ? undefined : handleRevealAnswer}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
	  quizMode={quizMode}
    >
      <RadioButton.Group
        onValueChange={handleChoiceSelection}
        value={selectedValue}
      >
        {options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <CustomRadioButton
              label={option}
              value={option}
              status={selectedValue === option ? "checked" : "unchecked"}
              onPress={() => handleChoiceSelection(option)}
              disabled={blocked}
              style={getOptionStyles(option)}
            />
            <View style={styles.iconContainer}>
              {renderStatusIcon(option)}
            </View>
          </View>
        ))}
      </RadioButton.Group>
    </AssessmentWrapper>
  )
}