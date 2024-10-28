import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IconButton, useTheme, ProgressBar } from "react-native-paper";
import { useModuleStore } from "../../store/moduleStore";
import SlideRenderer from "../../components/slides/SlideRenderer";
import BottomBarNav from "@/components/navigation/BottomBarNav";
import ScreenWrapper from "@/components/screens/ScreenWrapper";

export default function ModuleDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getModuleById, currentModule, currentSlideIndex, discoveredSlides } =
    useModuleStore();
  const theme = useTheme();

  useEffect(() => {
    getModuleById(Number(id));
  }, [id]);

  if (!currentModule) {
    return null;
  }

  const handleCheck = () => {
    // TODO: Implement check functionality
    console.log("Check button pressed");
  };

  const handleClose = () => {
    router.back();
  };

  const progress =
    discoveredSlides.filter(Boolean).length / currentModule.slides.length;

  return (
    <ScreenWrapper>
      <View style={styles.topNavigation}>
        <IconButton
          icon="close"
          size={20}
          onPress={handleClose}
          style={styles.closeButton}
        />
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </View>
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
  container: {
    flex: 1,
  },
  topNavigation: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 40,
  },
  closeButton: {
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
  },
  slideWrapper: {
    flex: 1,
  },
});
