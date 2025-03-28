import {
	Stack,
	useLocalSearchParams,
	useRouter,
	useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { PaperProvider, Text } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAudioStore } from "@/store/audioStore";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeManager } from "@/hooks/useThemeManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "@/components/providers/SnackBarProvider";
import { Platform, View } from "react-native";
import "@/styles/styles.css";
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
	// const [fontsLoaded] = useFonts({
	// 	Montserrat_400Regular,
	// 	Montserrat_600SemiBold,
	// 	Montserrat_700Bold,
	// 	Montserrat_800ExtraBold,
	// 	Montserrat_900Black,
	// });

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
		if (soundsLoaded) {
			SplashScreen.hideAsync();
			setAppIsReady(true);
		}
	}, [soundsLoaded]);

	useEffect(() => {
		if (isInitialized && appIsReady) {
			const inAuthGroup = segments[0] === "auth";
			const notInRoot = segments.length > 0;
			const inCallback = segments[0] === "auth" && segments[1] === "callback";

			if (user && !notInRoot && !inCallback) {
				router.replace("/home");
			}

			if (Platform.OS !== "web") {
				if (!token && (!excluded.includes(segments[0]))) {
					router.replace("/auth/login");
				}
			}

			if (!token && notInRoot && (!excluded.includes(segments[0]))) {
				if (segments[1] !== "login") {
					router.replace("/auth/login");
				}
			} else if (token) {
				if (!user) {
					getUser();
				} else {
					if (inAuthGroup && !inCallback) {
						router.replace("/home");
					}
				}
			}
		}
	}, [isInitialized, token, segments, appIsReady, user]);

	if (!isInitialized || !appIsReady) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<PaperProvider theme={theme}>
				<SnackbarProvider>
					<QueryClientProvider client={queryClient}>
						<SafeAreaProvider>
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
