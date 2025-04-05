import React, { memo } from 'react';

interface PixelGridProps {
  highlightColor: string;
}

const PixelGrid: React.FC<PixelGridProps> = memo(({ highlightColor }) => {
  return (
    <div className="pixel-grid">
      {Array(64).fill(0).map((_, i) => (
        <div key={i} className="single-pixel" style={{
          backgroundColor: i % 9 === 0 ? highlightColor : '#f0f0f0'
        }}></div>
      ))}
    </div>
  );
});

export default PixelGrid; 