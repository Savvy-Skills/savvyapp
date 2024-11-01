import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, Easing } from 'react-native';

interface AnimatedSlideProps {
  children: React.ReactNode;
  isActive: boolean;
  direction: 'forward' | 'backward' | null;
  isInitialRender: boolean;
}

const AnimatedSlide: React.FC<AnimatedSlideProps> = ({ 
  children, 
  isActive, 
  direction,
  isInitialRender 
}) => {
  const translateX = useRef(new Animated.Value(
    isInitialRender ? 0 : (direction === 'forward' ? 1000 : -1000)
  )).current;
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    if (isActive && direction !== null && !isInitialRender) {
      // Reset position before animating in
      translateX.setValue(direction === 'forward' ? 1000 : -1000);
      
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!isActive) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, direction, isInitialRender]);

  const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
    transform: [{ translateX }],
    opacity,
  };

  return (
    <Animated.View 
      style={[
        styles.slide, 
        animatedStyle,
        // Ensure inactive slides don't interfere with interactions
        !isActive && styles.inactive
      ]}
      pointerEvents={isActive ? "auto" : "none"}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // Ensure proper stacking of slides
    zIndex: 1,
  },
  inactive: {
    // Completely remove from interaction layer when inactive
    zIndex: 0,
    pointerEvents: 'none',
  },
});

export default AnimatedSlide;