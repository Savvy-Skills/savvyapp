import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Text, Divider, IconButton, ToggleButton, Menu } from 'react-native-paper';
import RichText from '@/components/slides/RichTextComponent';

interface RichTextEditorComponentProps {
  value: string;
  onChange: (newText: string) => void;
  label?: string;
  placeholder?: string;
  numberOfLines?: number;
  showPreview?: boolean;
  enableColors?: boolean;
  enableFontSize?: boolean;
  previewHeight?: number;
  height?: number | string;
  editorHeight?: number | string;
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

export default function RichTextEditorComponent({ 
  value, 
  onChange,
  label = "Text",
  placeholder = "Enter text here...",
  numberOfLines = 6,
  showPreview = true,
  enableColors = false,
  enableFontSize = false,
  previewHeight = 100,
  height,
  editorHeight
}: RichTextEditorComponentProps) {
  const [text, setText] = useState(value || '');
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
    setText(value || '');
  }, [value]);

  // Update active styles whenever selection changes
  useEffect(() => {
    updateActiveStyles();
  }, [selection]);

  const handleTextChange = (newText: string) => {
    // Save current state to history before updating
    setHistory([...history, text]);
    
    setText(newText);
    onChange(newText);
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
      
      // Save current state to history before updating
      setHistory([...history, text]);
      
      if (containingTag) {
        // Clone the existing style
        const currentStyle = { ...containingTag.style } as any;
        
        // Toggle the style property
        if (currentStyle[styleKey] === styleValue) {
          if (nullValue !== undefined) {
            currentStyle[styleKey] = nullValue;
          } else {
            delete currentStyle[styleKey];
          }
        } else {
          currentStyle[styleKey] = styleValue;
        }
        
        // If no styles remain, remove the tag entirely
        if (Object.keys(currentStyle).length === 0) {
          const contentOnly = text.substring(containingTag.contentStart, containingTag.contentEnd);
          const newText = 
            text.substring(0, containingTag.start) + 
            contentOnly + 
            text.substring(containingTag.end);
          
          setText(newText);
          onChange(newText);
        } else {
          // Create new style string and update text
          const newStyleString = JSON.stringify(currentStyle);
          const fullContent = text.substring(containingTag.contentStart, containingTag.contentEnd);
          
          const newText = 
            text.substring(0, containingTag.start) + 
            `[style=${newStyleString}]${fullContent}[/style]` + 
            text.substring(containingTag.end);
          
          setText(newText);
          onChange(newText);
        }
      } else {
        // No containing tag, just add the style
        const styleObject = { [styleKey]: styleValue } as any;
        const selectedText = text.substring(selection.start, selection.end);
        const styleTag = `[style=${JSON.stringify(styleObject)}]${selectedText}[/style]`;
        
        const newText = 
          text.substring(0, selection.start) + 
          styleTag + 
          text.substring(selection.end);
        
        setText(newText);
        onChange(newText);
      }
    }
  };

  const toggleBold = () => toggleStyle('fontWeight', 'bold');
  const toggleItalic = () => toggleStyle('fontStyle', 'italic');
  const toggleUnderline = () => toggleStyle('textDecorationLine', 'underline');
  
  const applyColor = (color: string) => {
    toggleStyle('color', color);
    setColorMenuVisible(false);
  };
  
  const applyFontSize = (size: number) => {
    toggleStyle('fontSize', size);
    setFontSizeMenuVisible(false);
  };
  
  const undo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setText(previousState);
      onChange(previousState);
    }
  };

  const showColorMenu = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setColorMenuPosition({ x: pageX, y: pageY });
    setColorMenuVisible(true);
  };
  
  const showFontSizeMenu = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setFontSizeMenuPosition({ x: pageX, y: pageY });
    setFontSizeMenuVisible(true);
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36];

  return (
    <View style={[styles.container, height ? { height } : {}]}>
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
        
        {enableColors && (
          <IconButton 
            icon="palette"
            iconColor={activeStyles.color || undefined}
            onPress={showColorMenu}
            onTouchStart={Platform.OS === 'web' ? showColorMenu : undefined}
          />
        )}
        
        {enableFontSize && (
          <IconButton 
            icon="format-size"
            onPress={showFontSizeMenu}
            onTouchStart={Platform.OS === 'web' ? showFontSizeMenu : undefined}
          />
        )}
        
        {enableColors && (
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
        )}

        {enableFontSize && (
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
        )}
      </View>
      
      <TextInput
        ref={textInputRef}
        label={label}
        value={text}
        onChangeText={handleTextChange}
        onSelectionChange={handleSelectionChange}
        multiline
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        style={[styles.textArea, editorHeight ? { height: editorHeight } : {}]}
      />
      
      {showPreview && (
        <View style={styles.previewContainer}>
          <Text variant="titleSmall" style={styles.previewTitle}>Preview:</Text>
          <Divider style={styles.divider} />
          <View style={[styles.previewContent, { minHeight: previewHeight }]}>
            <RichText text={text} />
          </View>
        </View>
      )}
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
    minHeight: 100,
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