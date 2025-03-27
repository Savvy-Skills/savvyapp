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
					<View style={localStyles.imageContainer}>
						<Image
							source={module.image_url ? { uri: module.image_url } : require("@/assets/images/pngs/placeholder.png")}
							style={localStyles.backgroundPattern}
						/>
					</View>
					<View style={localStyles.contentContainer}>
						<ThemedTitle style={localStyles.title} numberOfLines={2}>
							{module.name}
						</ThemedTitle>
						<View style={localStyles.infoContainer}>
							<Text style={localStyles.info}>
								{lessonViews.length - quizViews.length} {lessonViews.length - quizViews.length !== 1 ? "Lessons" : "Lesson"}
							</Text>
							<Text style={localStyles.info}>
								{quizViews.length} {quizViews.length !== 1 ? "Quizzes" : "Quiz"}
							</Text>
						</View>
					</View>
				</View>
			</TouchableRipple>
		</Surface>
	);
}

const localStyles = StyleSheet.create({
	container: {
		overflow: 'hidden',
	},
	imageContainer: {
		height: 140,
		width: '100%',
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		overflow: 'hidden',
		backgroundColor: '#f0f0f0',
		justifyContent: 'center',
		alignItems: 'center',
	},
	contentContainer: {
		padding: 12,
	},
	infoContainer: {
		flexDirection: "row",
		gap: 16,
		marginTop: 4,
	},
	info: {
		fontSize: 14,
		opacity: 0.8,
	},
	backgroundPattern: {
		width: '90%',
		height: '90%',
		resizeMode: 'contain',
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 4,
	},
});
