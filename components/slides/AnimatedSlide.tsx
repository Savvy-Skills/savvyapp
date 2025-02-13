import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, Easing } from 'react-native';

interface AnimatedSlideProps {
  children: React.ReactNode;
  direction: 'forward' | 'backward' | null;
  isInitialRender: boolean;
}

const AnimatedSlide: React.FC<AnimatedSlideProps> = ({ 
  children, 
  direction,
  isInitialRender 
}) => {
  const translateX = useRef(new Animated.Value(
    isInitialRender ? 0 : (direction === 'forward' ? 1000 : -1000)
  )).current;

  useEffect(() => {
    if (direction !== null && !isInitialRender) {
      // Reset position before animating in
      translateX.setValue(direction === 'forward' ? 1000 : -1000);
      
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    }
  }, [direction, isInitialRender]);

  const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
    transform: [{ translateX }],
  };

  return (
    <Animated.View 
      style={[
        styles.slide, 
        animatedStyle,
        // Ensure inactive slides don't interfere with interactions
      ]}
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