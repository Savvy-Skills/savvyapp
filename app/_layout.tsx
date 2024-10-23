import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { PaperProvider, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAudioStore } from "@/store/audioStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const loadSounds = useAudioStore((state) => state.loadSounds);
  const soundsLoaded = useAudioStore((state) => state.soundsLoaded);

  useEffect(() => {
    loadSounds();
  }, []);

  useEffect(() => {
    if (loaded && soundsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, soundsLoaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="modules/index" options={{ title: "Modules" }} />
          <Stack.Screen
            name="modules/[id]"
            options={{ title: "Module Details" }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </PaperProvider>
  );
}
