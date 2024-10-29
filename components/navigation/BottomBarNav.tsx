import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Button } from "react-native-paper";
import { useModuleStore } from "@/store/moduleStore";
import { useAudioStore } from "@/store/audioStore";
import styles from "@/styles/styles";
import CustomNavMenu from "../CustomNavMenu";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

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

  return (
    <View style={localStyles.container}>
      <View ref={menuRef}>
        <CustomNavMenu
          visible={menuVisible}
          onDismiss={handleDismissMenu}
          onShowCaptions={handleShowCaptions}
          onExplanation={handleExplanation}
          onReportProblem={handleReportProblem}
        />
      </View>
      <View style={styles.bottomNavigation}>
        <IconButton
          icon="chevron-left"
          size={18}
          onPress={()=>{previousSlide(); handleDismissMenu();}}
          disabled={currentSlideIndex === 0}
          style={styles.navButton}
          mode="contained"
          iconColor="#000"
          theme={{
            colors: {
              surfaceVariant: "rgb(244, 187, 98)",
              surfaceDisabled: "rgba(244, 187, 98, 0.3)",
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
          onPress={()=>{handleCheck(); handleDismissMenu();}}
          style={[styles.checkButton]}
          dark={false}
          contentStyle={{ height: 28, margin: 0 }}
          theme={{
            colors: {
              primary: "rgb(217, 240, 251)",
              surfaceDisabled: "rgba(217, 240, 251, 0.3)",
            },
          }}
        >
          Check
        </Button>
        <VerticalSeparator />

        <IconButton
          icon="chevron-right"
          size={18}
          onPress={()=>{nextSlide(); handleDismissMenu();}}
          disabled={isLastSlide}
          style={styles.navButton}
          iconColor="#000"
          mode="contained"
          theme={{
            colors: {
              surfaceVariant: "rgb(244, 187, 98)",
              surfaceDisabled: "rgba(244, 187, 98, 0.3)",
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
});

export default BottomBarNav;

function VerticalSeparator() {
  return <View style={styles.verticalSeparator} />;
}
