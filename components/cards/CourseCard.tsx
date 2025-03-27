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
					<View style={localStyles.imageContainer}>
						<Image
							source={course.image_url ? { uri: course.image_url } : require("@/assets/images/pngs/placeholder.png")}
							style={localStyles.backgroundPattern}
						/>
					</View>
					<View style={localStyles.contentContainer}>
						<View style={styles.tagContainer}>
							<Text style={styles.tag}>AI</Text>
						</View>
						<Text style={localStyles.title} numberOfLines={2}>
							{course.name}
						</Text>
						<Text style={localStyles.modules}>{course.modules.length} Modules</Text>
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
	backgroundPattern: {
		width: '90%',
		height: '90%',
		resizeMode: 'contain',
	},
	contentContainer: {
		padding: 12,
	},
	title: {
		fontSize: 18,
		marginBottom: 4,
		fontWeight: 'bold',
	},
	modules: {
		fontSize: 14,
		opacity: 0.8,
	},
});
