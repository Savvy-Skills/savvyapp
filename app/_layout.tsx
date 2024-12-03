import { useFonts } from "expo-font";
import {
  Href,
  Stack,
  useLocalSearchParams,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { PaperProvider } from "react-native-paper";
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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMonoRegular.ttf"),
    Poppins: require("../assets/fonts/PoppinsRegular.ttf"),
    PoppinsBold: require("../assets/fonts/PoppinsBold.ttf"),
    PoppinsItalic: require("../assets/fonts/PoppinsItalic.ttf"),
    PoppinsBlack: require("../assets/fonts/PoppinsBlack.ttf"),
    PoppinsExtraBold: require("../assets/fonts/PoppinsExtraBold.ttf"),
  });

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
      if (!token && !inAuthGroup && notInRoot && !inDebug) {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <SnackbarProvider>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name="index"
                    options={{ title: "Landing Page" }}
                  />
                  <Stack.Screen name="home/index" options={{ title: "Home" }} />
                  <Stack.Screen
                    name="courses/index"
                    options={{ title: "Courses" }}
                  />
                  <Stack.Screen
                    name="courses/[id]"
                    options={{ title: "Course Details" }}
                  />
                  <Stack.Screen
                    name="modules/index"
                    options={{ title: "Modules" }}
                  />
                  <Stack.Screen
                    name="modules/[id]"
                    options={{ title: "Module Details" }}
                  />
                  <Stack.Screen
                    name="lessons/[id]"
                    options={{ title: "Lesson Details" }}
                  />
                  <Stack.Screen name="auth/login" options={{ title: "Login" }} />
                  <Stack.Screen name="terms/index" options={{ title: "Terms" }} />
                  <Stack.Screen name="debug/index" options={{ title: "Debug" }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </View>
            </SafeAreaProvider>
          </QueryClientProvider>
        </SnackbarProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

