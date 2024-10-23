import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import AssessmentWrapper from './AssessmentWrapper';

export default function MatchWordsAssessment({ question }) {
  const [selectedWord, setSelectedWord] = useState(null);
  const [connections, setConnections] = useState({});
  const [isCorrect, setIsCorrect] = useState(false);

  const words = question.Option.map(option => option.OptionText);
  const matches = question.Option.map(option => option.MatchText);

  const handleWordPress = (word) => {
    if (isCorrect) return;
    setSelectedWord(word);
  };

  const handleMatchPress = (match) => {
    if (isCorrect) return;
    if (selectedWord) {
      const newConnections = { ...connections, [selectedWord]: match };
      setConnections(newConnections);
      setSelectedWord(null);
    }
  };

  const handleSubmit = () => {
    const correct = Object.entries(connections).length === words.length &&
      Object.entries(connections).every(([word, match], index) => {
        const correctMatch = question.Option.find(option => option.OptionText === word).MatchText;
        return match === correctMatch;
      });
    setIsCorrect(correct);
    return correct;
  };

  return (
    <AssessmentWrapper question={question} onSubmit={handleSubmit}>
      <View style={styles.container}>
        <View style={styles.column}>
          {words.map((word, index) => (
            <Button
              key={index}
              mode={selectedWord === word ? 'contained' : 'outlined'}
              onPress={() => handleWordPress(word)}
              style={[styles.button, connections[word] && styles.connectedButton]}
              disabled={isCorrect}
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
                Object.values(connections).includes(match) && styles.connectedMatch,
              ]}
            >
              <Text onPress={() => handleMatchPress(match)} style={styles.matchText}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
  },
  button: {
    marginBottom: 8,
  },
  connectedButton: {
    backgroundColor: '#e0e0e0',
  },
  matchContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  connectedMatch: {
    backgroundColor: '#e0e0e0',
  },
  matchText: {
    textAlign: 'center',
  },
});