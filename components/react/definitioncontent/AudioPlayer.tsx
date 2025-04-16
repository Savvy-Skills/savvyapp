import React from 'react';
import './AudioPlayer.css';

interface AudioPlayerProps {
  isLoading: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  error: string | null;
  onTogglePlayPause: () => void;
  onSeek: (newTime: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  isLoading,
  isPlaying,
  duration,
  currentTime,
  error,
  onTogglePlayPause,
  onSeek
}) => {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  return (
    <div className="audio-player">
      {isLoading ? (
        <div className="loading-audio">Loading audio...</div>
      ) : error ? (
        <div className="audio-error">
          {error}
          <button onClick={() => onSeek(0)}>Retry</button>
        </div>
      ) : (
        <>
          <button 
            className={`play-button ${isPlaying ? 'pause' : 'play'}`} 
            onClick={onTogglePlayPause}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              step="0.1"
              className="progress-bar"
            />
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioPlayer; 