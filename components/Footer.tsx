import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';

export const Footer: React.FC = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    footer: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    linkContainer: {
      flexDirection: 'row',
      gap: 16,
    },
    link: {
      color: theme.colors.primary,
    },
    copyright: {
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.footer}>
      <View style={styles.content}>
        <View style={styles.linkContainer}>
          <Link href="/terms" asChild>
            <Text style={styles.link}>Terms & Conditions</Text>
          </Link>
          <Link href="/home" asChild>
            <Text style={styles.link}>Contact Us</Text>
          </Link>
        </View>
        <Text style={styles.copyright}>&copy; 2023 Savvyapp</Text>
      </View>
    </View>
  );
};

