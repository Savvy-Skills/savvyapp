import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import styles from '@/styles/styles';
import useAnswerEvaluation from '@/hooks/useAnswerEvaluation';

interface EvaluationResult {
  is_correct: boolean;
  rating: number;
  feedback: string;
  reasoning: string;
}

export default function AnswerReviewer() {
  const [question, setQuestion] = useState("What is savvyskills?");
  const [answer, setAnswer] = useState("");
  const { evaluate, result, loading, error } = useAnswerEvaluation();

  const handleEvaluate = () => {
    evaluate(question, answer);
  };

  return (
    <ScrollView style={localStyles.scrollView}>
      <View style={localStyles.container}>
        <Text style={localStyles.title}>Answer Reviewer</Text>
        
        <Card style={localStyles.inputContainer}>
          <Card.Content>
            <TextInput
              label="Question"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={2}
              mode="outlined"
              style={localStyles.input}
            />
            
            <TextInput
              label="Student Answer"
              value={answer}
              onChangeText={setAnswer}
              multiline
              numberOfLines={4}
              mode="outlined"
              style={localStyles.input}
            />
            
            <Button 
              mode="contained" 
              onPress={handleEvaluate}
              style={[styles.savvyButton, styles.savvyContainedButton]}
              labelStyle={styles.savvyContainedButtonText}
              disabled={loading}
            >
              Evaluate Answer
            </Button>
          </Card.Content>
        </Card>
        
        <View style={localStyles.outputSection}>
          <Text style={localStyles.sectionTitle}>Evaluation:</Text>
          
          {loading && (
            <View style={localStyles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text>Evaluating your answer...</Text>
            </View>
          )}
          
          {error && (
            <ErrorMessage message={error} />
          )}
          
          {!loading && !error && !result && (
            <Text style={localStyles.placeholderText}>
              Enter a question and answer, then click Evaluate to see the assessment
            </Text>
          )}
          
          {result && (
            <EvaluationCard result={result} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// Smaller components
function EvaluationCard({ result }: { result: EvaluationResult }) {
  // Determine the score class and color
  const getScoreColor = () => {
    if (result.rating >= 70) return Colors.success;
    if (result.rating >= 50) return Colors.revealed;
    return Colors.error;
  };
  
  const getScoreClass = () => {
    if (result.rating >= 70) return 'high-score';
    if (result.rating >= 50) return 'medium-score';
    return 'low-score';
  };
  
  return (
    <View>
      <Text style={localStyles.evaluationHeader}>
        {result.is_correct ? "✅ Answer is Correct" : "❌ Answer Needs Improvement"}
      </Text>
      
      <Card style={[
        localStyles.evaluationCard, 
        { borderLeftColor: getScoreColor(), borderLeftWidth: 5 }
      ]}>
        <Card.Content>
          <Text style={localStyles.cardSectionTitle}>Rating</Text>
          <View style={localStyles.ratingContainer}>
            <Text style={[localStyles.ratingValue, { color: getScoreColor() }]}>
              {result.rating}/100
            </Text>
            <View style={localStyles.ratingBarBg}>
              <View 
                style={[
                  localStyles.ratingBar, 
                  { width: `${result.rating}%`, backgroundColor: getScoreColor() }
                ]} 
              />
            </View>
          </View>
          
          <Text style={localStyles.cardSectionTitle}>Feedback</Text>
          <Text style={localStyles.contentText}>{result.feedback}</Text>
          
          <Text style={localStyles.cardSectionTitle}>Reasoning</Text>
          <Text style={localStyles.contentText}>{result.reasoning}</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <View style={localStyles.errorMessage}>
      <Text style={localStyles.errorTitle}>Error</Text>
      <Text>{message}</Text>
      <Text style={localStyles.errorHelp}>Please revise your answer and try again.</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: "PoppinsBold",
    marginBottom: 16,
    color: Colors.text,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 10,
  },
  inputContainer: {
    marginVertical: 20,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.background,
  },
  outputSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  placeholderText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  evaluationHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.text,
  },
  evaluationCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardSectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  ratingContainer: {
    marginVertical: 10,
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingBarBg: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    borderRadius: 6,
  },
  contentText: {
    lineHeight: 22,
    color: Colors.text,
  },
  errorMessage: {
    backgroundColor: Colors.errorBackground,
    borderLeftWidth: 5,
    borderLeftColor: Colors.error,
    padding: 15,
    borderRadius: 4,
    marginTop: 15,
  },
  errorTitle: {
    color: Colors.errorText,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorHelp: {
    fontStyle: 'italic',
    color: '#555',
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
}); 