import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useModuleStore } from "../../store/moduleStore";
import SlideRenderer from "../../components/slides/SlideRenderer";
import BottomBarNav from "@/components/navigation/BottomBarNav";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import TopNavBar from "@/components/navigation/TopNavBar";
import AnimatedSlide from "@/components/slides/AnimatedSlide";

export default function ModuleDetail() {
  const { id } = useLocalSearchParams();
  const { 
    getModuleById, 
    currentModule, 
    currentSlideIndex, 
    isNavMenuVisible, 
    setNavMenuVisible 
  } = useModuleStore();
  const [direction, setDirection] = useState<"forward" | "backward" | null>(null);
  const prevIndexRef = useRef(currentSlideIndex);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    getModuleById(Number(id));
  }, [id]);

  useEffect(() => {
    if (currentSlideIndex !== prevIndexRef.current) {
      setDirection(
        currentSlideIndex > prevIndexRef.current ? "forward" : "backward"
      );
      prevIndexRef.current = currentSlideIndex;
      setIsInitialRender(false);
    }
  }, [currentSlideIndex]);

  const handlePressOutside = () => {
    if (isNavMenuVisible) {
      setNavMenuVisible(false);
    }
  };

  if (!currentModule) {
    return null;
  }

  return (
    <ScreenWrapper>
      <Pressable style={styles.pressableArea} onPress={handlePressOutside}>
        <TopNavBar />
        <View style={styles.slidesContainer}>
          {currentModule.slides.map((slide, index) => (
            <AnimatedSlide
              key={`${slide.slide_id}-${index}`}
              isActive={index === currentSlideIndex}
              direction={index === currentSlideIndex ? direction : null}
              isInitialRender={isInitialRender && index === currentSlideIndex}
            >
              <SlideRenderer slide={slide} index={index} />
            </AnimatedSlide>
          ))}
        </View>
      </Pressable>
      <BottomBarNav />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  pressableArea: {
    flex: 1,
	cursor: "auto",
  },
  slidesContainer: {
    flex: 1,
    position: "relative",
  },
});