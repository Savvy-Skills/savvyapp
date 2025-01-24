import React, { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useAuthStore } from "@/store/authStore";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import ThemedLogo from "@/components/themed/ThemedLogo";
import * as WebBrowser from 'expo-web-browser';
import { getGoogleInitUrl } from "@/services/authapi";
import { Colors } from "@/constants/Colors";

const authChannel = new BroadcastChannel("auth_channel");

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, isLoading, token, user, setToken, error } = useAuthStore();
	const theme = useTheme();

	const handleLogin = async () => {
		await login(email, password);
	};

	const handlePress = () => {
		console.log({ token, user });
	};

	const handleGoogleLogin = async () => {
		const url = await getGoogleInitUrl();
		await WebBrowser.openAuthSessionAsync(url);
	};

	useEffect(() => {
		authChannel.onmessage = (event) => {
			if (event.data.type === "token") {
				setToken(event.data.token);
			}
		};
	}, []);

	return (
		<ScreenWrapper>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={[styles.keyboardAvoidingView]}
			>
				<View style={styles.logoContainer}>
					<ThemedLogo width={140} height={140} />
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
				{error && <Text style={styles.error}>{error}</Text>}
				<View style={styles.buttonsContainer}>

					<Button
						mode="contained"
						buttonColor={Colors.primary}
						onPress={handleLogin}
						loading={isLoading}
						style={styles.defaultButton}
					>
						Login
					</Button>
					<Button buttonColor={Colors.primary} mode="contained" onPress={handleGoogleLogin} style={styles.defaultButton}>
						Sign in with Google
					</Button>
					<Button mode="text" onPress={handlePress} style={styles.defaultButton}>
						Forgot Password?
					</Button>
				</View>
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
	buttonsContainer: {
		gap: 8,
	},
	logoContainer: {
		alignItems: "center",
	},
	defaultButton: {
		borderRadius: 4,
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
