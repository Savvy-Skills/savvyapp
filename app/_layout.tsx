import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import {
  PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAudioStore } from "@/store/audioStore";
import { useAuthStore } from "@/store/authStore";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
  });

  const loadSounds = useAudioStore((state) => state.loadSounds);
  const soundsLoaded = useAudioStore((state) => state.soundsLoaded);
  const { token, getUser, isInitialized, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadSounds();
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
      if (!token && !inAuthGroup) {
        router.replace("/auth/login");
      } else if (token) {
        if (!user) {
          getUser();
        }
        if (inAuthGroup) {
          router.replace("/");
        }
      }
    }
  }, [isInitialized, token, segments, appIsReady]);

  if (!fontsLoaded || !isInitialized || !appIsReady) {
    return null;
  }

  const paperTheme =
    colorScheme === "dark"
      ? { ...MD3DarkTheme, fonts: configureFonts({ config: fontConfig }) }
      : { ...MD3LightTheme, fonts: configureFonts({ config: fontConfig }) };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
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
