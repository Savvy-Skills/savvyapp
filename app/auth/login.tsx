import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useAuthStore } from "@/store/authStore";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import ThemedLogo from "@/components/themed/ThemedLogo";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const theme = useTheme();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.keyboardAvoidingView]}
      >
        <View style={styles.logoContainer}>
          <ThemedLogo width={140} height={140}/>
        </View>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Welcome Back!
        </Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Login
        </Button>
        <Button
          mode="text"
          onPress={() => {
            /* Handle forgot password */
          }}
          style={styles.forgotPassword}
        >
          Forgot Password?
        </Button>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  error: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  forgotPassword: {
    marginTop: 16,
  },
});
