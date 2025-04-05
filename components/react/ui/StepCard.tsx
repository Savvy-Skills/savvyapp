import React, { ReactNode } from 'react';
import './StepCard.css';

interface StepCardProps {
  stepNumber: number;
  title: string;
  children: ReactNode;
  color?: string;
}

const StepCard: React.FC<StepCardProps> = ({ 
  stepNumber, 
  title, 
  children, 
  color = '#0ea5e9'  // Default blue color
}) => {
  return (
    <div className="step-card" style={{ borderLeftColor: color }}>
      <div className="step-header">
        <div className="step-number" style={{ 
          color: color,
          backgroundColor: `${color}10` // Adding transparency
        }}>
          Step {stepNumber}
        </div>
        <div className="step-title" style={{ color: '#f97316' }}>{title}</div>
      </div>
      <div className="step-content">
        {children}
      </div>
    </div>
  );
};

export default StepCard; 