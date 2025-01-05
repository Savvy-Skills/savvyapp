import { useFonts } from "expo-font";
import {
	Stack,
	useLocalSearchParams,
	useRouter,
	useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import * as Network from 'expo-network';

import { PaperProvider, Text } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAudioStore } from "@/store/audioStore";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeManager } from "@/hooks/useThemeManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "@/components/providers/SnackBarProvider";
import { View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
		},
	},
});

const excluded = ["auth", "debug", "login"];

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMonoRegular.ttf"),
		Poppins: require("../assets/fonts/PoppinsRegular.ttf"),
		PoppinsBold: require("../assets/fonts/PoppinsBold.ttf"),
		PoppinsItalic: require("../assets/fonts/PoppinsItalic.ttf"),
		PoppinsBlack: require("../assets/fonts/PoppinsBlack.ttf"),
		PoppinsExtraBold: require("../assets/fonts/PoppinsExtraBold.ttf"),
	});
	const networkState = Network.useNetworkState();

	const loadSounds = useAudioStore((state) => state.loadSounds);
	const soundsLoaded = useAudioStore((state) => state.soundsLoaded);
	const { token, getUser, isInitialized, user } = useAuthStore();
	const segments = useSegments();
	const router = useRouter();
	const [appIsReady, setAppIsReady] = useState(false);
	const { theme, initialize } = useThemeManager();
	const { id } = useLocalSearchParams<{ id: string }>();

	useEffect(() => {
		loadSounds();
		initialize();
	}, []);

	useEffect(() => {
		if (fontsLoaded && soundsLoaded) {
			SplashScreen.hideAsync();
			setAppIsReady(true);
		}
	}, [fontsLoaded, soundsLoaded]);

	useEffect(() => {
		if (isInitialized && appIsReady) {
			const inAuthGroup = segments[0] === "auth";
			const inDebug = segments[0] === "debug";
			const notInRoot = segments.length > 0;

			if (user && !notInRoot) {
				router.replace("/home");
			}
			if (!token && notInRoot && !excluded.includes(segments[0])) {
				router.replace("/auth/login");
			} else if (token) {
				if (!user) {
					getUser();
				} else {
					if (inAuthGroup) {
						router.replace("/home");
					}
				}
			}
		}
	}, [isInitialized, token, segments, appIsReady, user]);

	if (!isInitialized || !appIsReady) {
		return null;
	}

	console.log({networkState});

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<PaperProvider theme={theme}>
				<SnackbarProvider>
					<QueryClientProvider client={queryClient}>
						<SafeAreaProvider>
							{!networkState.isConnected && (
								<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
									<Text>No internet connection</Text>
								</View>
							)}
							<Stack screenOptions={{ headerShown: false }}>
								<Stack.Screen name="index" options={{ title: "Landing Page" }} />
								<Stack.Screen name="auth" options={{ headerShown: false }} />
								<Stack.Screen name="(main)" options={{ headerShown: false }} />
								<Stack.Screen name="(misc)" options={{ headerShown: false }} />
								<Stack.Screen name="+not-found" />
							</Stack>
						</SafeAreaProvider>
					</QueryClientProvider>
				</SnackbarProvider>
			</PaperProvider>
		</GestureHandlerRootView>
	);
}
