import React, { useEffect, useState, useRef } from 'react';
import './DefinitionStyles.css';

interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

interface Segment {
  words: Word[];
}

interface TimestampedTranscription {
  segments: Segment[];
}

interface WordRender {
  text: string;
  bold: boolean;
}

interface DefinitionComponentProps {
  definitionText?: string;
  timestampedTranscription: TimestampedTranscription;
  title?: string;
  theme?: string;
  currentAudioTime?: number;
}

const defaultText = `What is {{perception}}?
Perception is more than just {{sensing}}.
It's the process of {{turning}} raw data into meaning.
Humans and machines both do this, but in very different ways.
A human sees a cat's shape for an movement.

The brain processes the shapes and colors in the visual cortex.
Our brain uses memory and past experience to say, that's a cat.
A machine sees the cat as a grid of tiny {{colored}} squares called pixels.
It uses {{patterns}} it has learned from lots of other cat pictures to figure out.
Based on training data, it makes a guess.
That looks like a cat.
Whether it's a person or a machine, perception is what turns simple signals into understanding and action.`;

const default_transcript = {} as TimestampedTranscription;

const DefinitionComponent: React.FC<DefinitionComponentProps> = ({ 
  definitionText = defaultText, 
  timestampedTranscription = default_transcript,
  title = 'Definition',
  theme = 'purple',
  currentAudioTime = 0
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [words, setWords] = useState<Word[]>([]);
  const previousTimeRef = useRef<number>(0);

  useEffect(() => {
    if (timestampedTranscription && timestampedTranscription.segments.length > 0) {
      const transcriptWords = timestampedTranscription.segments.flatMap(segment => segment.words);
      setWords(transcriptWords);
    }
  }, [timestampedTranscription]);

  useEffect(() => {
    if (words.length === 0 || currentAudioTime === undefined) return;

    const prevTime = previousTimeRef.current;
    const candidates = words.filter(word => word.start >= prevTime && word.start <= currentAudioTime);
    const lastIndex = candidates.length > 0 ? words.indexOf(candidates[candidates.length - 1]) : -1;

    if (lastIndex !== -1 && lastIndex !== currentWordIndex) {
      setCurrentWordIndex(lastIndex);
    } else if (currentAudioTime === 0 && currentWordIndex !== -1) {
      setCurrentWordIndex(-1);
    }

    previousTimeRef.current = currentAudioTime;
  }, [currentAudioTime, words, currentWordIndex]);

  const lines = definitionText.split('\n');
  let wordCounter = 0;

  const isCardTheme = theme.startsWith('cards-');

  const getContainerClass = () => {
    const isRounded = ['modern-purple', 'modern-cream'].includes(theme);
    return `definition-container theme-${theme} ${isRounded ? 'rounded' : ''}`;
  };

  const renderHighlightedContent = () => {
    return lines.map((line, pIndex) => {
      if (line.trim() === '') return <br key={pIndex} />;

      const parts: WordRender[] = [];
      let currentPosition = 0;
      const multiWordRegex = /{{(.+?)}}/g;
      let match;

      while ((match = multiWordRegex.exec(line)) !== null) {
        if (match.index > currentPosition) {
          const textBefore = line.substring(currentPosition, match.index).trim();
          if (textBefore) {
            textBefore.split(' ').forEach(word => {
              if (word) parts.push({ text: word, bold: false });
            });
          }
        }

        const matchedText = match[1];
        const punctuationAfter = line.substring(match.index + match[0].length, match.index + match[0].length + 1).match(/[.,!?:;]/);

        if (punctuationAfter) {
          parts.push({ text: matchedText + punctuationAfter[0], bold: true });
          currentPosition = match.index + match[0].length + 1;
        } else {
          parts.push({ text: matchedText, bold: true });
          currentPosition = match.index + match[0].length;
        }
      }

      if (currentPosition < line.length) {
        const textAfter = line.substring(currentPosition).trim();
        if (textAfter) {
          textAfter.split(' ').forEach(word => {
            if (word) parts.push({ text: word, bold: false });
          });
        }
      }

      return (
        <p key={pIndex} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {parts.map((wordObj, wIndex) => {
            const globalIndex = wordCounter++;
            const highlight = globalIndex === currentWordIndex || globalIndex === currentWordIndex - 1;

            return (
              <span
                key={wIndex}
                className={`text-part ${wordObj.bold ? `important-text-${theme}` : ''} ${highlight ? `highlighted-text-${theme}` : ''}`}
              >
                {wordObj.text}
                {!wordObj.text.match(/[.,!?:;]$/) ? ' ' : ''}
              </span>
            );
          })}
        </p>
      );
    });
  };

  const renderHighlightedTitle = () => {
    if (!title) return null;
    const titleWords = title.split(' ');
    let titleWordIndices = [];
    for (let i = 0; i < titleWords.length; i++) {
      titleWordIndices.push(wordCounter + i);
    }

    return (
      <h3 className={`definition-title title-${theme}`}>
        {isCardTheme ? '' : <span className={`definition-arrow arrow-${theme}`}>▶</span>}
        {titleWords.map((word, index) => {
          const globalIndex = wordCounter++;
          const highlight = globalIndex === currentWordIndex || globalIndex === currentWordIndex - 1;
          return (
            <span
              key={index}
              className={`text-part ${highlight ? `highlighted-text-${theme}` : ''}`}
            >
              {word}{' '}
            </span>
          );
        })}
      </h3>
    );
  };

  if (isCardTheme) {
    return (
      <div className={getContainerClass()}>
        <div className="card-shadow"></div>
        <div className="definition-content">
          <div className="definition-header">
            {renderHighlightedTitle()}
          </div>
          {renderHighlightedContent()}
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClass()}>
      <div className="definition-header">
        {renderHighlightedTitle()}
      </div>
      <div className="definition-content">
        {renderHighlightedContent()}
      </div>
    </div>
  );
};

export default DefinitionComponent;
