import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import styles from '@/styles/styles';

export const Footer: React.FC = () => {
  const theme = useTheme();

  const localStyles = StyleSheet.create({
    footer: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: 24,
      paddingHorizontal: 16,
      marginTop: 10,
    },
    content: {
      flexDirection: 'column',
      alignItems: 'flex-start',
	  alignSelf: "center",
    },
    linkContainer: {
      flexDirection: 'column',
      gap: 16,
      marginBottom: 16,
    },
    link: {
      color: theme.colors.primary,
      fontSize: 16,
    },
    copyright: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
	  alignSelf: "flex-end",
    },
  });

  return (
    <View style={localStyles.footer}>
      <View style={[localStyles.content, styles.centeredMaxWidth, {maxWidth: 1080}]}>
        <View style={localStyles.linkContainer}>
          <Link href="/terms" asChild>
            <Text style={localStyles.link}>Terms & Conditions</Text>
          </Link>
          <Link href="./#" asChild>
            <Text style={localStyles.link}>Privacy Policy</Text>
          </Link>
          <Link href="./#" asChild>
            <Text style={localStyles.link}>Contact Us</Text>
          </Link>
        </View>
        <Text style={localStyles.copyright}>&copy; 2023 Savvyapp</Text>
      </View>
    </View>
  );
};

