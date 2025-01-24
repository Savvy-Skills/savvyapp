import { StyleSheet } from "react-native";
import React, { useEffect,  } from "react";
import { useAuthStore } from "@/store/authStore";
import {  useLocalSearchParams } from "expo-router";
import { googleContinue } from "@/services/authapi";
import LoadingIndicator from "@/components/LoadingIndicator";

// WebBrowser.maybeCompleteAuthSession();
const authChannel = new BroadcastChannel("auth_channel");

const GoogleOauthRedirect = () => {
	const { code } = useLocalSearchParams();
	const { setToken } = useAuthStore();

	useEffect(() => {
		const handleAuth = async () => {
			if (code) {
				try {
					const response = await googleContinue(code as string);
					if (response.token) {
						setToken(response.token);
						authChannel.postMessage({ type: "token", token: response.token });
						window.close();
					} else {
						console.error('Failed to authenticate', response);
					}
				} catch (error) {
					console.error('Error during authentication', error);
				}
			}
		};

		handleAuth();
	}, [code]);

	return (
		<LoadingIndicator />
	);
};

export default GoogleOauthRedirect;

const styles = StyleSheet.create({});
