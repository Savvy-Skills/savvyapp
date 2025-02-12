	import React, { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { TextInput, Button, Text, useTheme, HelperText } from "react-native-paper";
import { useAuthStore } from "@/store/authStore";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import ThemedLogo from "@/components/themed/ThemedLogo";
import * as WebBrowser from 'expo-web-browser';
import { getGoogleInitUrl, googleContinue } from "@/services/authapi";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { generateColors } from "@/utils/utilfunctions";

import {
	GoogleSignin,
	GoogleSigninButton,
	NativeModuleError,
	User,
} from '@react-native-google-signin/google-signin';
import { signIn } from "@/utils/signin";
import { ScrollView } from "react-native-gesture-handler";

const authChannel = Platform.OS === "web" ? new BroadcastChannel("auth_channel") : null;

GoogleSignin.configure({
	webClientId: '175190225211-47pur7e7dhs9i00gj9rb9fk3tnheun6o.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
	scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
	offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
	forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
	iosClientId: '175190225211-bcbvqfu9e9ltvbdnaevrvr9dk731sop6.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
});

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, isLoading, token, user, setToken, error } = useAuthStore();
	const theme = useTheme();
	const [isHovering, setIsHovering] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
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
		if (authChannel) {
			authChannel.onmessage = (event) => {
				if (event.data.type === "token") {
					setToken(event.data.token);
				}
			};
		}
	}, []);

	const handleGoogleSignIn = async () => {
		const response: User | NativeModuleError = await signIn();
		if (response && 'serverAuthCode' in response) {
			const continueResponse = await googleContinue({ code: response.serverAuthCode as string });
			if (continueResponse.token) {
				setToken(continueResponse.token);
			}
		} else {
			setErrorMessage(JSON.stringify(response));
		}
	};

	return (
		<ScreenWrapper>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
					{Platform.OS === "web" ? (

						<Pressable onPress={handleGoogleLogin} style={{ width: 180, height: 40 }} onHoverIn={() => setIsHovering(true)} onHoverOut={() => setIsHovering(false)}>
							<Image source={require("@/assets/images/svgs/googlebutton.svg")} contentFit="contain" style={{ width: "100%", height: "100%" }} />
							{isHovering && <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: generateColors(Colors.primary, 0.05).muted }} />}
						</Pressable>
					) : (
						<>
							<GoogleSigninButton
								size={GoogleSigninButton.Size.Standard}
								color={GoogleSigninButton.Color.Light}
								onPress={handleGoogleSignIn}
							/>
						</>
					)}
					<Button mode="text" onPress={handlePress} style={styles.defaultButton}>
						Forgot Password?
					</Button>
					{errorMessage && <HelperText type="error">{errorMessage}</HelperText>}
					</View>
				</KeyboardAvoidingView>
			</ScrollView>
		</ScreenWrapper >
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
