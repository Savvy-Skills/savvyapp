import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

interface ExpandableFunFactProps {
  title?: string;
  children: React.ReactNode;
}

export default function ExpandableFunFact({ title = "Fun Fact", children }: ExpandableFunFactProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Surface style={styles.container}>
      <Pressable onPress={toggleExpand} style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.star}>✨</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <IconButton
          icon={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          onPress={toggleExpand}
          style={styles.icon}
        />
      </Pressable>
      
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 4,
    borderColor: `${Colors.orange}40`,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: `${Colors.orange}10`,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.orange,
  },
  star: {
    fontSize: 18,
    marginRight: 8,
  },
  icon: {
    margin: 0,
  },
  content: {
    padding: 12,
    paddingTop: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
}); 