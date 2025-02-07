import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import React from "react";
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";
import { Slide } from "@/types";
import { Icon } from "react-native-paper";

const SLIDE_TYPES_ICONS = {
	"Assessment": "cursor-default-click-outline",
	"Activity": "cursor-default-click-outline",
	"Content": "script-text-outline",
	"Custom": "sign-text"
};

function getSlideIconAndText(slide: Slide) {
	const icon = SLIDE_TYPES_ICONS[slide.type];
	switch (slide.type) {
		case "Custom":
			return { icon: slide.subtype === "intro" ? "sign-text" : "flag-checkered", text: slide.subtype };
		case "Assessment":
		case "Activity":
			return { icon: "cursor-default-click-outline", text: "Interactive" };
		default:
			return { icon, text: slide.type };
	}
}

const ViewInfo = () => {
	const { currentView, currentSlideIndex } = useCourseStore();
	const { width } = useWindowDimensions();
	const currentModuleName = currentView?.module_info.name;
	const currentSlide = currentView?.slides[currentSlideIndex];
	const paddingHorizontal = width <= 600 ? 8 : 0;
	if (!currentSlide) return null;
	const { icon, text } = getSlideIconAndText(currentSlide);

	return (
		<View
			style={[
				styles.centeredMaxWidth,
				styles.slideWidth,
				localStyles.container,
				{ paddingHorizontal }
			]}
		>
			<View style={localStyles.moduleContainer}>
				<Image
					source={require("@/assets/images/svgs/savvylogo.svg")}
					style={{
						height: 16,
						width: 16,
					}}
				/>
				<Text style={localStyles.text}>{currentModuleName}:</Text>
				<Text style={[localStyles.text, localStyles.view]}>
					{currentView?.name}
				</Text>
			</View>
			<View style={localStyles.moduleContainer}>
				<Icon source={icon} size={16} color={Colors.text} />
				<Text style={[localStyles.text, localStyles.slideInfo]}>
					{text}
				</Text>
			</View>
		</View>
	);
};

export default ViewInfo;

const localStyles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	moduleContainer: {
		flexDirection: "row",
		marginBottom: 10,
		alignItems: "center",
		gap: 4,
	},
	text: {
		fontSize: 12,
		fontWeight: 600,
	},
	slideInfo: {
		color: Colors.text,
		fontSize: 14,
		textTransform: "capitalize",
	},
	view: {
		color: Colors.primary,
	},
});
