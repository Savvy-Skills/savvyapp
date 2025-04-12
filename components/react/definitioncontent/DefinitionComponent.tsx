'use dom'
import React from 'react';
import './DefinitionStyles.css';
import '../index.css';
interface DefinitionComponentProps {
  title: string;
  content: string;
  theme: string;
}

const DefinitionComponent: React.FC<DefinitionComponentProps> = ({
  title = 'Definition',
  content,
  theme = 'purple'
}) => {
  // Parse content to highlight text between special markers
  const parseContent = (text: string) => {
    const parts = text.split(/(\{\{|\}\})/);
    let isHighlighted = false;
    
    return parts.map((part, index) => {
      if (part === '{{') {
        isHighlighted = true;
        return null;
      } else if (part === '}}') {
        isHighlighted = false;
        return null;
      } else if (isHighlighted) {
        return <span key={index} className={`highlighted-text-${theme}`}>{part}</span>;
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  // Check if this is a card theme
  const isCardTheme = theme.startsWith('cards-');
  
  // Function to get container class based on theme
  const getContainerClass = () => {
    const isRounded = ['modern-purple', 'modern-cream'].includes(theme);
    return `definition-container theme-${theme} ${isRounded ? 'rounded' : ''}`;
  };

  // For card themes, title goes inside the content
  if (isCardTheme) {
    return (
      <div className={getContainerClass()}>
        <div className="card-shadow"></div>
        <div className="definition-content">
          <div className="definition-header">
            <h3 className={`definition-title highlighted-text-${theme} title-${theme}`}>
              {title}
            </h3>
          </div>
          {parseContent(content)}
        </div>
      </div>
    );
  }

  // Standard layout for non-card themes
  return (
    <div className={getContainerClass()}>
      <div className="definition-header">
        <h3 className={`definition-title highlighted-text-${theme} title-${theme}`}>
          <span className={`definition-arrow arrow-${theme}`}>▶</span> {title}
        </h3>
      </div>
      <div className="definition-content">
        {parseContent(content)}
      </div>
    </div>
  );
};

export default DefinitionComponent;
