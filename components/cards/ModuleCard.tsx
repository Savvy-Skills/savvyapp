import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Surface, Text, TouchableRipple } from "react-native-paper";
import { useRouter } from "expo-router";
import { Module } from "@/types";
import ThemedTitle from "../themed/ThemedTitle";
import styles from "@/styles/styles";

interface ModuleCardProps {
	module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
	const router = useRouter();

	const handlePress = () => {
		router.navigate({
			pathname: "/modules/[id]",
			params: { id: module.id },
		});
	};

	const lessonViews = module.views.filter((l) => l.type === "lesson");
	const quizViews = lessonViews.filter((l) => l.quiz);


	return (
		<Surface style={[styles.card, { marginRight: 16 }]}>
			<TouchableRipple onPress={handlePress} accessibilityRole="button" style={styles.touchable}>
				<View style={localStyles.container}>
					<Image
						source={require("@/assets/images/pngs/placeholder.png")}
						style={localStyles.backgroundPattern}
					/>
					<ThemedTitle style={localStyles.title} numberOfLines={2}>
						{module.name}
					</ThemedTitle>
					<View style={localStyles.infoContainer}>
						<Text style={localStyles.info}>
							{lessonViews.length - quizViews.length} {lessonViews.length - quizViews.length !== 1 ? "Lessons" : "Lesson"}
						</Text>
						<Text style={localStyles.info}>
							{quizViews.length} {quizViews.length !== 1 ? "Quizes" : "Quiz"}
						</Text>
					</View>
				</View>
			</TouchableRipple>
		</Surface>
	);
}

const localStyles = StyleSheet.create({
	container: {
	},
	infoContainer: {
		flexDirection: "row",
		gap: 16,
	},
	info: {
	},
	backgroundPattern: {
		width: "100%",
		height: 120,
		resizeMode: "cover",
		borderRadius: 8,
	},
	title: {
		fontSize: 18,
		fontFamily: "Poppins",
		fontWeight: "bold",
	},
});
