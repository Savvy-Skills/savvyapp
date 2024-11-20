import React, { useRef, useState, useEffect, useCallback } from "react";
import { useCourseStore } from "@/store/courseStore";
import CanvasProgressBar from "./CanvasProgressBar";

interface VideoSlideProps {
  url: string;
  index: number;
}

const WebVideoComponent: React.FC<VideoSlideProps> = ({ url, index }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    nextSlide,
    completedSlides,
    checkSlideCompletion,
    currentSlideIndex,
  } = useCourseStore();
  const isActive = index === currentSlideIndex;
  const firstTime = useRef<boolean>(false);
  const hasAutoplayed = useRef<boolean>(false);

  useEffect(() => {
    if (isActive && videoRef.current && !hasAutoplayed.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        hasAutoplayed.current = true;
      }).catch(error => console.error("Error playing video:", error));
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const newProgress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(newProgress);
      setCurrentTime(videoRef.current.currentTime);
      if (!completedSlides[index] && newProgress >= 80) {
        checkSlideCompletion({ progress: newProgress });
      }
    }
  }, [completedSlides, index, checkSlideCompletion]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (!firstTime.current) {
    //   nextSlide();
      firstTime.current = true;
    }
  }, [nextSlide]);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => console.error("Error playing video:", error));
      }
      setIsPlaying(!isPlaying);
	  console.log("Vid", {isPlaying});
    }
  }, [isPlaying]);

  const handleProgressChange = useCallback((newProgress: number) => {
    if (videoRef.current) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
      setCurrentTime(newTime);
    }
  }, []);



  return (
    <div className="video-container">
      <div ref={containerRef} className="video-wrapper" onClick={togglePlayPause}>
        <video
          ref={videoRef}
          src={url}
          className="video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
        <CanvasProgressBar
          progress={progress}
          onChange={handleProgressChange}
          width={containerRef.current?.clientWidth || 0}
          height={8}
          duration={duration}
          currentTime={currentTime}
        />
      </div>
    </div>
  );
};

export default WebVideoComponent;