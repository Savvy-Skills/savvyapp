import { useModuleStore } from "@/store/moduleStore";
import React, { useRef, useEffect, useState } from "react";

interface VideoSlideProps {
  url: string;
  isActive: boolean;
  index: number;
}

const WebVideoComponent: React.FC<VideoSlideProps> = ({
  url,
  isActive,
  index,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const { nextSlide, completedSlides, checkSlideCompletion } = useModuleStore();

  useEffect(() => {
    if (isActive && videoRef.current && !hasPlayed) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasPlayed(true);
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const locProgress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(locProgress);
	  if (!completedSlides[index] && locProgress >= 80) {
		checkSlideCompletion({ progress: locProgress});
	  }
    }
  };

  const handleEnded = () => {
    nextSlide();
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const clickedValue = x / rect.width;
      videoRef.current.currentTime = clickedValue * videoRef.current.duration;
    }
  };

  return (
    <div className="video-container">
      <div className="video-wrapper" onClick={togglePlayPause}>
        <video
          ref={videoRef}
          src={url}
          className="video"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
        <div
          ref={progressRef}
          className="progress-bar-container"
          onClick={handleProgressBarClick}
        >
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default WebVideoComponent;
