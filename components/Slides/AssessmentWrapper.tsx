import { useAudioStore } from "@/store/audioStore";
import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Card, useTheme } from "react-native-paper";

interface AssessmentWrapperProps {
  children: React.ReactNode;
  onSubmit: () => boolean;
  question: QuestionInfo;
}

export default function AssessmentWrapper({
  question,
  children,
  onSubmit,
}: AssessmentWrapperProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { playSound } = useAudioStore();

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correctness = onSubmit();
    setIsCorrect(correctness);
    if (correctness) {
      playSound("success");
    } else {
      playSound("failure");
    }
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  return (
    <Card style={styles.container}>
      <Card.Title title={question.text} />
      {showExplanation ? (
        <View style={styles.explanationContainer}>
          <Text>{question.explanation}</Text>
        </View>
      ) : (
        <>{children}</>
      )}
      {isSubmitted && (
        <View
          style={[
            styles.feedbackContainer,
            isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
          ]}
        >
          <Text style={styles.feedbackText}>
            {isCorrect ? "Correct!" : "Incorrect"}
          </Text>
        </View>
      )}
      <View style={styles.assessmentButtonContainer}>
        <Button mode="contained" onPress={handleSubmit} disabled={isCorrect}>
          Submit
        </Button>
        {isSubmitted && (
          <Button mode="outlined" onPress={toggleExplanation}>
            {showExplanation ? "Hide Explanation" : "Show Explanation"}
          </Button>
        )}
      </View>
    </Card>
  );
}
