import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Text, Divider, Button, IconButton, Menu, ToggleButton } from 'react-native-paper';
import { ContentInfo } from '@/types/index';
import RichText from '@/components/slides/RichTextComponent';

interface RichTextEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

// Interface for style tag position info
interface StyleTagInfo {
  start: number;
  end: number;
  contentStart: number;
  contentEnd: number;
  styleString: string;
  style: object;
}

export default function RichTextEditor({ content, onContentChange }: RichTextEditorProps) {
  const [text, setText] = useState(content?.state || '');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [colorMenuVisible, setColorMenuVisible] = useState(false);
  const [colorMenuPosition, setColorMenuPosition] = useState({ x: 0, y: 0 });
  const [fontSizeMenuVisible, setFontSizeMenuVisible] = useState(false);
  const [fontSizeMenuPosition, setFontSizeMenuPosition] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    color: null as string | null,
    fontSize: null as number | null
  });
  const textInputRef = useRef<any>(null);

  useEffect(() => {
    if (content?.state) {
      setText(content.state);
    }
  }, [content]);

  // Update active styles whenever selection changes
  useEffect(() => {
    updateActiveStyles();
  }, [selection]);

  const handleTextChange = (newText: string) => {
    // Save current state to history before updating
    setHistory([...history, text]);
    
    setText(newText);
    onContentChange({
      type: 'Rich Text',
      state: newText
    });
  };

  const handleSelectionChange = (event: any) => {
    setSelection(event.nativeEvent.selection);
  };

  // Find all style tags in the text and their positions
  const findStyleTags = (input: string): StyleTagInfo[] => {
    const regex = /\[style=(\{.*?\})\](.*?)\[\/style\]/g;
    const tags: StyleTagInfo[] = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
      try {
        const style = JSON.parse(match[1]);
        tags.push({
          start: match.index,
          end: match.index + match[0].length,
          contentStart: match.index + `[style=${match[1]}]`.length,
          contentEnd: match.index + match[0].length - '[/style]'.length,
          styleString: match[1],
          style
        });
      } catch (e) {
        console.warn(`Invalid style string: ${match[1]}`);
      }
    }

    return tags;
  };

  // Find if the current selection is entirely within a style tag
  const findContainingStyleTag = (selStart: number, selEnd: number): StyleTagInfo | null => {
    const tags = findStyleTags(text);
    
    for (const tag of tags) {
      if (selStart >= tag.contentStart && selEnd <= tag.contentEnd) {
        return tag;
      }
    }
    
    return null;
  };

  // Update active styles based on the current selection
  const updateActiveStyles = () => {
    if (selection.start !== selection.end) {
      const containingTag = findContainingStyleTag(selection.start, selection.end);
      
      if (containingTag) {
        const style = containingTag.style as any;
        setActiveStyles({
          bold: style.fontWeight === 'bold',
          italic: style.fontStyle === 'italic',
          underline: style.textDecorationLine === 'underline',
          color: style.color || null,
          fontSize: style.fontSize || null
        });
      } else {
        // Reset if no containing tag
        setActiveStyles({
          bold: false,
          italic: false,
          underline: false,
          color: null,
          fontSize: null
        });
      }
    }
  };

  // Toggle style (add if not present, remove if present)
  const toggleStyle = (styleKey: string, styleValue: any, nullValue: any = undefined) => {
    if (selection.start !== selection.end) {
      const containingTag = findContainingStyleTag(selection.start, selection.end);
      
      if (containingTag) {
        // Clone the existing style
        const currentStyle = { ...containingTag.style } as any;
        
        // Toggle the style property
        if (currentStyle[styleKey] === styleValue) {
          // Remove the style property if it matches
          currentStyle[styleKey] = nullValue;
          if (nullValue === undefined) {
            delete currentStyle[styleKey];
          }
        } else {
          // Set the style property if it doesn't match
          currentStyle[styleKey] = styleValue;
        }
        
        // Create new style string and update text
        const newStyleString = JSON.stringify(currentStyle);
        const fullContent = text.substring(containingTag.contentStart, containingTag.contentEnd);
        
        const newText = 
          text.substring(0, containingTag.start) + 
          `[style=${newStyleString}]${fullContent}[/style]` + 
          text.substring(containingTag.end);
        
        handleTextChange(newText);
      } else {
        // No containing tag, just add the style
        const styleObject = { [styleKey]: styleValue } as any;
        const selectedText = text.substring(selection.start, selection.end);
        const styleTag = `[style=${JSON.stringify(styleObject)}]${selectedText}[/style]`;
        
        const newText = 
          text.substring(0, selection.start) + 
          styleTag + 
          text.substring(selection.end);
        
        handleTextChange(newText);
      }
      
      // Focus back on the input after button press
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 10);
    }
  };

  // Apply style to selected text, intelligently handling existing styles
  const applyStyle = (styleObject: object) => {
    if (selection.start !== selection.end) {
      // Check if selection is within an existing style tag
      const containingTag = findContainingStyleTag(selection.start, selection.end);
      
      if (containingTag) {
        // Merge styles instead of nesting them
        const mergedStyle = { ...containingTag.style, ...styleObject };
        const mergedStyleString = JSON.stringify(mergedStyle);
        
        // Extract the content inside the tag
        const selectedContent = text.substring(selection.start, selection.end);
        const fullContent = text.substring(containingTag.contentStart, containingTag.contentEnd);
        
        // Replace only the selected portion with updated style
        const beforeSelected = fullContent.substring(0, selection.start - containingTag.contentStart);
        const afterSelected = fullContent.substring(selection.end - containingTag.contentStart);
        
        // Create new text with merged style
        const newText = 
          text.substring(0, containingTag.start) + 
          `[style=${mergedStyleString}]${fullContent}[/style]` + 
          text.substring(containingTag.end);
        
        handleTextChange(newText);
      } else {
        // No containing tag found, apply style normally
        const selectedText = text.substring(selection.start, selection.end);
        const styleTag = `[style=${JSON.stringify(styleObject)}]${selectedText}[/style]`;
        
        const newText = 
          text.substring(0, selection.start) + 
          styleTag + 
          text.substring(selection.end);
        
        handleTextChange(newText);
      }
      
      // Focus back on the input after button press
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 10);
    }
  };

  const undo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      
      setText(previousState);
      setHistory(newHistory);
      
      onContentChange({
        type: 'Rich Text',
        state: previousState
      });
    }
  };

  const toggleBold = () => {
    toggleStyle('fontWeight', 'bold');
  };

  const toggleItalic = () => {
    toggleStyle('fontStyle', 'italic');
  };

  const toggleUnderline = () => {
    toggleStyle('textDecorationLine', 'underline');
  };

  const applyColor = (color: string) => {
    applyStyle({ color });
    setColorMenuVisible(false);
  };

  const applyFontSize = (size: number) => {
    applyStyle({ fontSize: size });
    setFontSizeMenuVisible(false);
  };

  const showColorMenu = (event: any) => {
    // Get the button position for the menu
    const { pageX, pageY } = event.nativeEvent;
    setColorMenuPosition({ x: pageX, y: pageY });
    setColorMenuVisible(true);
  };

  const showFontSizeMenu = (event: any) => {
    // Get the button position for the menu
    const { pageX, pageY } = event.nativeEvent;
    setFontSizeMenuPosition({ x: pageX, y: pageY });
    setFontSizeMenuVisible(true);
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36];

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <IconButton icon="undo" onPress={undo} disabled={history.length === 0} />
        
        <ToggleButton
          icon="format-bold"
          status={activeStyles.bold ? 'checked' : 'unchecked'}
          onPress={toggleBold}
        />
        
        <ToggleButton
          icon="format-italic"
          status={activeStyles.italic ? 'checked' : 'unchecked'}
          onPress={toggleItalic}
        />
        
        <ToggleButton
          icon="format-underline"
          status={activeStyles.underline ? 'checked' : 'unchecked'}
          onPress={toggleUnderline}
        />
        
        <IconButton 
          icon="palette"
		  iconColor={activeStyles.color || undefined}
          onPress={showColorMenu}
          onTouchStart={Platform.OS === 'web' ? showColorMenu : undefined}
        />
        
        <IconButton 
          icon="format-size"
          onPress={showFontSizeMenu}
          onTouchStart={Platform.OS === 'web' ? showFontSizeMenu : undefined}
        />
        
        <Menu
          visible={colorMenuVisible}
          onDismiss={() => setColorMenuVisible(false)}
          anchor={{ x: colorMenuPosition.x, y: colorMenuPosition.y }}
        >
          {colors.map((color) => (
            <Menu.Item
              key={color}
              title={color}
              onPress={() => applyColor(color)}
              titleStyle={{ color }}
              leadingIcon="circle"
			  theme={{ colors: { onSurfaceVariant: color } }}
            />
          ))}
        </Menu>

        <Menu
          visible={fontSizeMenuVisible}
          onDismiss={() => setFontSizeMenuVisible(false)}
          anchor={{ x: fontSizeMenuPosition.x, y: fontSizeMenuPosition.y }}
        >
          {fontSizes.map((size) => (
            <Menu.Item
              key={size}
              title={`${size}px`}
              onPress={() => applyFontSize(size)}
              titleStyle={{ fontSize: size * 0.8 }}
            />
          ))}
        </Menu>
      </View>
      
      <TextInput
        ref={textInputRef}
        label="Content Text"
        value={text}
        onChangeText={handleTextChange}
        onSelectionChange={handleSelectionChange}
        multiline
        numberOfLines={8}
        style={styles.textArea}
      />
      
      <View style={styles.previewContainer}>
        <Text variant="titleMedium" style={styles.previewTitle}>Preview:</Text>
        <Divider style={styles.divider} />
        <View style={styles.previewContent}>
          <RichText text={text} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 4,
    backgroundColor: '#f5f5f5',
  },
  textArea: {
    marginBottom: 16,
    minHeight: 200,
  },
  previewContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  previewTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  previewContent: {
    minHeight: 100,
  },
}); 