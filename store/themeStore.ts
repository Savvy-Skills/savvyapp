import {
  configureFonts,
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
} from "react-native-paper";
import { create } from "zustand";

const fontConfig = {
  fontFamily: "Poppins",
};

const createCustomTheme = (baseTheme: MD3Theme) => ({
  ...baseTheme,
  fonts: configureFonts({ config: fontConfig }),
});

const CustomLightTheme = createCustomTheme(MD3LightTheme);
const CustomDarkTheme = createCustomTheme(MD3DarkTheme);

type ThemeState = {
  theme: typeof CustomLightTheme;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: CustomLightTheme,
  isDarkMode: false,
  setIsDarkMode: (isDark: boolean) =>
    set((state) => ({
      isDarkMode: isDark,
      theme: isDark ? CustomDarkTheme : CustomLightTheme,
    })),
}));