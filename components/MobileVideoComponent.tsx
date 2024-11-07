import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";

import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useModuleStore } from "@/store/moduleStore";

interface VideoSlideProps {
  url: string;
  index: number;
}

const MobileVideoComponent: React.FC<VideoSlideProps> = ({ url, index }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>(
    {} as AVPlaybackStatus
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const hasEndedRef = useRef(false);
  const {
    nextSlide,
    completedSlides,
    checkSlideCompletion,
    currentSlideIndex,
  } = useModuleStore();

  const screenHeight = Dimensions.get("window").height;
  const videoHeight = screenHeight;
  const videoWidth = (videoHeight * 9) / 16;
  const isActive = index === currentSlideIndex;

  useEffect(() => {
    if (isActive && videoRef.current && !hasPlayed) {
      videoRef.current.playAsync();
      setIsPlaying(true);
      setHasPlayed(true);
    } else if (!isActive && videoRef.current) {
      videoRef.current.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive, hasPlayed]);

  const handlePlaybackStatusUpdate = useCallback(
    (newStatus: AVPlaybackStatus) => {
      setStatus(newStatus);
      if (newStatus.isLoaded) {
        const progress = newStatus.positionMillis / newStatus.durationMillis;
        progressAnim.setValue(progress);

        if (isActive) {
          const locProgress = progress * 100;
          if (!completedSlides[index] && locProgress >= 80) {
            checkSlideCompletion({ progress: locProgress });
          }
        }

        if (newStatus.didJustFinish && !hasEndedRef.current) {
          hasEndedRef.current = true;
          nextSlide();
        } else if (!newStatus.didJustFinish) {
          hasEndedRef.current = false;
        }
      }
    },
    [progressAnim, isActive]
  );

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onProgressBarPress = (event: any) => {
    if (videoRef.current && status.isLoaded) {
      const { locationX } = event.nativeEvent;
      const progress = locationX / videoWidth;
      const newPosition = progress * status.durationMillis;
      videoRef.current.setPositionAsync(newPosition);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={togglePlayPause}>
        <View
          style={[styles.videoWrapper, { width: videoWidth, height: "100%" }]}
        >
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: url }}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={onProgressBarPress}>
        <View style={[styles.progressBarContainer, { width: videoWidth }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  videoWrapper: {
    aspectRatio: 9 / 16,
  },
  video: {
    flex: 1,
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
});

export default MobileVideoComponent;
