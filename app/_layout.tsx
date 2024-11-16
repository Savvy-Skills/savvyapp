import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAudioStore } from "@/store/audioStore";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeManager } from "@/hooks/useThemeManager";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const fontConfig = {
  fontFamily: "Poppins",
};

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
	  const notInRoot = segments.length > 0;

      if (!token && !inAuthGroup && notInRoot ) {
        router.replace("/auth/login");
      } else if (token) {
        if (!user) {
          getUser();
        } else {
          if (inAuthGroup) {
            router.replace("/");
          }
        }
      }
    }
  }, [isInitialized, token, segments, appIsReady]);

  if (!isInitialized || !appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="modules/index" options={{ title: "Modules" }} />
            <Stack.Screen
              name="modules/[id]"
              options={{ title: "Module Details" }}
            />
            <Stack.Screen name="auth/login" options={{ title: "Login" }} />

            <Stack.Screen name="debug/index" options={{ title: "Debug" }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
