import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Module } from '../types';
import ThemedTitle from './themed/ThemedTitle';
import ThemedParagraph from './themed/ThemedParagraph';

interface ModuleCardProps {
  module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/modules/${module.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} accessibilityRole="button">
      <Card style={styles.card}>
        <Card.Content>
          <ThemedTitle>{module.name}</ThemedTitle>
          <ThemedParagraph numberOfLines={2} style={styles.description}>
            {module.description}
          </ThemedParagraph>
          <View style={styles.statsContainer}>
            <ThemedParagraph>Slides: {module.slides.length}</ThemedParagraph>
            <ThemedParagraph>Completed: 0/{module.slides.length}</ThemedParagraph>
          </View>
          <ProgressBar progress={0} style={styles.progressBar} />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
	display: 'flex',
	flexDirection: 'column',
  },
  description: {
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});