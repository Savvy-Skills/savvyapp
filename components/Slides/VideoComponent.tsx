import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Button } from 'react-native-paper';

interface VideoSlideProps {
  url: string;
  isActive: boolean;
  onVideoEnd?: () => void;
}

export default function VideoComponent({ url, isActive, onVideoEnd }: VideoSlideProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState({});
  const [currentTime, setCurrentTime] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      if (!hasPlayedOnce) {
        videoRef.current.playAsync();
        setHasPlayedOnce(true);
      }
    } else if (!isActive && videoRef.current) {
      videoRef.current.pauseAsync();
    }
  }, [isActive, currentTime, hasPlayedOnce]);


  const handlePlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
    setStatus(() => newStatus);
    if (newStatus.isLoaded) {
      setCurrentTime(newStatus.positionMillis || 0);
      
      // Check if the video has ended
      if (newStatus.didJustFinish) {
        if (onVideoEnd) {
          onVideoEnd();
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: url }}
        useNativeControls={Platform.OS !== 'web'}
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    aspectRatio: 9 / 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});