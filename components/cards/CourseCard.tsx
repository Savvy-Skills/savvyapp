import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Surface, Text, TouchableRipple } from "react-native-paper";
import { useRouter } from "expo-router";
import { Course } from "@/types";
import styles from "@/styles/styles";

interface CourseCardProps {
	course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
	const router = useRouter();

	const handlePress = () => {
		router.navigate({
			pathname: "/courses/[id]",
			params: { id: course.id },
		});
	};

	return (
		<Surface style={[styles.card, { marginRight: 16 }]}>
			<TouchableRipple
				onPress={handlePress}
				accessibilityRole="button"
				style={styles.touchable}
			>
				<View style={localStyles.container}>
					<Image
						source={require("@/assets/images/pngs/placeholder.png")}
						style={localStyles.backgroundPattern}
					/>
					<View style={styles.tagContainer}>
						<Text style={styles.tag}>AI</Text>
					</View>
					<Text style={localStyles.title} numberOfLines={2}>
						{course.name}
					</Text>
					<Text>{course.modules.length} Modules</Text>
				</View>
			</TouchableRipple>
		</Surface>
	);
}

const localStyles = StyleSheet.create({
	container: {
	},
	backgroundPattern: {
		width: "100%",
		height: 120,
		resizeMode: "cover",
		borderTopEndRadius: 8,
		borderTopLeftRadius: 8,
	},
	content: {
		flex: 1,
	},
	title: {
		fontSize: 20,
		fontFamily: "PoppinsBold",
	},
});
