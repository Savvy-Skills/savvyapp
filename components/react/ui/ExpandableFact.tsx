import React, { useState, useMemo } from 'react';
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
  
  // Process color to handle CSS variables and regular colors
  const styles = useMemo(() => {
    // Check if color is a CSS variable
    const isCssVariable = color.startsWith('var(--');
    
    if (isCssVariable) {
      return {
        backgroundColor: `rgb(from ${color} r g b / 0.1)`, // 10% opacity
        borderColor: `rgb(from ${color} r g b / 0.3)`,     // 30% opacity
        titleColor: color
      };
    }
    
    // Regular color handling (as before)
    return {
      backgroundColor: `${color}10`,
      borderColor: `${color}30`,
      titleColor: color
    };
  }, [color]);

  return (
    <div 
      className="expandable-fact" 
      style={{ 
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor
      }}
    >
      <div className="fact-header" onClick={toggleExpand}>
        <div className="fact-title-container">
          <span className="fact-emoji">{emoji}</span>
          <span className="fact-title" style={{ color: styles.titleColor }}>{title}</span>
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