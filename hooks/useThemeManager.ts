import { useThemeStore } from "@/store/themeStore";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

export const useThemeManager = () => {
  const colorScheme = useColorScheme();
  const { theme, isDarkMode, setIsDarkMode } = useThemeStore();

  const initialize = () => {
	setIsDarkMode(colorScheme === "dark");
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return { theme, isDarkMode, toggleTheme, initialize };
};
