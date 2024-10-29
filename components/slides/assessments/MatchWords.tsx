import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { QuestionInfo } from "@/types";
import { useModuleStore } from "@/store/moduleStore";

export default function MatchWordsAssessment({
  question,
  index,
}: {
  question: QuestionInfo;
  index: number;
}) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ [key: string]: string }>({});
  const {
    setSubmittableState,
    correctnessStates,
    setCorrectnessState,
    submittedAssessments,
  } = useModuleStore();

  const words = question.options.map((option) => option.text);
  const matches = question.options.map((option) => option.match);

  useEffect(() => {
    if (Object.keys(connections).length === words.length) {
      setSubmittableState(index, true);
	  const correct =
      Object.entries(connections).length === words.length &&
      Object.entries(connections).every(
        ([word, match], index) => match === matches[index]
      );
      setCorrectnessState(index, correct);
    } else {
	  setSubmittableState(index, false);
	  setCorrectnessState(index, false);
	}
  }, [connections, index, setSubmittableState]);


  const handleSubmit = () => {
    return correctnessStates[index] || false;
  };

  const currentSubmissionIndex = submittedAssessments.findIndex(
	(submission) => submission.question_id === question.id
  );
  const currentSubmission = currentSubmissionIndex !== -1 ? submittedAssessments[currentSubmissionIndex] : undefined;
  const blocked = currentSubmission ? currentSubmission.correct : false;

  const handleWordPress = (word: string) => {
    if (blocked) return;
    setSelectedWord(word);
  };

  const handleMatchPress = (match: string) => {
    if (blocked) return;
    if (selectedWord) {
      const newConnections = { ...connections, [selectedWord]: match };
      setConnections(newConnections);
      setSelectedWord(null);
    }
  };

  return (
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
      <View style={styles.container}>
        <View style={styles.column}>
          {words.map((word, index) => (
            <Button
              key={index}
              mode={selectedWord === word ? "contained" : "outlined"}
              onPress={() => handleWordPress(word)}
              style={[
                styles.button,
                connections[word] && styles.connectedButton,
              ]}
              disabled={blocked}
            >
              {word}
            </Button>
          ))}
        </View>
        <View style={styles.column}>
          {matches.map((match, index) => (
            <View
              key={index}
              style={[
                styles.matchContainer,
                Object.values(connections).includes(match) &&
                  styles.connectedMatch,
              ]}
            >
              <Text
                onPress={() => handleMatchPress(match)}
                style={styles.matchText}
              >
                {match}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </AssessmentWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
  },
  button: {
    marginBottom: 8,
  },
  connectedButton: {
    backgroundColor: "#e0e0e0",
  },
  matchContainer: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  connectedMatch: {
    backgroundColor: "#e0e0e0",
  },
  matchText: {
    textAlign: "center",
  },
});
