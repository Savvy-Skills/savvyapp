import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasProgressBarProps {
  progress: number;
  onChange: (progress: number) => void;
  width: number;
  height: number;
  duration: number;
  currentTime: number;
}

const CanvasProgressBar: React.FC<CanvasProgressBarProps> = ({ 
  progress, 
  onChange, 
  width, 
  height, 
  duration,
  currentTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);

  const drawProgressBar = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Draw progress
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width * (progress / 100), height);

    // Draw hover indicator
    if (isHovering) {
      ctx.beginPath();
      ctx.arc(hoverPosition, height / 2, height, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    }

    // Draw current time indicator (circle)
    const currentTimePosition = (currentTime / duration) * width;
    ctx.beginPath();
    ctx.arc(currentTimePosition, height / 2, height, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [progress, width, height, isHovering, hoverPosition, currentTime, duration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawProgressBar(ctx);
  }, [drawProgressBar]);

  const updateProgress = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const newProgress = (x / width) * 100;
    onChange(Math.max(0, Math.min(newProgress, 100)));
  }, [width, onChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    updateProgress(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    if (isDragging) {
      let clientX = e.clientX;
      if (clientX < rect.left) clientX = rect.left;
      if (clientX > rect.right) clientX = rect.right;
      updateProgress(clientX);
    }

    if (e.clientX >= rect.left && e.clientX <= rect.right && 
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
      setIsHovering(true);
      setHoverPosition(e.clientX - rect.left);
    } else {
      setIsHovering(false);
    }
  }, [isDragging, updateProgress]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer', position: "absolute", bottom: 0 }}
    />
  );
};

export default CanvasProgressBar;