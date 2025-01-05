import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import SlideRenderer from "../../../components/slides/SlideRenderer";
import BottomBarNav from "@/components/navigation/SlidesBottomBarNav";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import TopNavBar from "@/components/navigation/TopNavBar";
import AnimatedSlide from "@/components/slides/AnimatedSlide";
import { useCourseStore } from "@/store/courseStore";
import { useKeyPress } from "@/hooks/useKeyboard";
import TopSheet, { TopSheetRefProps } from "@/components/TopSheet";
import { ActivityIndicator, FAB, Text } from "react-native-paper";
import SlideListItem from "@/components/slides/SlideListItem";

export default function ModuleDetail() {
  const ref = useRef<TopSheetRefProps>(null);

  const { id } = useLocalSearchParams();
  const {
    getLessonById,
    currentLesson,
    currentSlideIndex,
    isNavMenuVisible,
    setNavMenuVisible,
    clearCurrentLesson,
    nextSlide,
    previousSlide,
    setCurrentSlideIndex,
    restartingLesson,
    stopRestartingLesson,
    completedSlides,
  } = useCourseStore();
  const [direction, setDirection] = useState<"forward" | "backward" | null>(
    null
  );
  const prevIndexRef = useRef(currentSlideIndex);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  const onPress = useCallback(() => {
    ref?.current?.scrollToEnd();
  }, []);


  useEffect(() => {
    clearCurrentLesson();
    getLessonById(Number(id));
  }, [id]);

  useEffect(() => {
    if (restartingLesson) {
      clearCurrentLesson();
      getLessonById(Number(id));
      stopRestartingLesson();
    }
  }, [restartingLesson]);

  const handleArrowRight = () => {
    if (currentLesson && currentSlideIndex < currentLesson.slides.length - 1) {
      nextSlide();
    }
  };
  const handleArrowLeft = () => {
    if (currentSlideIndex > 0) {
      previousSlide();
    }
  };

  if (Platform.OS === "web") {
    useKeyPress({
      ArrowRight: () => handleArrowRight(),
      ArrowLeft: () => handleArrowLeft(),
    });
  }

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

  if (!currentLesson) {
    return null;
  }


  return (
    <ScreenWrapper style={{ overflow: "hidden" }}>
      <Pressable style={[styles.pressableArea]} onPress={handlePressOutside}>
        <TopNavBar />
        {restartingLesson ? (
          <ActivityIndicator size={64} style={{ flex: 1 }}></ActivityIndicator>
        ) : (
          <>
            <TopSheet ref={ref}>
              <ScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>
                {currentLesson.slides.map((slide, index) => (
                  <SlideListItem
                    key={`slide-${slide.slide_id}-${index}`}
                    name={slide.name}
                    type={slide.type}
                    subtype={
                      slide.type === "Assessment"
                        ? slide.assessment_info?.type
                        : slide.type === "Content"
                        ? slide.content_info?.type
                        : undefined
                    }
                    isCompleted={completedSlides[index]}
                    isActive={index === currentSlideIndex}
                    onPress={() => setCurrentSlideIndex(index)}
                  />
                ))}
              </ScrollView>
            </TopSheet>
            <View style={styles.slidesContainer}>
              {currentLesson.slides.map((slide, index) => (
                <AnimatedSlide
                  key={`${slide.slide_id}-${index}`}
                  isActive={index === currentSlideIndex}
                  direction={index === currentSlideIndex ? direction : null}
                  isInitialRender={
                    isInitialRender && index === currentSlideIndex
                  }
                >
                  <SlideRenderer
                    slide={slide}
                    index={index}
                    quizMode={currentLesson.quiz}
                  />
                </AnimatedSlide>
              ))}
            </View>
            <BottomBarNav onShowTopSheet={onPress} />
          </>
        )}
      </Pressable>
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
  fab: {
    position: "absolute",
    margin: 8,
    right: 0,
    bottom: 68,
  },
});
