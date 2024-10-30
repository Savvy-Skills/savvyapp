import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IconButton, useTheme } from "react-native-paper";
import { useModuleStore } from "../../store/moduleStore";
import SlideRenderer from "../../components/slides/SlideRenderer";
import BottomBarNav from "@/components/navigation/BottomBarNav";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import TopNavBar from "@/components/navigation/TopNavBar";

export default function ModuleDetail() {
  const { id } = useLocalSearchParams();

  const { getModuleById, currentModule, currentSlideIndex } = useModuleStore();

  useEffect(() => {
    getModuleById(Number(id));
  }, [id]);

  if (!currentModule) {
    return null;
  }

  return (
    <ScreenWrapper>
      <TopNavBar />
      {currentModule.slides.map((slide, index) => (
        <View
          key={slide.slide_id}
          style={[
            styles.slideWrapper,
            { display: index === currentSlideIndex ? "flex" : "none" },
          ]}
        >
          <SlideRenderer slide={slide} index={index} />
        </View>
      ))}
      <BottomBarNav />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  slideWrapper: {
    flex: 1,
  },
});
