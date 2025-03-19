import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, ProgressBar, Surface, TouchableRipple } from "react-native-paper";
import { useRouter } from "expo-router";
import { ViewProgress, ViewType } from "../../types";
import ThemedTitle from "../themed/ThemedTitle";
import ThemedParagraph from "../themed/ThemedParagraph";
import styles from "@/styles/styles";

interface ViewCardProps {
	view: ViewType;
	progress: ViewProgress;
}

export default function ViewCard({ view, progress }: ViewCardProps) {
	const router = useRouter();

	const handlePress = () => {
		router.navigate({
			pathname: "/views/[id]",
			params: { id: view.id },
		});
	};
	// TODO: Add the Outro slide to the total slides
	const viewSlides = view.slides.length;
	//  Progress is an array of boolean values, true if the slide was completed, false otherwise
	const completedSlides = progress.progress?.filter((slide) => slide).length || 0;

	return (
		<Surface style={styles.viewCard}>
			<TouchableRipple onPress={handlePress} accessibilityRole="button" style={styles.touchable}>
				<View>
					<ThemedTitle>{view.name}</ThemedTitle>
					<ThemedParagraph numberOfLines={2} style={localStyles.description}>
						{view.description}
					</ThemedParagraph>
					<View style={localStyles.statsContainer}>
						<ThemedParagraph>Slides: {viewSlides}</ThemedParagraph>
						<ThemedParagraph>
							Completed: {completedSlides}/{viewSlides}
						</ThemedParagraph>
					</View>
					<View style={localStyles.progressBar}>
						<ProgressBar progress={completedSlides / viewSlides} style={localStyles.progressBar} />
					</View>
				</View>
			</TouchableRipple>
		</Surface>
	);
}

const localStyles = StyleSheet.create({
	container: {
	},
	description: {
		marginBottom: 8,
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	progressBar: {
		height: 8,
		borderRadius: 4,
	},
});
