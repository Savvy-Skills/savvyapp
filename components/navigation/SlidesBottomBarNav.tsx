import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Button } from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import CustomNavMenu from "../CustomNavMenu";
import { hexToRgbA } from "@/utils/utilfunctions";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { Colors } from "@/constants/Colors";
import { FeedbackModal } from "../FeedbackModal";
import ConfirmationDialog from "../ConfirmationDialog";
import { router } from "expo-router";

function generateColors(color: string, opacity: number) {
  let rgba = color.startsWith("#") ? hexToRgbA(color) : color;
  const color1 = rgba.replace(/[^,]+(?=\))/, "1");
  const color2 = rgba.replace(/[^,]+(?=\))/, opacity.toString());
  return { normal: color1, disabled: color2 };
}

const navButtonColors = generateColors("#f4bb62", 0.5);
const checkButtonColors = generateColors("#d9f0fb", 0.5);

type BottomBarNavProps = {
  onShowTopSheet: () => void;
};

const BottomBarNav = ({ onShowTopSheet }: BottomBarNavProps) => {
  const {
    previousSlide,
    currentLesson,
    currentSlideIndex,
    nextSlide,
    submitAssessment,
    isCurrentSlideSubmittable,
    isNavMenuVisible,
    setNavMenuVisible,
    completedSlides,
    showIncorrect,
    restartLesson,
  } = useCourseStore();

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [showRestartLessonDialog, setShowRestartLessonDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const showFeedbackModal = () => setFeedbackModalVisible(true);

  const showRestartDialog = () => {
    setShowRestartLessonDialog(true);
  };
  const hideRestartDialog = () => {
    setShowRestartLessonDialog(false);
  };

  let currentAssessmentID = undefined;

  const isLastSlide =
    currentLesson && currentSlideIndex === currentLesson.slides.length - 1;
  if (currentLesson?.slides[currentSlideIndex].type === "Assessment") {
    currentAssessmentID =
      currentLesson?.slides[currentSlideIndex].assessment_id;
  }
  const currentSlide = currentLesson?.slides[currentSlideIndex];

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

  const isCurrentSlideCompleted = completedSlides[currentSlideIndex];

  const handleFinish = useCallback(() => {
    // Implement finish functionality
	setShowFinishDialog(true);
  }, [handleDismissMenu]);

  return (
    <View style={[localStyles.container]}>
      <View style={[localStyles.menusContainer]}>
        <CustomNavMenu
          visible={isNavMenuVisible}
          onDismiss={handleDismissMenu}
          onShowTopSheet={onShowTopSheet}
          showModal={showFeedbackModal}
          onRestart={showRestartDialog}
        />
      </View>
      <View
        style={[
          styles.bottomNavigation,
          styles.centeredMaxWidth,
          localStyles.navMenu,
        ]}
      >
        <IconButton
          icon="arrow-left"
          size={20}
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
          size={20}
          onPress={toggleMenu}
          mode="contained"
          iconColor="#000"
          containerColor="rgb(244, 187, 98)"
          style={styles.navButton}
        />
        {isLastSlide ? (
          <Button
            mode="contained"
            onPress={handleFinish}
            style={[styles.checkButton]}
            labelStyle={localStyles.checkButtonLabel}
            dark={false}
            theme={{
              colors: {
                primary: checkButtonColors.normal,
                surfaceDisabled: checkButtonColors.disabled,
              },
            }}
          >
            FINISH
          </Button>
        ) : showIncorrect ? (
          <Button
            mode="contained"
            disabled
            style={[localStyles.incorrectButton]}
            labelStyle={localStyles.incorrectLabel}
            dark={false}
          >
            INCORRECT
          </Button>
        ) : (
          <>
            {!currentAssessmentID || isCurrentSlideCompleted ? (
              <>
                {currentSlide?.type === "Content" &&
                currentSlide.content_info.type === "Video" ? (
                  <></>
                ) : (
                  <Button
                    mode="contained"
                    disabled={!isCurrentSlideCompleted}
                    onPress={handleNextSlide}
                    style={[styles.checkButton]}
                    labelStyle={localStyles.checkButtonLabel}
                    dark={false}
                    theme={{
                      colors: {
                        primary: checkButtonColors.normal,
                        surfaceDisabled: checkButtonColors.disabled,
                      },
                    }}
                  >
                    NEXT
                  </Button>
                )}
              </>
            ) : (
              <Button
                mode="contained"
                disabled={!isCurrentSlideSubmittable()}
                onPress={handleCheck}
                style={[styles.checkButton]}
                labelStyle={localStyles.checkButtonLabel}
                dark={false}
                theme={{
                  colors: {
                    primary: checkButtonColors.normal,
                    surfaceDisabled: checkButtonColors.disabled,
                  },
                }}
              >
                CHECK
              </Button>
            )}
          </>
        )}

        <VerticalSeparator />
        <IconButton
          icon="arrow-right"
          size={20}
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
      <FeedbackModal
        visible={feedbackModalVisible}
        onDismiss={() => setFeedbackModalVisible(false)}
        currentLessonInfo={{
          lessonId: currentLesson?.id || 0,
          lessonTitle: currentLesson?.name || "",
          currentIndex: currentSlideIndex,
        }}
        onSubmitFeedback={() => {}}
      />
      <ConfirmationDialog
        visible={showRestartLessonDialog}
        onDismiss={hideRestartDialog}
        onConfirm={restartLesson}
        title="Are you sure?"
        content="This will restart the lesson and you will lose your progress."
      />
      <ConfirmationDialog
        visible={showFinishDialog}
        onDismiss={() => setShowFinishDialog(false)}
        onConfirm={() => {
          if (currentLesson && currentLesson.module_id) {
            router.dismissTo({
              pathname: "/modules/[id]",
              params: { id: currentLesson.module_id },
            });
          }
        }}
        title="Are you sure you want to exit this lesson?"
        content="You can still check you answers later."
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  navMenu: {
    maxWidth: SLIDE_MAX_WIDTH,
  },
  container: {
    position: "relative",
    paddingHorizontal: 8,
    marginVertical: 10,
  },
  menusContainer: {
    position: "absolute",
    bottom: 80,
    gap: 16,
    maxWidth: 300,
    alignSelf: "center",
    zIndex: 2,
  },
  checkButtonLabel: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  incorrectLabel: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    color: Colors.light.orange,
  },
  incorrectButton: {
    flex: 1,
    backgroundColor: "#ffe7cc",
    borderRadius: 4,
  },
});

export default BottomBarNav;

function VerticalSeparator() {
  return <View style={styles.verticalSeparator} />;
}
