import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

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
  const translateX = useSharedValue(
    isInitialRender ? 0 : (direction === 'forward' ? 1000 : -1000)
  );

  useEffect(() => {
    if (direction !== null && !isInitialRender) {
      // Reset position before animating in
      translateX.value = direction === 'forward' ? 1000 : -1000;
      
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [direction, isInitialRender]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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