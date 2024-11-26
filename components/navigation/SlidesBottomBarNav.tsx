import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Button } from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import { useAudioStore } from "@/store/audioStore";
import styles from "@/styles/styles";
import CustomNavMenu from "../CustomNavMenu";
import { hexToRgbA } from "@/utils/utilfunctions";

function generateColors(color: string, opacity: number) {
  let rgba = color.startsWith("#") ? hexToRgbA(color) : color;
  const color1 = rgba.replace(/[^,]+(?=\))/, "1");
  const color2 = rgba.replace(/[^,]+(?=\))/, opacity.toString());
  return { normal: color1, disabled: color2 };
}

const navButtonColors = generateColors("#f4bb62", 0.5);
const checkButtonColors = generateColors("#d9f0fb", 0.5);

const BottomBarNav = () => {
  const {
    previousSlide,
    currentLesson,
    currentSlideIndex,
    nextSlide,
    submitAssessment,
    isCurrentSlideSubmittable,
    isNavMenuVisible,
    setNavMenuVisible,
  } = useCourseStore();

  const { playSound } = useAudioStore();

  let currentAssessmentID = undefined;

  const isLastSlide =
    currentLesson && currentSlideIndex === currentLesson.slides.length - 1;
  if (currentLesson?.slides[currentSlideIndex].type === "Assessment") {
    currentAssessmentID = currentLesson?.slides[currentSlideIndex].question_id;
  }

  const handleCheck = useCallback(() => {
    if (currentAssessmentID !== undefined) {
      submitAssessment(currentAssessmentID);
    }
  }, [currentAssessmentID, submitAssessment]);

  const toggleMenu = useCallback(
    () => setNavMenuVisible(!isNavMenuVisible),
    [isNavMenuVisible, setNavMenuVisible]
  );

  const handleDismissMenu = useCallback(
    () => setNavMenuVisible(false),
    [setNavMenuVisible]
  );

  const handleShowCaptions = useCallback(() => {
    // Implement show captions functionality
    handleDismissMenu();
  }, [handleDismissMenu]);

  const handleExplanation = useCallback(() => {
    // Implement explanation functionality
    handleDismissMenu();
  }, [handleDismissMenu]);

  const handleReportProblem = useCallback(() => {
    // Implement report problem functionality
    handleDismissMenu();
  }, [handleDismissMenu]);

  const handlePreviousSlide = useCallback(() => {
    previousSlide();
    handleDismissMenu();
  }, [previousSlide, handleDismissMenu]);

  const handleNextSlide = useCallback(() => {
    nextSlide();
    handleDismissMenu();
  }, [nextSlide, handleDismissMenu]);

  return (
    <View style={localStyles.container}>
      <View style={localStyles.menusContainer}>
        <CustomNavMenu
          visible={isNavMenuVisible}
          onDismiss={handleDismissMenu}
          onShowCaptions={handleShowCaptions}
          onExplanation={handleExplanation}
          onReportProblem={handleReportProblem}
        />
      </View>
      <View style={styles.bottomNavigation}>
        <IconButton
          icon="arrow-left"
          size={18}
          onPress={handlePreviousSlide}
          disabled={currentSlideIndex === 0}
          style={styles.navButton}
          mode="contained"
          iconColor="#000"
          theme={{
            colors: {
              surfaceVariant: navButtonColors.normal,
              surfaceDisabled: navButtonColors.disabled,
            },
          }}
        />
        <VerticalSeparator />
        <IconButton
          icon="dots-vertical"
          size={18}
          onPress={toggleMenu}
          mode="contained"
          iconColor="#000"
          containerColor="rgb(244, 187, 98)"
          style={styles.navButton}
        />
        <Button
          icon="check"
          mode="contained"
          disabled={!isCurrentSlideSubmittable()}
          onPress={handleCheck}
          style={[styles.checkButton]}
          contentStyle={{ height: 28 }}
          labelStyle={{ fontSize: 14, lineHeight: 14 }}
          dark={false}
          theme={{
            colors: {
              primary: checkButtonColors.normal,
              surfaceDisabled: checkButtonColors.disabled,
            },
          }}
        >
          Check
        </Button>
        <VerticalSeparator />
        <IconButton
          icon="arrow-right"
          size={18}
          onPress={handleNextSlide}
          disabled={isLastSlide}
          style={styles.navButton}
          iconColor="#000"
          mode="contained"
          theme={{
            colors: {
              surfaceVariant: navButtonColors.normal,
              surfaceDisabled: navButtonColors.disabled,
            },
          }}
        />
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    position: "relative",
  },
  menusContainer: {
    position: "absolute",
    bottom: 80,
    gap: 16,
    maxWidth: 300,
    alignSelf: "center",
    zIndex: 2,
  },
});

export default BottomBarNav;

function VerticalSeparator() {
  return <View style={styles.verticalSeparator} />;
}
