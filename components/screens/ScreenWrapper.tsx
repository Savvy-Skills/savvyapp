import { Colors } from "@/constants/Colors";
import React from "react";
import { useWindowDimensions, View, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
	children: React.ReactNode;
	style?: ViewStyle;
}

export default function ScreenWrapper({ children, style }: ScreenWrapperProps) {

	return (
		<SafeAreaView
			id="ScreenWrapperSafeAreaView"
			style={[{ backgroundColor: Colors.background, flex: 1 }, style]}
		>
			{children}
		</SafeAreaView>
	);
}
