import { useEffect, useRef, useState } from 'react';
import { View, ViewStyle } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';
import styles from '@/styles/styles';

type AnimationConfig = {
  source: AnimationObject;
  inactiveStartFrame: number;
};

type AnimatedComponentProps = {
  triggerAnimation: boolean;
  animationConfig: AnimationConfig;
  containerStyle?: ViewStyle;
};

const AnimatedLottieComponent = ({
  triggerAnimation,
  animationConfig,
  containerStyle,
}: AnimatedComponentProps) => {
  const animationRef = useRef<LottieView>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!animationRef.current || !isLoaded) return;

    const {inactiveStartFrame } = animationConfig;

    if (triggerAnimation) {
      animationRef.current.play(0);
    } else {
      animationRef.current.play(inactiveStartFrame);
    }
  }, [triggerAnimation, isLoaded, animationConfig]);

  return (
    <View style={[
      { 
        opacity: isLoaded ? 1 : 0
      },
	  styles.lottieContainer,
      containerStyle,
    ]}>
      <LottieView
        ref={animationRef}
        source={animationConfig.source}
        autoPlay={false}
        loop={false}
        onLayout={() => setIsLoaded(true)}
		webStyle={{ width: '250%', height: '250%' }}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
};

export default AnimatedLottieComponent;