import React, { useRef, useState, useEffect, useCallback } from "react";
import { useCourseStore } from "@/store/courseStore";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View, Button } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { VideoSlideProps } from "./slides/content/VideoSlide";

const VideoComponent: React.FC<VideoSlideProps> = ({ url, index, canComplete }) => {
  const {
    completedSlides,
    checkSlideCompletion,
    currentSlideIndex,
  } = useCourseStore();
  const isActive = index === currentSlideIndex;
  const [duration, setDuration] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const firstTime = useRef(true);

  const player = useVideoPlayer(url, (player) => {
    player.timeUpdateEventInterval = 0.5;
    player.muted = true;
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

  useEffect(() => {
    if (!isActive && player.playing) {
      player.pause();
    }
    if (isActive && firstTime.current) {
      player.play();
      firstTime.current = false;
      setTimeout(() => {
        player.replay();
        player.pause();
        player.muted = false;
        setShowPlaceholder(false);
      }, 500);
    }
  }, [isActive]);

  useEffect(() => {
    if (status === "readyToPlay" && duration === 0) {
      setDuration(player.duration);
    }
  }, [status]);

  //   Current time and duration are in seconds, calculate progress on a 100% scale

  useEffect(() => {
    const progress = (currentTime / duration) * 100;
    if (canComplete&& progress > 80 && !completedSlides[index]) {
      checkSlideCompletion({ completed: true });
    }
  }, [currentTime]);

  return (
    <View style={styles.contentContainer}>
      {showPlaceholder ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.videoContainer}>
          <VideoView style={styles.video} player={player} allowsFullscreen />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxHeight: "100%",
    paddingHorizontal: 8,
    width: "100%",
  },
  videoContainer: {
    overflow: "hidden",
    maxHeight: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controlsContainer: {
    padding: 10,
  },
});

export default VideoComponent;
