import React, { useState } from 'react';
import './ExpandableFact.css';

interface ExpandableFactProps {
  title: string;
  emoji?: string;
  color?: string;
  children?: React.ReactNode;
}

const ExpandableFact: React.FC<ExpandableFactProps> = ({ 
  title, 
  emoji = "💡", 
  color = "#0ea5e9", 
  children 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className="expandable-fact" 
      style={{ 
        backgroundColor: `${color}10`, // Light background based on color
        borderColor: `${color}30`      // Border with some opacity
      }}
    >
      <div className="fact-header" onClick={toggleExpand}>
        <div className="fact-title-container">
          <span className="fact-emoji">{emoji}</span>
          <span className="fact-title" style={{ color: color }}>{title}</span>
        </div>
        <button className="expand-button">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </button>
      </div>
      {isExpanded && (
        <div className="fact-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableFact; 