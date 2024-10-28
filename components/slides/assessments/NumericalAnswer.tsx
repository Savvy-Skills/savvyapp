import React, { useEffect, useState } from "react"
import AssessmentWrapper from "../AssessmentWrapper"
import { TextInput } from "react-native-paper"
import { QuestionInfo } from "@/types"
import { useModuleStore } from "@/store/moduleStore"

export default function NumericalAnswerAssessment({
  question,
  index,
}: {
  question: QuestionInfo
  index: number
}) {
  const [value, setValue] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)
  const answer = parseFloat(question.options[0].text)
  const { setSubmittableState } = useModuleStore()

  const handleChange = (event: any) => {
    const { text } = event.nativeEvent
    setValue(text.replace(/[^0-9.]/g, ""))
  }

  useEffect(() => {
    const isSubmittable = value.trim() !== ""
    setSubmittableState(index, isSubmittable)
  }, [value, index, setSubmittableState])

  const handleSubmit = () => {
    let correct: boolean
    if (Array.isArray(answer)) {
      correct = answer.includes(parseFloat(value))
    } else {
      correct = Math.abs(parseFloat(value)) === answer
    }
    setIsCorrect(correct)
    return correct
  }

  return (
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
      <TextInput value={value} onChange={handleChange} disabled={isCorrect} />
    </AssessmentWrapper>
  )
}