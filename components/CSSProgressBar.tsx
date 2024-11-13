import React, { useState, useRef } from 'react';
import './CSSProgressBar.css';

interface CSSProgressBarProps {
  progress: number;
  onChange: (progress: number) => void;
}

const CSSProgressBar: React.FC<CSSProgressBarProps> = ({ progress, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateProgress(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateProgress(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = (x / rect.width) * 100;
    onChange(Math.max(0, Math.min(newProgress, 100)));
  };

  return (
    <div
      ref={progressBarRef}
      className="progress-bar-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
    >
      <div className="progress-bar-background" />
      <div className="progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
      <div className="progress-indicator" style={{ left: `${progress}%` }} />
    </div>
  );
};

export default CSSProgressBar;