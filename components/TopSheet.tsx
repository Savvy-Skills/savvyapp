import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useImperativeHandle } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { Colors } from "@/constants/Colors";
import { Button, IconButton } from "react-native-paper";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_TRANSLATE_Y = SCREEN_HEIGHT - 10;

export type TopSheetProps = {
  children?: React.ReactNode;
};

export type TopSheetRefProps = {
  scrollTo: (destination: number) => void;
  scrollToEnd: () => void;
};

const TopSheet = React.forwardRef<TopSheetRefProps, TopSheetProps>(
  ({ children }, ref) => {
    const translateY = useSharedValue(0);
    const context = useSharedValue({
      y: 0,
    });
    const scrollTo = useCallback((destination: number) => {
      translateY.value = withSpring(destination, {
        reduceMotion: ReduceMotion.Never,
        damping: 50,
      });
    }, []);

    const scrollToEnd = useCallback(() => {
      translateY.value = withSpring(MAX_TRANSLATE_Y, {
        reduceMotion: ReduceMotion.Never,
        damping: 50,
      });
    }, []);

    useImperativeHandle(ref, () => ({ scrollTo, scrollToEnd }), [
      scrollTo,
      scrollToEnd,
    ]);

    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.min(translateY.value, MAX_TRANSLATE_Y);
      })
      .onEnd(() => {
        if (translateY.value < SCREEN_HEIGHT / 3.5) {
          scrollTo(0);
        } else if (translateY.value > SCREEN_HEIGHT / 1.5) {
          scrollTo(MAX_TRANSLATE_Y);
        }
      });

    const rTopSheetStyle = useAnimatedStyle(() => {
      const borderRadius = interpolate(
        translateY.value,
        [100, MAX_TRANSLATE_Y - 10],
        [25, 5],
        Extrapolation.CLAMP
      );
      return {
        borderBottomEndRadius: borderRadius,
        borderBottomStartRadius: borderRadius,
        transform: [{ translateY: translateY.value }],
      };
    }, [translateY.value, MAX_TRANSLATE_Y]);

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.topSheetContainer, rTopSheetStyle]}>
          <View style={styles.line}></View>
          <IconButton
		  	size={24}
			onPress={() => scrollTo(0)}
			style={{
				alignSelf: "flex-end",
			}}
			iconColor={Colors.primary}
		  	icon={"chevron-double-up"}
		  ></IconButton>
          {/* Children */}
          {children}
          {/* Button to close topsheed */}
        </Animated.View>
      </GestureDetector>
    );
  }
);

export default TopSheet;

const styles = StyleSheet.create({
  list: {},
  topSheetContainer: {
    zIndex: 2,
    height: SCREEN_HEIGHT,
    width: "100%",
    maxWidth: SLIDE_MAX_WIDTH,
    marginHorizontal: "auto",
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    boxShadow: "0 1px 1.5px rgba(0, 0, 0, 0.2)",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: -2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    position: "absolute",
    bottom: SCREEN_HEIGHT,
    flexDirection: "column-reverse",
    borderBottomEndRadius: 25,
    borderBottomStartRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 80,
    gap: 16,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 10,
  },
});
