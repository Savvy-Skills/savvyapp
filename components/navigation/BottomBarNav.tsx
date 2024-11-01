import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Button, Text } from "react-native-paper";
import { useModuleStore } from "@/store/moduleStore";
import { useAudioStore } from "@/store/audioStore";
import styles from "@/styles/styles";
import CustomNavMenu from "../CustomNavMenu";
import { hexToRgbA } from "@/utils/utilfunctions";

function generateColors(color: string, opacity: number) {
  // Color can be hex, rgb, or rgba, and opacity is a number between 0 and 1, return object with rgba values of first color with full opacity and second color with specified opacity
  // Example: generateColors("#FF0000", 0.5) => { color1: "rgba(255, 0, 0, 1)", color2: "rgba(255, 0, 0, 0.5)" }
  let rgba: string;
  if (color[0] === "#") {
    rgba = hexToRgbA(color);
  } else {
    rgba = color;
  }
  const color1 = rgba.replace(/[^,]+(?=\))/, "1");
  const color2 = rgba.replace(/[^,]+(?=\))/, opacity.toString());

  return { normal: color1, disabled: color2 };
}

const navButtonColors = generateColors("#f4bb62", 0.5);
const checkButtonColors = generateColors("#d9f0fb", 0.5);

const BottomBarNav = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null as any);

  const {
    previousSlide,
    currentModule,
    currentSlideIndex,
    nextSlide,
    submittableStates,
    correctnessStates,
    submittedAssessments,
    setSubmittedAssessments,
    checkSlideCompletion,
  } = useModuleStore();

  const { playSound } = useAudioStore();

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (
        menuVisible &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuVisible(false);
      }
    };

    if (menuVisible) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [menuVisible]);

  const isLastSlide =
    currentModule && currentSlideIndex === currentModule.slides.length - 1;
  const isCurrentSlideCorrect = correctnessStates[currentSlideIndex] || false;
  const currentAssessmentID =
    currentModule?.slides[currentSlideIndex].type === "Assessment"
      ? currentModule.slides[currentSlideIndex].question_id
      : -1;
  const submission = submittedAssessments.find(
    (submission) => submission.question_id === currentAssessmentID
  );
  const isCurrentSlideSubmittable =
    submittableStates[currentSlideIndex] &&
    (!submission || !submission.correct);

  const handleCheck = () => {
    const newSubmission = {
      question_id: currentAssessmentID,
      correct: isCurrentSlideCorrect,
      answers: [],
    };

    const newSubmissions = submission
      ? submittedAssessments.map((sub) =>
          sub.question_id === currentAssessmentID ? newSubmission : sub
        )
      : [...submittedAssessments, newSubmission];

    setSubmittedAssessments(newSubmissions);

    playSound(isCurrentSlideCorrect ? "success" : "failure");
    if (isCurrentSlideCorrect) {
      checkSlideCompletion();
    }
  };

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handleDismissMenu = () => {
    setMenuVisible(false);
  };

  const handleShowCaptions = () => {
    // Implement show captions functionality
    handleDismissMenu();
  };

  const handleExplanation = () => {
    // Implement explanation functionality
    handleDismissMenu();
  };

  const handleReportProblem = () => {
    // Implement report problem functionality
    handleDismissMenu();
  };

  const isCurrentSlideAssessment =
    currentModule?.slides[currentSlideIndex].type === "Assessment";
  const showFeedback = isCurrentSlideAssessment && submission;
  const isCurrentSubmissionCorrect = submission?.correct || false;

  return (
    <View style={localStyles.container}>
      <View ref={menuRef} style={localStyles.menusContainer}>
        <CustomNavMenu
          visible={menuVisible}
          onDismiss={handleDismissMenu}
          onShowCaptions={handleShowCaptions}
          onExplanation={handleExplanation}
          onReportProblem={handleReportProblem}
        />
        {showFeedback && (
          <View
            style={[
              localStyles.feedbackContainer,
              isCurrentSubmissionCorrect
                ? localStyles.correctContainer
                : localStyles.incorrectContainer,
            ]}
          >
            <Text
              style={[
                localStyles.feedbackText,
                isCurrentSubmissionCorrect
                  ? localStyles.correctFeedback
                  : localStyles.incorrectFeedback,
              ]}
            >
              {isCurrentSubmissionCorrect
                ? "Correct!"
                : "Incorrect. Try again!"}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.bottomNavigation}>
        <IconButton
          icon="chevron-left"
          size={18}
          onPress={() => {
            previousSlide();
            handleDismissMenu();
          }}
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
          disabled={!isCurrentSlideSubmittable}
          onPress={() => {
            handleCheck();
            handleDismissMenu();
          }}
          style={[styles.checkButton]}
          dark={false}
          contentStyle={{ height: 28, margin: 0 }}
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
          icon="chevron-right"
          size={18}
          onPress={() => {
            nextSlide();
            handleDismissMenu();
          }}
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
	width: "100%",
    bottom: 70,
    gap: 16,
	maxWidth: 280,
	left: "50%",
	transform: "translateX(-50%)",
  },
  feedbackContainer: {
	flex: 1,
	maxWidth: 280, // Limit width to 600px
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: "#FFEBEE",
  },
  correctContainer: {
    backgroundColor: "#C8E6C9",
    borderColor: "#4CAF50",
  },
  incorrectContainer: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
  },
  correctFeedback: {
    color: "#4CAF50",
  },
  incorrectFeedback: {
    color: "#F44336",
  },
  feedbackText: {
    fontWeight: "bold",
  },
});

export default BottomBarNav;

function VerticalSeparator() {
  return <View style={styles.verticalSeparator} />;
}
