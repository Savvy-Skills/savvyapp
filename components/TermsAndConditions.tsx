import styles from "@/styles/styles";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface TermsAndConditionsProps {
  containerStyle?: object;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  containerStyle,
}) => {
  const theme = useTheme();

  const localStyles = StyleSheet.create({
    container: {
      padding: 16,
      maxWidth: 1080,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.primary,
	  maxWidth: 1080,
	  width: "100%",
	  alignSelf: "center",
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.colors.secondary,
    },
    paragraph: {
      marginBottom: 8,
      lineHeight: 20,
    },
  });

  return (
    <>
      <Text style={localStyles.title}>Terms and Conditions</Text>
      <ScrollView
        style={[localStyles.container, containerStyle, styles.centeredMaxWidth]}
      >
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={localStyles.paragraph}>
            By accessing and using Savvyapp, you agree to be bound by these
            Terms and Conditions. If you do not agree to these terms, please do
            not use our platform.
          </Text>
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>2. User Accounts</Text>
          <Text style={localStyles.paragraph}>
            You are responsible for maintaining the confidentiality of your
            account and password. You agree to accept responsibility for all
            activities that occur under your account.
          </Text>
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>3. Intellectual Property</Text>
          <Text style={localStyles.paragraph}>
            All content on Savvyapp, including text, graphics, logos, and
            software, is the property of Savvyapp or its content suppliers and
            is protected by international copyright laws.
          </Text>
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>4. User Content</Text>
          <Text style={localStyles.paragraph}>
            By submitting content to Savvyapp, you grant us a worldwide,
            non-exclusive, royalty-free license to use, reproduce, adapt,
            publish, translate and distribute it in any existing or future
            media.
          </Text>
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>
            5. Limitation of Liability
          </Text>
          <Text style={localStyles.paragraph}>
            Savvyapp shall not be liable for any indirect, incidental, special,
            consequential or punitive damages, or any loss of profits or
            revenues, whether incurred directly or indirectly, or any loss of
            data, use, goodwill, or other intangible losses.
          </Text>
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>6. Governing Law</Text>
          <Text style={localStyles.paragraph}>
            These Terms shall be governed and construed in accordance with the
            laws of [Your Country/State], without regard to its conflict of law
            provisions.
          </Text>
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>7. Changes to Terms</Text>
          <Text style={localStyles.paragraph}>
            We reserve the right to modify or replace these Terms at any time.
            It is your responsibility to check these Terms periodically for
            changes.
          </Text>
        </View>

        <Text style={localStyles.paragraph}>Last updated: 12/01/2024</Text>
      </ScrollView>
    </>
  );
};
