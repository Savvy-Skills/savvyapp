import React, { memo } from 'react';

interface GrayscaleComparisonProps {
  colorValue: string;
  grayscaleValue: string;
}

const GrayscaleComparison: React.FC<GrayscaleComparisonProps> = memo(({ 
  colorValue, 
  grayscaleValue 
}) => {
  return (
    <div className="grayscale-comparison">
      <div className="color-pixel" style={{ backgroundColor: colorValue }}>
        <span>Color</span>
      </div>
      <div className="grayscale-pixel" style={{ backgroundColor: grayscaleValue }}>
        <span>Grayscale</span>
      </div>
    </div>
  );
});

export default GrayscaleComparison; 