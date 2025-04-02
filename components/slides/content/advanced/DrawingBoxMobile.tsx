import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent, Image } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';

interface Point {
  x: number;
  y: number;
}

interface Path {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
}

interface DrawingBoxProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  showInverted?: boolean;
  captureInterval?: number;
}

const DrawingBox: React.FC<DrawingBoxProps> = ({
  width = 300,
  height = 300,
  strokeWidth = 10,
  strokeColor = 'white',
  showInverted = true,
  captureInterval = 3000,
}) => {
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const box = useRef<View>(null);
  const invertedViewRef = useRef<ViewShot>(null);

  // Calculate dimensions based on whether we're showing the inverted view
  const containerWidth = showInverted ? width * 2 + 10 : width; // Add 10px gap between views
  const drawingWidth = showInverted ? width : width;

  // Function to capture the screenshot
  const captureScreenshot = async () => {
    if (invertedViewRef.current && (paths.length > 0 || currentPath.length > 0)) {
      try {
        // Use type assertion to tell TypeScript that capture exists
        const uri = await (invertedViewRef.current as any).capture({ format: 'png', quality: 0.9, result: 'base64' });
        if (uri) {
          setLatestScreenshot(uri);
        }
      } catch (error) {
        console.error('Failed to capture screenshot:', error);
      }
    }
  };

  // Set up interval to capture screenshots during drawing
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isDrawing) {
      intervalId = setInterval(captureScreenshot, captureInterval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDrawing, captureInterval]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
        setIsDrawing(true);
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath(prevPath => [...prevPath, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        if (currentPath.length > 0) {
          setPaths(prevPaths => [
            ...prevPaths,
            {
              id: Date.now().toString(),
              points: currentPath,
              color: strokeColor,
              strokeWidth,
            },
          ]);
          setCurrentPath([]);
          setIsDrawing(false);
          
          // Take a screenshot when drawing is complete
          captureScreenshot();
        }
      },
    })
  ).current;

  const getSvgPathFromPoints = (points: Point[]) => {
    if (points.length === 0) return '';
    
    const start = points[0];
    let path = `M ${start.x} ${start.y}`;
    
    points.forEach((point, index) => {
      if (index > 0) {
        path += ` L ${point.x} ${point.y}`;
      }
    });
    
    return path;
  };

  const clearDrawing = () => {
    setPaths([]);
    setCurrentPath([]);
    setLatestScreenshot(null);
    setIsDrawing(false);
  };

  // Create the original drawing component
  const renderDrawing = (inverted = false) => {
    const backgroundColor = inverted ? 'white' : 'black';
    const lineColor = inverted ? 'black' : strokeColor;
    
    const drawingContent = (
      <Svg width="100%" height="100%">
        {paths.map(path => (
          <SvgPath
            key={path.id}
            d={getSvgPathFromPoints(path.points)}
            stroke={inverted ? 'black' : path.color}
            strokeWidth={path.strokeWidth}
            fill="none"
          />
        ))}
        {currentPath.length > 0 && (
          <SvgPath
            d={getSvgPathFromPoints(currentPath)}
            stroke={inverted ? 'black' : strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        )}
      </Svg>
    );
    
    if (inverted) {
      return (
        <ViewShot 
          ref={invertedViewRef} 
          options={{ format: 'png', quality: 0.9, result: 'base64' }}>
          <View 
            style={[
              styles.drawingContainer, 
              { width: drawingWidth, height, backgroundColor }
            ]}
          >
            {drawingContent}
          </View>
        </ViewShot>
      );
    }
    
    return (
      <View 
        style={[
          styles.drawingContainer, 
          { width: drawingWidth, height, backgroundColor }
        ]} 
        {...panResponder.panHandlers}
        ref={box}
      >
        {drawingContent}
      </View>
    );
  };

  // Render the latest screenshot
  const renderLatestScreenshot = () => {
    if (!latestScreenshot) return null;
    
    return (
      <View style={styles.screenshotContainer}>
        <Image
          source={{ 
            uri: latestScreenshot.startsWith('data:') 
              ? latestScreenshot 
              : `data:image/png;base64,${latestScreenshot}` 
          }}
          style={[
            styles.screenshot,
            { width: width / 2, height: height / 2 }
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.container, { width: containerWidth }]}>
        {renderDrawing(false)}
        {showInverted && renderDrawing(true)}
      </View>
      {renderLatestScreenshot()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  drawingContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  screenshotContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  screenshot: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  }
});

export default DrawingBox;
