import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { TermsAndConditions } from "@/components/TermsAndConditions";
import TopNavBar from "@/components/navigation/TopNavBar";
import { Button } from "react-native-paper";
import { router } from "expo-router";

const TermsAndConditionsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Button to go back go home */}
      <Button icon={"arrow-left"} onPress={() => {router.navigate('/home')}} style={{alignSelf:"flex-start", borderRadius:4, marginBottom: 16}}>
        Go back to home
      </Button>

      <TermsAndConditions />
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
	gap: 16,
  },
});
