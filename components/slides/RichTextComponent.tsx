import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

type StyleTagProps = {
  text: string;
};

const parseText = (text: string): (JSX.Element | string)[] => {
  const regex = /\[style=(\{.*?\})\](.*?)\[\/style\]/g;
  let match;
  const elements: (JSX.Element | string)[] = [];
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const styleString = match[1];
    const content = match[2];

    // Add plain text before the current match
    if (lastIndex < match.index) {
      elements.push(text.slice(lastIndex, match.index));
    }

    // Convert the style string to a valid object
    try {
      const style = JSON.parse(styleString);
      elements.push(
        <Text key={match.index} style={style}>
          {content}
        </Text>
      );
    } catch (e) {
      console.warn(`Invalid style string: ${styleString}`);
      elements.push(fullMatch); // Keep the original tag if invalid
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
};

const RichText: React.FC<StyleTagProps> = ({ text }) => {
	if (!text) return null;
  // Split the text by newlines
  const lines = text.split('\\n');
  // Parse each line and wrap it in a <Text> element
  const parsedLines = lines.map((line, index) => (
    <Text key={index} style={{ flexDirection: 'row' }}>
      {parseText(line)}
    </Text>
  ));

  return <View style={{flexDirection: 'column'}}>{parsedLines}</View>;
};

export default RichText;
