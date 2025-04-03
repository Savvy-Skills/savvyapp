'use dom'

import React, { useRef, useEffect, forwardRef } from 'react';

interface PixelGridCanvasProps {
  rgbValues?: Array<[number, number, number]>;
  grayscaleValues?: Array<number>;
  resolution: number;
  width?: number;
  height?: number;
  mode: 'rgb' | 'grayscale';
  onPixelHover?: (index: number) => void;
  onPixelLeave?: () => void;
  gap?: number; // Gap between pixels
  isReconstruction?: boolean; // Flag for reconstruction mode
}

const PixelGridCanvas = forwardRef<HTMLCanvasElement, PixelGridCanvasProps>(({
  rgbValues = [],
  grayscaleValues = [],
  resolution = 30,
  width = 320,
  height = 320,
  mode = 'rgb',
  onPixelHover,
  onPixelLeave,
  gap = 1, // Default 1px gap
  isReconstruction = false // Default not reconstruction mode
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredPixelRef = useRef<number | null>(null);
  
  // In reconstruction mode, use zero gap
  const effectiveGap = isReconstruction ? 0 : gap;
  
  // Calculate to ensure grid fills the entire canvas
  const cellWidth = width / resolution;
  const cellHeight = height / resolution;
  const pixelWidth = isReconstruction ? cellWidth : cellWidth - effectiveGap;
  const pixelHeight = isReconstruction ? cellHeight : cellHeight - effectiveGap;

  // Draw the pixel grid on canvas
  useEffect(() => {
    const canvas = ref ? (ref as React.RefObject<HTMLCanvasElement>).current : canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas - use different background for reconstruction vs grid
    ctx.fillStyle = isReconstruction ? '#000000' : '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    const values = mode === 'rgb' ? rgbValues : grayscaleValues;
    if (!values || values.length === 0) return;

    // Draw pixels
    for (let i = 0; i < values.length; i++) {
      const row = Math.floor(i / resolution);
      const col = i % resolution;
      
      let color;
      if (mode === 'rgb') {
        const [r, g, b] = rgbValues[i] || [0, 0, 0];
        color = `rgb(${r}, ${g}, ${b})`;
      } else {
        const grayValue = Math.round((grayscaleValues[i] || 0) * 255);
        color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      }
      
      ctx.fillStyle = color;
      
      // Position pixels - in reconstruction mode they touch with no gaps
      ctx.fillRect(
        col * cellWidth, 
        row * cellHeight, 
        pixelWidth, 
        pixelHeight
      );
    }
  }, [rgbValues, grayscaleValues, resolution, width, height, mode, 
      cellWidth, cellHeight, pixelWidth, pixelHeight, effectiveGap, isReconstruction]);

  // Only set up mouse event handlers if not in reconstruction mode
  const getPixelFromPosition = (x: number, y: number): number => {
    if (isReconstruction) return -1; // Not needed in reconstruction mode
    
    const canvas = ref ? (ref as React.RefObject<HTMLCanvasElement>).current : canvasRef.current;
    if (!canvas) return -1;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;
    
    // Calculate column and row based on cell dimensions
    const col = Math.floor(canvasX / cellWidth);
    const row = Math.floor(canvasY / cellHeight);
    
    if (col < 0 || col >= resolution || row < 0 || row >= resolution) {
      return -1;
    }
    
    return row * resolution + col;
  };

  const handleMouseMove = isReconstruction ? undefined : (e: React.MouseEvent) => {
    const pixelIndex = getPixelFromPosition(e.clientX, e.clientY);
    
    if (pixelIndex !== -1 && pixelIndex !== hoveredPixelRef.current) {
      hoveredPixelRef.current = pixelIndex;
      onPixelHover && onPixelHover(pixelIndex);
    } else if (pixelIndex === -1 && hoveredPixelRef.current !== null) {
      hoveredPixelRef.current = null;
      onPixelLeave && onPixelLeave();
    }
  };

  const handleMouseLeave = isReconstruction ? undefined : () => {
    hoveredPixelRef.current = null;
    onPixelLeave && onPixelLeave();
  };

  return (
    <canvas
      ref={ref || canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'block',
        touchAction: 'none',
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: isReconstruction ? '4px' : '0'
      }}
    />
  );
});

export default PixelGridCanvas; 