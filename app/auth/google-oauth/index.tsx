import { StyleSheet, Text, View } from "react-native";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "@/store/authStore";
import { Button } from "react-native-paper";

WebBrowser.maybeCompleteAuthSession();

const GoogleOauthRedirect = () => {
  const { test, setTest } = useAuthStore();
  const onPress = () => {
    setTest("Test from GoogleOauthRedirect");
  };
  return (
    <View>
      <Text>GoogleOauthRedirect</Text>
      <Text>{test}</Text>
      <Button onPress={onPress}>Set Test</Button>
    </View>
  );
};

export default GoogleOauthRedirect;

const styles = StyleSheet.create({});
