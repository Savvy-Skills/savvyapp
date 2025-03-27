import { useThemeStore } from "@/store/themeStore";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

export const useThemeManager = () => {
  const { theme, isDarkMode, setIsDarkMode } = useThemeStore();

  const initialize = () => {
	setIsDarkMode(false)
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return { theme, isDarkMode, toggleTheme, initialize };
};
