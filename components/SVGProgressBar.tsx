import React, { useState } from "react";

interface SVGProgressBarProps {
  progress: number;
  onChange: (progress: number) => void;
  width: number;
  height: number;
}

const SVGProgressBar: React.FC<SVGProgressBarProps> = ({
  progress,
  onChange,
  width,
  height,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    updateProgress(e);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      updateProgress(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateProgress = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = (x / width) * 100;
    onChange(Math.max(0, Math.min(newProgress, 100)));
  };

  return (
    <svg
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? "grabbing" : "pointer", position: "absolute", bottom: 0 }}
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="rgba(255, 255, 255, 0.3)"
      />
      <rect x="0" y="0" width={`${progress}%`} height={height} fill="white" />
      <circle cx={`${progress}%`} cy={height / 2} r={height / 2} fill="white" />
    </svg>
  );
};

export default SVGProgressBar;
