import React, { useRef, useState, useEffect, useCallback } from "react";
import { useCourseStore } from "@/store/courseStore";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Platform, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { VideoSlideProps } from "./slides/content/VideoSlide";
import { useViewStore } from "@/store/viewStore";

const VideoComponent: React.FC<VideoSlideProps> = ({ url, index, canComplete }) => {

	const { completeSlide, currentSlideIndex, slides } = useViewStore();

	const [duration, setDuration] = useState(0);
	const [showPlaceholder, setShowPlaceholder] = useState(Platform.OS === "web" ? true : false);
	const firstTime = useRef(true);

	const player = useVideoPlayer(url, (player) => {
		player.timeUpdateEventInterval = 0.5;
		player.muted = Platform.OS === "web" ? true : false;
	});

	const { status, error } = useEvent(player, "statusChange", {
		status: player.status,
	});

	const { currentTime } = useEvent(player, "timeUpdate", {
		currentTime: 0,
		currentLiveTimestamp: 0,
		currentOffsetFromLive: 0,
		bufferedPosition: 0,
	});

	// useEffect(() => {

	// 	if (firstTime.current && Platform.OS === "web") {
	// 		player.play();
	// 		firstTime.current = false;
	// 		setTimeout(() => {
	// 			player.seekBy(0);
	// 			player.pause();
	// 			player.muted = false;
	// 			setShowPlaceholder(false);
	// 		}, 500);
	// 	}
	// }, [isActive, player]);

	useEffect(() => {
		if (status === "readyToPlay" && duration === 0) {
			setDuration(player.duration);
		}
	}, [status]);

	//   Current time and duration are in seconds, calculate progress on a 100% scale

	useEffect(() => {
		const progress = (currentTime / duration) * 100;
		if (canComplete && progress > 80 && !slides[currentSlideIndex].completed) {
			completeSlide();
		}
	}, [currentTime]);

	// if (showPlaceholder) {
	// 	return <ActivityIndicator />;
	// }

	return (
		<View style={styles.contentContainer}>
			<VideoView style={styles.video} player={player} allowsFullscreen />
		</View>
	);
};

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 240,
		alignSelf: Platform.OS === "web" ? "center" : undefined,
	},
	video: {
		height: "100%",
		width: "100%",
	},
	controlsContainer: {
		padding: 10,
	},
});

export default VideoComponent;
