import ScreenWrapper from "@/components/screens/ScreenWrapper";
import React, { useEffect } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

import { useCourseStore } from "@/store/courseStore";

import SlideRenderer from "@/components/slides/SlideRenderer";
import AssessmentSlide from "@/components/slides/AssessmentSlide";
import SingleChoice from "@/components/slides/assessments/SingleChoice";
import { useVideoPlayer, VideoView } from "expo-video";

export default function DebugScreen() {

	const { clearCurrentView, getViewById, currentView } = useCourseStore();

	const player = useVideoPlayer("https://storage.googleapis.com/xfpf-pye0-4nzu.n7d.xano.io/vault/JS-TssR_/rVCpdbDQw21wS2CcnrZEPojOHa8/huXURg../Video1.mp4");

	useEffect(() => {
		clearCurrentView();
		getViewById(Number(1));
	}, []);

	const currentSlideIndex = 2;

	return (
		<ScreenWrapper style={{ overflow: "hidden" }}>
			<View style={styles.contentContainer}>
				<VideoView contentFit="contain" style={styles.video} player={player} />
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1, 
		alignItems: 'center',
	},
	video: {
		height: "100%",
		width: Platform.OS !== "web" ? "100%" : undefined,
	},
	controlsContainer: {
		padding: 10,
	},
});
