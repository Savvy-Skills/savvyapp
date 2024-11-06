import React from "react";
import { IconButton, Switch } from "react-native-paper";
import { useThemeManager } from "../hooks/useThemeManager";

export const ThemeSwitcher = () => {
  const { isDarkMode, toggleTheme } = useThemeManager();

  return <IconButton icon={isDarkMode?"flashlight":"flashlight-off"} onPress={toggleTheme} size={20} />;
};
