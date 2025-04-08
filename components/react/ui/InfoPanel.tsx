import React from 'react';
import './InfoPanel.css';

interface InfoPanelProps {
  children: React.ReactNode;
  color?: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  children, 
  color = '#0ea5e9' // Default blue color
}) => {
  return (
    <div 
      className="info-panel" 
      style={{ 
        borderLeftColor: color,
        backgroundColor: `${color}10` // Light background with 10% opacity
      }}
    >
      {children}
    </div>
  );
};

export default InfoPanel; 