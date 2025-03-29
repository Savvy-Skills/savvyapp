import React from 'react';
import { View } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { LoadingIndicatorProps } from '../types';
import { styles } from '../styles';

const LoadingIndicator = ({ progress }: LoadingIndicatorProps) => (
  <Card style={styles.loadingCard}>
    <Card.Content style={styles.loadingContent}>
      <ActivityIndicator size="large" color="#4361ee" />
      <Text style={styles.loadingText}>Generating comprehensive assessments... This may take a minute.</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.floor(progress)}%</Text>
    </Card.Content>
  </Card>
);

export default LoadingIndicator; 